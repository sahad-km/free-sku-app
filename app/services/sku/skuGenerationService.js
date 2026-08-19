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
}) {
  const shopDomain = session?.shop;
  if (!shopDomain) {
    throw new Error("Unauthorized Shopify session");
  }

  await connectMongoose();

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
  const totalVariants = scopeCounts.totalVariants || 1;
  const totalProducts = scopeCounts.totalProducts || 1;

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

  const creditsReserved = creditRes.reservedCredits;

  // 5. Create generation run record
  const runDoc = await createGenerationRunRecord({
    shopDomain,
    ruleName,
    selection,
    skuConfiguration,
    totalProducts,
    totalVariants,
    creditsReserved,
    idempotencyKey,
  });

  // 6. Sequential numbering start sequence reservation
  const isSequential = skuConfiguration.bodyNumberType === "sequential" || skuConfiguration.bodyNumberType === "continue";
  let startSeqNum = skuConfiguration.startNumber || 1;
  const incrementStep = skuConfiguration.incrementStep || 1;

  if (isSequential) {
    startSeqNum = await getNextSequenceNumber({
      shopDomain,
      counterKey: ruleName || "default",
      startNumber: skuConfiguration.startNumber || 1,
      incrementStep,
      count: totalVariants,
    });
  }

  // 7. Async / Detached Streamed Execution for Large Catalogs
  const runId = runDoc._id.toString();

  const runStreamedExecution = async () => {
    let hasNextPage = true;
    let cursor = null;
    let overallProcessed = 0;
    let overallSuccessful = 0;
    let overallFailed = 0;
    let overallSkipped = 0;
    let sequenceIndex = 0;

    // Process catalog page-by-page (100 items per chunk) to keep memory flat
    while (hasNextPage) {
      const pageResult = await resolveSkuSelection({
        admin,
        selection,
        cursor,
        limit: 50, // Streamed chunk size
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

      // Controlled concurrency: max 5 parallel product mutations with 50ms rate-limit throttle
      const groupsList = Object.values(productUpdateGroups);
      if (groupsList.length > 0) {
        const mutationResults = await mapConcurrent(groupsList, 5, async (group) => {
          await sleep(50); // Leaky bucket protection
          return processProductGroupMutation({ admin, group, shopDomain, runId });
        });

        mutationResults.forEach((res) => {
          overallSuccessful += res.successful;
          overallFailed += res.failed;
          overallProcessed += res.successful + res.failed;
          if (res.auditRows) pageAuditRows.push(...res.auditRows);
        });
      }

      // Persist page audit rows to MongoDB
      if (pageAuditRows.length > 0) {
        await GeneratedSku.insertMany(pageAuditRows).catch((e) =>
          console.warn("[Generation Engine] Audit insert warning:", e.message)
        );
      }

      // Update real-time progress doc in MongoDB for live polling UI
      await updateGenerationRunProgress({
        runId,
        processed: overallProcessed,
        successful: overallSuccessful,
        failed: overallFailed,
        skipped: overallSkipped,
        status: "PROCESSING",
      });
    }

    // Reconcile credits & status upon completion
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

  // For small batches (<= 50 variants), run inline synchronously
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

  // For large catalog runs (> 50 variants up to 20,000+), launch background detached execution!
  runStreamedExecution().catch((err) => {
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
