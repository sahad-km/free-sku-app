import { connectMongoose } from "../../db.mongoose.server";
import GeneratedSku from "../../models/GeneratedSku.server";
import { updateGenerationRunProgress } from "./generationJobService";
import { resolveSkuSelection } from "./skuSelectionService";
import { generateSkuForVariant } from "./skuGeneratorService";

/**
 * Shopify Bulk Operations API Service
 * Enables zero-rate-limit batch mutations for massive catalogs (1,000 to 100,000+ variants).
 */

const BULK_VARIANT_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product { id }
      productVariants { id sku }
      userErrors { field message code }
    }
  }
`;

/**
 * 1. Create Staged Upload URL on Shopify
 */
export async function createStagedUpload(admin) {
  const response = await admin.graphql(`
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: [
        {
          resource: "BULK_MUTATION_VARIABLES",
          filename: `bulk_sku_update_${Date.now()}.jsonl`,
          mimeType: "text/jsonl",
          httpMethod: "POST",
        },
      ],
    },
  });

  const json = await response.json();
  const target = json?.data?.stagedUploadsCreate?.stagedTargets?.[0];
  const userErrors = json?.data?.stagedUploadsCreate?.userErrors || [];

  if (userErrors.length > 0 || !target) {
    throw new Error(`Staged Upload failed: ${userErrors.map((e) => e.message).join("; ")}`);
  }

  return target;
}

/**
 * 2. Upload JSONL text to Shopify Presigned S3/GCS URL
 */
export async function uploadJsonlToStagedUrl(stagedTarget, jsonlContent) {
  const formData = new FormData();
  
  stagedTarget.parameters.forEach((param) => {
    formData.append(param.name, param.value);
  });

  const blob = new Blob([jsonlContent], { type: "text/jsonl" });
  formData.append("file", blob, "bulk_sku_update.jsonl");

  const uploadRes = await fetch(stagedTarget.url, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok && uploadRes.status !== 201) {
    const errText = await uploadRes.text();
    throw new Error(`Failed to upload JSONL to staged URL (Status ${uploadRes.status}): ${errText}`);
  }

  const keyParam = stagedTarget.parameters.find((p) => p.name === "key");
  return keyParam ? keyParam.value : stagedTarget.resourceUrl;
}

/**
 * 3. Trigger Bulk Operation Mutation on Shopify
 */
export async function runBulkOperationMutation(admin, stagedUploadPath) {
  const response = await admin.graphql(`
    mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
      bulkOperationRunMutation(
        mutation: $mutation,
        stagedUploadPath: $stagedUploadPath
      ) {
        bulkOperation {
          id
          status
          createdAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      mutation: BULK_VARIANT_MUTATION,
      stagedUploadPath,
    },
  });

  const json = await response.json();
  const bulkOp = json?.data?.bulkOperationRunMutation?.bulkOperation;
  const userErrors = json?.data?.bulkOperationRunMutation?.userErrors || [];

  if (userErrors.length > 0 || !bulkOp) {
    throw new Error(`Bulk Operation mutation trigger failed: ${userErrors.map((e) => e.message).join("; ")}`);
  }

  return bulkOp;
}

/**
 * 4. Poll Active Bulk Operation Status
 */
export async function pollBulkOperationStatus({ admin, bulkOperationId, runId, totalVariants }) {
  let isCompleted = false;
  let attempts = 0;
  const maxAttempts = 600;

  while (!isCompleted && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const response = await admin.graphql(`
      query getBulkOpStatus($id: ID!) {
        node(id: $id) {
          ... on BulkOperation {
            id
            status
            errorCode
            objectCount
            fileSize
            url
            partialDataUrl
          }
        }
      }
    `, {
      variables: { id: bulkOperationId },
    });

    const json = await response.json();
    const node = json?.data?.node;

    if (!node) continue;

    const status = node.status;
    const processedCount = parseInt(node.objectCount || "0", 10);

    await updateGenerationRunProgress({
      runId,
      processed: Math.min(processedCount, totalVariants),
      successful: status === "COMPLETED" ? totalVariants : Math.min(processedCount, totalVariants),
      failed: status === "FAILED" ? totalVariants : 0,
      skipped: 0,
      status: status === "COMPLETED" ? "Completed" : status === "FAILED" ? "Failed" : "PROCESSING",
      errorSummary: status === "FAILED" ? `Shopify Bulk Operation Error: ${node.errorCode || "FAILED"}` : "",
    });

    if (status === "COMPLETED" || status === "FAILED" || status === "CANCELED") {
      isCompleted = true;
      return {
        status,
        errorCode: node.errorCode,
        resultUrl: node.url,
        processedCount,
      };
    }
  }

  throw new Error("Bulk Operation polling timed out after 60 minutes");
}

/**
 * Main High-Scale Bulk Operations API Orchestrator
 */
export async function executeShopifyBulkOperationRun({
  admin,
  session,
  selection = {},
  skuConfiguration = {},
  ruleName = "Manual SKU Run",
  runId,
  totalVariants,
  startSeqNum,
}) {
  const shopDomain = session?.shop;
  await connectMongoose();

  console.log(`[BulkOps Engine] Starting Shopify Bulk Operation for run ${runId} (${totalVariants} variants)...`);

  const jsonlLines = [];
  const auditRows = [];
  let hasNextPage = true;
  let cursor = null;
  let sequenceIndex = 0;
  const isSequential = skuConfiguration.bodyNumberType === "sequential" || skuConfiguration.bodyNumberType === "continue";
  const incrementStep = skuConfiguration.incrementStep || 1;

  while (hasNextPage) {
    const pageResult = await resolveSkuSelection({
      admin,
      selection,
      cursor,
      limit: 100,
    });

    const { products, pageInfo } = pageResult;
    hasNextPage = pageInfo?.hasNextPage || false;
    cursor = pageInfo?.endCursor || null;

    if (!products || products.length === 0) break;

    products.forEach((product) => {
      const variantsToUpdate = [];

      (product.variants || []).forEach((variant) => {
        const currentSeq = isSequential ? startSeqNum + sequenceIndex * incrementStep : null;
        const genResult = generateSkuForVariant({
          product,
          variant,
          config: skuConfiguration,
          index: sequenceIndex,
          sequenceNumber: currentSeq,
        });

        sequenceIndex++;

        if (genResult.isSkipped) return;

        variantsToUpdate.push({
          id: variant.id,
          sku: genResult.sku,
        });

        auditRows.push({
          shopDomain,
          generationRunId: runId,
          productId: product.id,
          variantId: variant.id,
          productTitleSnapshot: product.title,
          variantTitleSnapshot: variant.title,
          previousSku: variant.sku || "",
          newSku: genResult.sku,
          status: "SUCCESS",
        });
      });

      if (variantsToUpdate.length > 0) {
        jsonlLines.push(
          JSON.stringify({
            input: {
              productId: product.id,
              variants: variantsToUpdate,
            },
          })
        );
      }
    });
  }

  if (jsonlLines.length === 0) {
    await updateGenerationRunProgress({
      runId,
      processed: totalVariants,
      successful: 0,
      skipped: totalVariants,
      status: "Completed",
    });
    return { success: true, count: 0 };
  }

  const jsonlContent = jsonlLines.join("\n");

  console.log(`[BulkOps Engine] Creating staged upload target for ${jsonlLines.length} product JSONL lines...`);
  const stagedTarget = await createStagedUpload(admin);

  console.log(`[BulkOps Engine] Uploading JSONL payload to staged S3/GCS target...`);
  const stagedUploadPath = await uploadJsonlToStagedUrl(stagedTarget, jsonlContent);

  console.log(`[BulkOps Engine] Triggering Shopify bulkOperationRunMutation (stagedUploadPath: ${stagedUploadPath})...`);
  const bulkOp = await runBulkOperationMutation(admin, stagedUploadPath);

  if (auditRows.length > 0) {
    await GeneratedSku.insertMany(auditRows).catch((e) =>
      console.warn("[BulkOps Engine] Audit insert warning:", e.message)
    );
  }

  console.log(`[BulkOps Engine] Polling bulk operation ID: ${bulkOp.id}...`);
  const pollResult = await pollBulkOperationStatus({
    admin,
    bulkOperationId: bulkOp.id,
    runId,
    totalVariants,
  });

  return {
    success: pollResult.status === "COMPLETED",
    bulkOperationId: bulkOp.id,
    processedCount: pollResult.processedCount,
  };
}
