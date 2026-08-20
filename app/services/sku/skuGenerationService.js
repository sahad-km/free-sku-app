import { connectMongoose } from "../../db.mongoose.server";
import GeneratedSku from "../../models/GeneratedSku.server";
import SkuGenerationRun from "../../models/SkuGenerationRun.server";
import { resolveSkuSelection, calculateSelectionScopeCounts } from "./skuSelectionService";
import { generateSkuForVariant } from "./skuGeneratorService";
import { getNextSequenceNumber } from "./skuCounterService";
import { reserveShopCredits, refundShopCredits } from "./skuCreditService";
import { validateSelectionPayload, validateSkuConfigPayload } from "./skuValidationService";
import { validateGenerationEntitlements } from "./skuEntitlementService";
import { createGenerationRunRecord, updateGenerationRunProgress } from "./generationJobService";
import { addSkuGenerationJob } from "../queue/skuQueueService";
import { executeShopifyBulkOperationRun } from "./shopifyBulkOpsService";

/**
 * High-Scale Controlled Concurrency Helper
 * Limits parallel mutation execution to N concurrent workers with delay to prevent Shopify API 429 leaky bucket rate limits.
 */
async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);

    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

/**
 * Delay helper for Shopify GraphQL rate limit throttling
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute streamed batch generation for a chunk of products
 */
async function processProductGroupMutation({ admin, group, shopDomain, runId }) {
  const bulkInput = group.variantsToUpdate.map((v) => ({
    id: v.variantId,
    sku: v.newSku,
  }));

  const auditRows = [];

  try {
    const response = await admin.graphql(`
      mutation bulkUpdateVariants($productId: ID!, $variants: [ProductVariantBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product { id }
          productVariants { id sku }
          userErrors { field message code }
        }
      }
    `, {
      variables: {
        productId: group.productId,
        variants: bulkInput,
      },
    });

    const resJson = await response.json();
    const userErrors = resJson?.data?.productVariantsBulkUpdate?.userErrors || [];

    if (userErrors.length > 0) {
      const errorMsg = userErrors.map((u) => u.message).join("; ");
      group.variantsToUpdate.forEach((v) => {
        auditRows.push({
          shopDomain,
          generationRunId: runId,
          productId: group.productId,
          variantId: v.variantId,
          productTitleSnapshot: group.productTitle,
          variantTitleSnapshot: v.variantTitle,
          previousSku: v.previousSku,
          newSku: v.newSku,
          status: "FAILED",
          errorCode: userErrors[0]?.code || "MUTATION_ERROR",
          errorMessage: errorMsg,
        });
      });
      return { successful: 0, failed: group.variantsToUpdate.length, auditRows };
    }

    group.variantsToUpdate.forEach((v) => {
      auditRows.push({
        shopDomain,
        generationRunId: runId,
        productId: group.productId,
        variantId: v.variantId,
        productTitleSnapshot: group.productTitle,
        variantTitleSnapshot: v.variantTitle,
        previousSku: v.previousSku,
        newSku: v.newSku,
        status: "SUCCESS",
      });
    });

    return { successful: group.variantsToUpdate.length, failed: 0, auditRows };
  } catch (err) {
    group.variantsToUpdate.forEach((v) => {
      auditRows.push({
        shopDomain,
        generationRunId: runId,
        productId: group.productId,
        variantId: v.variantId,
        productTitleSnapshot: group.productTitle,
        variantTitleSnapshot: v.variantTitle,
        previousSku: v.previousSku,
        newSku: v.newSku,
        status: "FAILED",
        errorCode: "GRAPHQL_EXCEPTION",
        errorMessage: err.message,
      });
    });
    return { successful: 0, failed: group.variantsToUpdate.length, auditRows };
  }
}

/**
 * Main SKU Generation Pipeline Engine
 * Handles up to 20,000+ variants safely using streamed cursor traversal, controlled concurrency, and credit reconciliation.
 */
export async function executeSkuGenerationRun({
  admin,
  session,
  selection = {},
  skuConfiguration = {},
  ruleName = "Manual SKU Run",
  idempotencyKey = null,
  existingRunId = null,
}) {
  const shopDomain = session?.shop;
  if (!shopDomain) {
    throw new Error("Unauthorized Shopify session");
  }

  await connectMongoose();

  let runDoc = null;
  let totalVariants = 0;
  let totalProducts = 0;
  let creditsReserved = 0;

  if (existingRunId) {
    // Invoked by Worker Node for an existing queued run
    runDoc = await SkuGenerationRun.findById(existingRunId);
    if (!runDoc) throw new Error(`Generation run ${existingRunId} not found`);
    totalVariants = runDoc.totalVariants;
    totalProducts = runDoc.totalProducts;
    creditsReserved = runDoc.creditsReserved;
  } else {
    // 1. Validate Selection & Config payloads
    const selectionVal = validateSelectionPayload(selection);
    if (!selectionVal.valid) {
      throw new Error(`Invalid Selection: ${selectionVal.error}`);
    }

    const configVal = validateSkuConfigPayload(skuConfiguration);
    if (!configVal.valid) {
      throw new Error(`Invalid SKU Config: ${configVal.error}`);
    }

    // 2. Resolve catalog counts
    const scopeCounts = await calculateSelectionScopeCounts({ admin, selection });
    totalVariants = scopeCounts.totalVariants || 1;
    totalProducts = scopeCounts.totalProducts || 1;

    // 3. Entitlement & plan limit validation
    const entitlementCheck = await validateGenerationEntitlements({ shopDomain, variantCount: totalVariants });
    if (!entitlementCheck.allowed) {
      return {
        success: false,
        errorCode: entitlementCheck.reason,
        message: entitlementCheck.message,
      };
    }

    // 4. Reserve credits atomically
    const creditRes = await reserveShopCredits({ shopDomain, requiredCredits: totalVariants });
    if (!creditRes.success) {
      return {
        success: false,
        errorCode: "INSUFFICIENT_CREDITS",
        message: `Insufficient credits. Required: ${creditRes.requiredCredits}, Available: ${creditRes.availableCredits}`,
        requiredCredits: creditRes.requiredCredits,
        availableCredits: creditRes.availableCredits,
      };
    }

    creditsReserved = creditRes.reservedCredits;

    // 5. Create generation run record
    runDoc = await createGenerationRunRecord({
      shopDomain,
      ruleName,
      selection,
      skuConfiguration,
      totalProducts,
      totalVariants,
      creditsReserved,
      idempotencyKey,
    });
  }

  const runId = runDoc._id.toString();

  // 6. Sequential numbering start sequence reservation
  const isSequential = skuConfiguration.bodyNumberType === "sequential" || skuConfiguration.bodyNumberType === "continue";
  let startSeqNum = skuConfiguration.startNumber || 1;
  const incrementStep = skuConfiguration.incrementStep || 1;

  if (isSequential && !existingRunId) {
    startSeqNum = await getNextSequenceNumber({
      shopDomain,
      counterKey: ruleName || "default",
      startNumber: skuConfiguration.startNumber || 1,
      incrementStep,
      count: totalVariants,
    });
  }

  // 7. Enqueue to BullMQ if Redis Queue is available and not already inside Worker
  if (!existingRunId && totalVariants > 50) {
    const queueRes = await addSkuGenerationJob({
      runId,
      shopDomain,
      selection,
      skuConfiguration,
      ruleName,
      idempotencyKey,
    });

    if (queueRes.isQueue) {
      await updateGenerationRunProgress({ runId, status: "QUEUED" });
      return {
        success: true,
        runId,
        status: "QUEUED",
        isAsync: true,
        isQueued: true,
        jobId: queueRes.jobId,
        summary: {
          totalProducts,
          totalVariants,
          processedVariants: 0,
          generated: 0,
          skipped: 0,
          failed: 0,
          creditsUsed: creditsReserved,
        },
      };
    }
  }

  // 8. Streamed Batch Execution Engine for GraphQL mutations
  const runStreamedExecution = async () => {
    let hasNextPage = true;
    let cursor = null;
    let overallProcessed = 0;
    let overallSuccessful = 0;
    let overallFailed = 0;
    let overallSkipped = 0;
    let sequenceIndex = 0;

    while (hasNextPage) {
      const pageResult = await resolveSkuSelection({
        admin,
        selection,
        cursor,
        limit: 50,
      });

      const { products, pageInfo } = pageResult;
      hasNextPage = pageInfo?.hasNextPage || false;
      cursor = pageInfo?.endCursor || null;

      if (!products || products.length === 0) break;

      const productUpdateGroups = {};
      const pageAuditRows = [];

      products.forEach((product) => {
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

          if (genResult.isSkipped) {
            overallSkipped++;
            overallProcessed++;
            pageAuditRows.push({
              shopDomain,
              generationRunId: runId,
              productId: product.id,
              variantId: variant.id,
              productTitleSnapshot: product.title,
              variantTitleSnapshot: variant.title,
              previousSku: variant.sku || "",
              newSku: variant.sku || "",
              status: "SKIPPED",
              errorMessage: genResult.reason || "Skipped existing SKU",
            });
            return;
          }

          if (!productUpdateGroups[product.id]) {
            productUpdateGroups[product.id] = {
              productId: product.id,
              productTitle: product.title,
              variantsToUpdate: [],
            };
          }

          productUpdateGroups[product.id].variantsToUpdate.push({
            variantId: variant.id,
            variantTitle: variant.title,
            previousSku: variant.sku || "",
            newSku: genResult.sku,
          });
        });
      });

      const groupsList = Object.values(productUpdateGroups);
      if (groupsList.length > 0) {
        const mutationResults = await mapConcurrent(groupsList, 5, async (group) => {
          await sleep(50);
          return processProductGroupMutation({ admin, group, shopDomain, runId });
        });

        mutationResults.forEach((res) => {
          overallSuccessful += res.successful;
          overallFailed += res.failed;
          overallProcessed += res.successful + res.failed;
          if (res.auditRows) pageAuditRows.push(...res.auditRows);
        });
      }

      if (pageAuditRows.length > 0) {
        await GeneratedSku.insertMany(pageAuditRows).catch((e) =>
          console.warn("[Generation Engine] Audit insert warning:", e.message)
        );
      }

      await updateGenerationRunProgress({
        runId,
        processed: overallProcessed,
        successful: overallSuccessful,
        failed: overallFailed,
        skipped: overallSkipped,
        status: "PROCESSING",
      });
    }

    const creditsConsumed = overallSuccessful;
    const unusedCredits = creditsReserved - creditsConsumed;
    if (unusedCredits > 0) {
      await refundShopCredits({ shopDomain, refundCount: unusedCredits });
    }

    const finalStatus =
      overallFailed > 0 && overallSuccessful > 0
        ? "COMPLETED_WITH_ERRORS"
        : overallFailed > 0
        ? "Failed"
        : "Completed";

    await updateGenerationRunProgress({
      runId,
      processed: overallProcessed,
      successful: overallSuccessful,
      failed: overallFailed,
      skipped: overallSkipped,
      status: finalStatus,
      errorSummary: overallFailed > 0 ? `${overallFailed} variant updates failed.` : "",
    });
  };

  // 9. Execute based on Variant Count & Routing rules:
  // - Small batch (<= 50): Inline synchronous execution
  if (totalVariants <= 50) {
    await runStreamedExecution();
    const finalRun = await SkuGenerationRun.findById(runId);
    return {
      success: finalRun.status !== "Failed",
      runId,
      status: finalRun.status,
      summary: {
        totalProducts,
        totalVariants,
        processedVariants: finalRun.processedVariants,
        generated: finalRun.successfulVariants,
        skipped: finalRun.skippedVariants,
        failed: finalRun.failedVariants,
        creditsUsed: finalRun.successfulVariants,
      },
    };
  }

  // - Massive batch (> 1,000 variants): Shopify Bulk Operations API Engine!
  const targetExecution = async () => {
    if (totalVariants > 1000) {
      console.log(`[Engine Route] Routing run ${runId} (${totalVariants} variants) to Shopify Bulk Operations API Engine`);
      await executeShopifyBulkOperationRun({
        admin,
        session,
        selection,
        skuConfiguration,
        ruleName,
        runId,
        totalVariants,
        startSeqNum,
      });
    } else {
      console.log(`[Engine Route] Routing run ${runId} (${totalVariants} variants) to Streamed GraphQL Concurrency Engine`);
      await runStreamedExecution();
    }
  };

  if (existingRunId) {
    // Inside Worker thread: await execution synchronously for worker job promise resolution
    await targetExecution();
    return { success: true, runId, status: "Completed" };
  }

  // Fallback in-process async execution when BullMQ/Redis is not configured
  targetExecution().catch((err) => {
    console.error("[Async Generation Engine Error]:", err.message);
    updateGenerationRunProgress({
      runId,
      status: "Failed",
      errorSummary: err.message,
    }).catch(() => {});
  });

  return {
    success: true,
    runId,
    status: "PROCESSING",
    isAsync: true,
    summary: {
      totalProducts,
      totalVariants,
      processedVariants: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      creditsUsed: creditsReserved,
    },
  };
}
