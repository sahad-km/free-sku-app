import { connectMongoose } from "../../db.mongoose.server";
import DuplicateGroup from "../../models/DuplicateGroup.server";
import GeneratedSku from "../../models/GeneratedSku.server";
import SkuGenerationRun from "../../models/SkuGenerationRun.server";
import { generateSkuForVariant } from "./skuGeneratorService";
import { getNextSequenceNumber } from "./skuCounterService";
import { reserveShopCredits, refundShopCredits } from "./skuCreditService";
import { createGenerationRunRecord, updateGenerationRunProgress } from "./generationJobService";

/**
 * Resolve a Duplicate SKU Group safely
 * Reuses canonical SKU generator, atomic sequence counter, credit service, and Shopify GraphQL mutations.
 */
export async function resolveDuplicateGroup({
  admin,
  shopDomain,
  groupId,
  method = "generate",
  manualSku = "",
  selectedKeepId = "",
}) {
  if (!admin || !shopDomain || !groupId) {
    throw new Error("Missing required parameters for duplicate resolution");
  }

  await connectMongoose();

  const group = await DuplicateGroup.findOne({ _id: groupId, shopDomain });
  if (!group) throw new Error(`Duplicate group ${groupId} not found`);

  // Handle Ignore action
  if (method === "ignore") {
    group.status = "IGNORED";
    await group.save();
    return { success: true, method: "ignore", message: "Group ignored successfully" };
  }

  const records = group.records || [];
  if (records.length === 0) {
    group.status = "RESOLVED";
    await group.save();
    return { success: true, method, resolvedCount: 0 };
  }

  // Determine variants requiring new SKUs based on resolution method
  let variantsToReSku = [];
  if (method === "keep") {
    // Keep SKU for selectedKeepId, change all others
    variantsToReSku = records.filter((r) => r.id !== selectedKeepId && r.variantId !== selectedKeepId);
    if (variantsToReSku.length === 0 && records.length > 1) {
      // Fallback: keep first record, re-sku remaining
      variantsToReSku = records.slice(1);
    }
  } else {
    // For 'generate' or 'manual': change all duplicate records
    variantsToReSku = [...records];
  }

  if (variantsToReSku.length === 0) {
    group.status = "RESOLVED";
    await group.save();
    return { success: true, method, resolvedCount: 0 };
  }

  // Create SkuGenerationRun audit record
  const runDoc = await createGenerationRunRecord({
    shopDomain,
    ruleName: `Duplicate Resolution (${group.sku})`,
    selection: { type: "SPECIFIC_VARIANTS", groupTitle: group.title },
    skuConfiguration: { method, manualSku, groupSku: group.sku },
    totalProducts: new Set(records.map((r) => r.productId)).size,
    totalVariants: variantsToReSku.length,
    creditsReserved: variantsToReSku.length,
    idempotencyKey: `dup-res-${group._id}-${Date.now()}`,
  });

  const runId = runDoc._id.toString();

  // Reserve credits
  const creditRes = await reserveShopCredits({ shopDomain, requiredCredits: variantsToReSku.length });
  if (!creditRes.success) {
    await updateGenerationRunProgress({
      runId,
      status: "Failed",
      errorSummary: "Insufficient credits for duplicate resolution",
    });
    throw new Error(`Insufficient credits. Required: ${creditRes.requiredCredits}, Available: ${creditRes.availableCredits}`);
  }

  let startSeqNum = 1;
  if (method === "generate" || method === "keep") {
    startSeqNum = await getNextSequenceNumber({
      shopDomain,
      counterKey: "DuplicateResolution",
      startNumber: 1,
      incrementStep: 1,
      count: variantsToReSku.length,
    });
  }

  // Group mutations by productId (Shopify productVariantsBulkUpdate is product-scoped)
  const productGroups = {};

  variantsToReSku.forEach((rec, idx) => {
    let newSkuVal = "";
    if (method === "manual" && manualSku.trim()) {
      newSkuVal = manualSku.trim();
      if (variantsToReSku.length > 1) {
        newSkuVal = `${manualSku.trim()}-${idx + 1}`;
      }
    } else {
      const seqNum = startSeqNum + idx;
      const genResult = generateSkuForVariant({
        product: { title: rec.product, id: rec.productId },
        variant: { title: rec.variant, id: rec.variantId, sku: rec.currentSku },
        config: {
          prefix: "RESOLVE",
          bodyNumberType: "sequential",
          startNumber: 1,
          numberPadding: 4,
          incrementStep: 1,
          suffix: "",
          separator: "-",
        },
        index: idx,
        sequenceNumber: seqNum,
      });
      newSkuVal = genResult.sku;
    }

    if (!productGroups[rec.productId]) {
      productGroups[rec.productId] = {
        productId: rec.productId,
        productTitle: rec.product,
        variants: [],
      };
    }

    productGroups[rec.productId].variants.push({
      variantId: rec.variantId,
      variantTitle: rec.variant,
      previousSku: rec.currentSku,
      newSku: newSkuVal,
    });
  });

  const auditRows = [];
  let successfulCount = 0;
  let failedCount = 0;

  for (const groupItem of Object.values(productGroups)) {
    const bulkInput = groupItem.variants.map((v) => ({
      id: v.variantId,
      sku: v.newSku,
    }));

    try {
      const updateRes = await admin.graphql(`
        mutation resolveDuplicateVariants($productId: ID!, $variants: [ProductVariantBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            product { id }
            productVariants { id sku }
            userErrors { field message code }
          }
        }
      `, {
        variables: {
          productId: groupItem.productId,
          variants: bulkInput,
        },
      });

      const updateJson = await updateRes.json();
      const userErrors = updateJson?.data?.productVariantsBulkUpdate?.userErrors || [];

      if (userErrors.length > 0) {
        failedCount += groupItem.variants.length;
        groupItem.variants.forEach((v) => {
          auditRows.push({
            shopDomain,
            generationRunId: runId,
            productId: groupItem.productId,
            variantId: v.variantId,
            productTitleSnapshot: groupItem.productTitle,
            variantTitleSnapshot: v.variantTitle,
            previousSku: v.previousSku,
            newSku: v.newSku,
            status: "FAILED",
            errorMessage: userErrors.map((u) => u.message).join("; "),
          });
        });
      } else {
        successfulCount += groupItem.variants.length;
        groupItem.variants.forEach((v) => {
          auditRows.push({
            shopDomain,
            generationRunId: runId,
            productId: groupItem.productId,
            variantId: v.variantId,
            productTitleSnapshot: groupItem.productTitle,
            variantTitleSnapshot: v.variantTitle,
            previousSku: v.previousSku,
            newSku: v.newSku,
            status: "SUCCESS",
          });
        });
      }
    } catch (err) {
      failedCount += groupItem.variants.length;
    }
  }

  if (auditRows.length > 0) {
    await GeneratedSku.insertMany(auditRows).catch((e) =>
      console.warn("[Duplicate Resolution] Audit insert warning:", e.message)
    );
  }

  // Refund unused credits if any failed
  if (failedCount > 0) {
    await refundShopCredits({ shopDomain, refundCount: failedCount });
  }

  // Update Generation Run Audit Record
  await updateGenerationRunProgress({
    runId,
    processed: variantsToReSku.length,
    successful: successfulCount,
    failed: failedCount,
    status: failedCount > 0 ? "COMPLETED_WITH_ERRORS" : "Completed",
  });

  // Mark group status as RESOLVED
  group.status = "RESOLVED";
  await group.save();

  return {
    success: failedCount === 0,
    method,
    resolvedCount: successfulCount,
    failedCount,
  };
}
