import { connectMongoose } from "../../db.mongoose.server";
import AutomationRule from "../../models/AutomationRule.server";
import GeneratedSku from "../../models/GeneratedSku.server";
import SkuGenerationRun from "../../models/SkuGenerationRun.server";
import { generateSkuForVariant } from "./skuGeneratorService";
import { getNextSequenceNumber } from "./skuCounterService";
import { reserveShopCredits, refundShopCredits } from "./skuCreditService";
import { createGenerationRunRecord, updateGenerationRunProgress } from "./generationJobService";

import { syncAutomationWebhooks } from "../shopify/webhookSubscriptionService.server";

/**
 * 1. Get All Automation Rules & Summary KPIs for a Store
 */
export async function getAutomationRules({ admin, shopDomain, search = "", statusTab = "All rules" }) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  await connectMongoose();

  if (admin) {
    syncAutomationWebhooks({ admin, shopDomain }).catch((e) =>
      console.warn("[Automated SKU Sync Warning]:", e.message)
    );
  }

  const query = { shopDomain };

  if (statusTab === "Active") query.status = "Active";
  else if (statusTab === "Paused") query.status = "Paused";
  else if (statusTab === "Drafts") query.status = "Draft";

  if (search && search.trim() !== "") {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { scope: regex }, { trigger: regex }];
  }

  const rules = await AutomationRule.find(query).sort({ createdAt: -1 }).lean();

  // Calculate summary KPIs specifically from AUTOMATED rules created for this shop
  const allShopRules = await AutomationRule.find({ shopDomain }).lean();
  const totalRules = allShopRules.length;
  const activeRules = allShopRules.filter((r) => r.status === "Active").length;

  const productsAutomatedThisMonth = allShopRules.reduce((sum, r) => sum + (r.runCount || 0), 0);
  const skusGeneratedThisMonth = allShopRules.reduce((sum, r) => sum + (r.skusGenerated || 0), 0);

  // Find last automated rule run record
  const lastRunRecord = await SkuGenerationRun.findOne({
    shopDomain,
    ruleName: { $exists: true, $ne: null, $ne: "" },
  })
    .sort({ createdAt: -1 })
    .lean();

  const summary = {
    activeRules,
    totalRules,
    totalRulesLimit: 8,
    productsAutomatedThisMonth,
    skusGeneratedThisMonth,
    lastRunDate: lastRunRecord?.createdAt
      ? new Date(lastRunRecord.createdAt).toLocaleDateString()
      : "Never",
    lastRunTime: lastRunRecord?.createdAt
      ? new Date(lastRunRecord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--",
  };

  return {
    rules: rules.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description || "",
      status: r.status,
      trigger: r.trigger || "New product added",
      scope: r.scope || "All products",
      skuConfiguration: r.skuConfiguration || {},
      skusGenerated: r.skusGenerated || 0,
      runCount: r.runCount || 0,
      lastRunAt: r.lastRunAt ? r.lastRunAt.toISOString() : null,
      lastRunStatus: r.lastRunStatus || "none",
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    })),
    summary,
  };
}

/**
 * 2. Create Automation Rule
 */
export async function createAutomationRule({
  admin,
  shopDomain,
  name,
  description = "",
  trigger = "New product added",
  scope = "All products",
  skuConfiguration = {},
}) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  if (!name || !name.trim()) throw new Error("Rule name is required");

  await connectMongoose();

  const rule = await AutomationRule.create({
    shopDomain,
    name: name.trim(),
    description: description.trim(),
    status: "Active",
    trigger,
    scope,
    skuConfiguration,
    skusGenerated: 0,
    runCount: 0,
    lastRunStatus: "none",
  });

  if (admin) {
    await syncAutomationWebhooks({ admin, shopDomain }).catch((e) =>
      console.warn("[Automated SKU Sync Warning]:", e.message)
    );
  }

  return {
    success: true,
    ruleId: rule._id.toString(),
    rule,
  };
}

/**
 * 3. Update Automation Rule
 */
export async function updateAutomationRule({ admin, shopDomain, ruleId, updateData }) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  if (!ruleId) throw new Error("Rule ID is required");

  await connectMongoose();

  const rule = await AutomationRule.findOneAndUpdate(
    { _id: ruleId, shopDomain },
    { $set: updateData },
    { new: true }
  );

  if (!rule) throw new Error("Automation rule not found");

  if (admin) {
    await syncAutomationWebhooks({ admin, shopDomain }).catch((e) =>
      console.warn("[Automated SKU Sync Warning]:", e.message)
    );
  }

  return {
    success: true,
    rule,
  };
}

/**
 * 4. Delete Automation Rule
 */
export async function deleteAutomationRule({ admin, shopDomain, ruleId }) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  if (!ruleId) throw new Error("Rule ID is required");

  await connectMongoose();

  const deleted = await AutomationRule.findOneAndDelete({ _id: ruleId, shopDomain });
  if (!deleted) throw new Error("Automation rule not found");

  if (admin) {
    await syncAutomationWebhooks({ admin, shopDomain }).catch((e) =>
      console.warn("[Automated SKU Sync Warning]:", e.message)
    );
  }

  return { success: true };
}

/**
 * 5. Toggle Rule Status (Active <-> Paused)
 */
export async function toggleAutomationRuleStatus({ admin, shopDomain, ruleId }) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  await connectMongoose();

  const rule = await AutomationRule.findOne({ _id: ruleId, shopDomain });
  if (!rule) throw new Error("Automation rule not found");

  const newStatus = rule.status === "Active" ? "Paused" : "Active";
  rule.status = newStatus;
  await rule.save();

  if (admin) {
    await syncAutomationWebhooks({ admin, shopDomain }).catch((e) =>
      console.warn("[Automated SKU Sync Warning]:", e.message)
    );
  }

  return { success: true, status: newStatus };
}

/**
 * Helper: Check if product matches scope
 */
export function doesProductMatchScope(product, scope, config = {}) {
  if (!scope || scope === "All products") return true;

  const scopeLower = scope.toLowerCase();
  const targetValue = (config.scopeTargetValue || "").toLowerCase().trim();
  const targetList = targetValue
    ? targetValue.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (scopeLower.includes("vendor")) {
    if (!product.vendor) return false;
    if (targetList.length === 0) return true;
    const prodVendor = product.vendor.toLowerCase();
    return targetList.some((t) => prodVendor.includes(t));
  }

  if (scopeLower.includes("tag")) {
    if (!Array.isArray(product.tags) || product.tags.length === 0) return false;
    if (targetList.length === 0) return true;
    const prodTags = product.tags.map((t) => t.toLowerCase());
    return targetList.some((t) => prodTags.some((pt) => pt.includes(t)));
  }

  if (scopeLower.includes("collection")) {
    return true;
  }

  return true;
}

/**
 * Helper: Check if active rule matches incoming trigger event type
 */
export function doesRuleMatchTrigger(rule, triggerType, hasUnassignedVariants = false) {
  if (!triggerType || triggerType === "RUN_NOW" || triggerType === "Manual" || triggerType === "Run Now") return true;

  const ruleTrig = (rule.trigger || "New product added").toLowerCase();
  const incomingTrig = triggerType.toLowerCase();

  if (ruleTrig.includes("scheduled")) {
    return incomingTrig.includes("scheduled") || incomingTrig.includes("run_now") || incomingTrig.includes("manual");
  }

  // "New product added" rules fire on creation webhooks, or update webhooks if variants lack SKUs
  if (ruleTrig.includes("new product") || ruleTrig.includes("create")) {
    if (incomingTrig.includes("create") || incomingTrig.includes("new product")) return true;
    if (incomingTrig.includes("update") && hasUnassignedVariants) return true;
    return false;
  }

  // "Product updated" rules fire on update webhooks
  if (ruleTrig.includes("update")) {
    return incomingTrig.includes("update");
  }

  if (ruleTrig.includes("collection") || ruleTrig.includes("vendor")) {
    return incomingTrig.includes("collection") || incomingTrig.includes("update");
  }

  return true;
}

/**
 * 6. Evaluate & Execute Automated SKU for a Product
 * Triggered by Shopify Webhooks or Run Now action
 */
export async function evaluateAutomatedSkuForProduct({
  admin,
  shopDomain,
  productId,
  triggerType = "New product added",
}) {
  if (!admin || !shopDomain || !productId) {
    throw new Error("Missing required parameters for automated SKU evaluation");
  }

  await connectMongoose();
  const cleanShopDomain = (shopDomain || "").toLowerCase().trim();

  console.log(`[Automated SKU Engine] Evaluating for shop "${cleanShopDomain}" (Product ID: ${productId}, Trigger: ${triggerType})`);

  // Load active automation rules for this store (case-insensitive shopDomain match)
  const activeRules = await AutomationRule.find({
    $or: [
      { shopDomain: cleanShopDomain },
      { shopDomain: { $regex: new RegExp(`^${cleanShopDomain.replace(/\./g, "\\.")}$`, "i") } }
    ],
    status: "Active",
  }).lean();

  if (activeRules.length === 0) {
    console.log(`[Automated SKU Engine] No active automation rules found for shop "${cleanShopDomain}".`);
    return { success: true, processed: 0, reason: "No active automation rules found" };
  }

  console.log(`[Automated SKU Engine] Found ${activeRules.length} active rule(s) for shop "${cleanShopDomain}".`);

  // Normalize Product GraphQL GID
  const normalizedProductId = productId.startsWith("gid://")
    ? productId
    : `gid://shopify/Product/${productId}`;

  // Fetch product & variants from Shopify
  const fetchProductQuery = `
    query getProductForAutomation($id: ID!) {
      product(id: $id) {
        id
        title
        vendor
        productType
        tags
        variants(first: 100) {
          nodes {
            id
            title
            sku
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  `;

  let productResponse = await admin.graphql(fetchProductQuery, {
    variables: { id: normalizedProductId },
  });

  let productJson = await productResponse.json();
  let product = productJson?.data?.product;

  if (!product) {
    console.warn(`[Automated SKU Engine] Product ${productId} not found on Shopify.`);
    return { success: false, reason: `Product ${productId} not found on Shopify` };
  }

  let variants = product.variants?.nodes || [];

  // If variants not ready yet (Shopify variant creation delay), retry after 1500ms delay
  if (variants.length === 0) {
    console.log(`[Automated SKU Engine] 0 variants found for ${productId}. Retrying fetch in 1500ms...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    productResponse = await admin.graphql(fetchProductQuery, {
      variables: { id: normalizedProductId },
    });
    productJson = await productResponse.json();
    product = productJson?.data?.product;
    variants = product?.variants?.nodes || [];
    console.log(`[Automated SKU Engine] Retry completed. Found ${variants.length} variant(s).`);
  }

  if (variants.length === 0) {
    console.warn(`[Automated SKU Engine] No variants found on product ${productId}.`);
    return { success: true, processed: 0, reason: "No variants found on product" };
  }

  const hasUnassignedVariants = variants.some((v) => !v.sku || v.sku.trim() === "");

  let totalSkusGenerated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const rule of activeRules) {
    if (!doesRuleMatchTrigger(rule, triggerType, hasUnassignedVariants)) continue;
    if (!doesProductMatchScope(product, rule.scope, rule.skuConfiguration || {})) continue;

    const config = rule.skuConfiguration || {};
    const overwriteExisting = config.overwriteExisting ?? true;
    const isSequential = config.bodyNumberType === "sequential" || config.bodyNumberType === "continue";
    const incrementStep = config.incrementStep || 1;

    // Create a SkuGenerationRun audit record for this automation run
    const runDoc = await createGenerationRunRecord({
      shopDomain,
      ruleName: rule.name,
      selection: { type: "SPECIFIC_PRODUCTS", productIds: [product.id] },
      skuConfiguration: config,
      totalProducts: 1,
      totalVariants: variants.length,
      creditsReserved: variants.length,
      idempotencyKey: `auto-${rule._id}-${product.id}-${Date.now()}`,
    });

    const runId = runDoc._id.toString();

    // Reserve credits
    const creditRes = await reserveShopCredits({ shopDomain, requiredCredits: variants.length });
    if (!creditRes.success) {
      await updateGenerationRunProgress({
        runId,
        status: "Failed",
        errorSummary: "Insufficient credits for automated generation",
      });
      continue;
    }

    let startSeqNum = config.startNumber || 1;
    if (isSequential) {
      startSeqNum = await getNextSequenceNumber({
        shopDomain,
        counterKey: rule.name || "default",
        startNumber: config.startNumber || 1,
        incrementStep,
        count: variants.length,
      });
    }

    const variantsToUpdate = [];
    const auditRows = [];

    variants.forEach((v, idx) => {
      // Self-Trigger & Overwrite Protection Check
      if (!overwriteExisting && v.sku && v.sku.trim().length > 0) {
        totalSkipped++;
        auditRows.push({
          shopDomain,
          generationRunId: runId,
          productId: product.id,
          variantId: v.id,
          productTitleSnapshot: product.title,
          variantTitleSnapshot: v.title,
          previousSku: v.sku,
          newSku: v.sku,
          status: "SKIPPED",
          errorMessage: "Skipped existing SKU (overwrite disabled)",
        });
        return;
      }

      const seqNum = isSequential ? startSeqNum + idx * incrementStep : null;
      const genResult = generateSkuForVariant({
        product,
        variant: v,
        config,
        index: idx,
        sequenceNumber: seqNum,
      });

      if (genResult.isSkipped) {
        totalSkipped++;
        return;
      }

      // Self-trigger protection check: if variant SKU is already equal to generated SKU, skip!
      if (v.sku === genResult.sku) {
        totalSkipped++;
        return;
      }

      variantsToUpdate.push({
        id: v.id,
        sku: genResult.sku,
        variantTitle: v.title,
        previousSku: v.sku || "",
      });
    });

    if (variantsToUpdate.length > 0) {
      const bulkInput = variantsToUpdate.map((v) => ({ id: v.id, inventoryItem: { sku: v.sku } }));

      try {
        const updateRes = await admin.graphql(`
          mutation automatedBulkUpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              product { id }
              productVariants { id sku }
              userErrors { field message code }
            }
          }
        `, {
          variables: {
            productId: product.id,
            variants: bulkInput,
          },
        });

        const updateJson = await updateRes.json();
        const userErrors = updateJson?.data?.productVariantsBulkUpdate?.userErrors || [];

        if (userErrors.length > 0) {
          totalFailed += variantsToUpdate.length;
          variantsToUpdate.forEach((v) => {
            auditRows.push({
              shopDomain,
              generationRunId: runId,
              productId: product.id,
              variantId: v.id,
              productTitleSnapshot: product.title,
              variantTitleSnapshot: v.variantTitle,
              previousSku: v.previousSku,
              newSku: v.sku,
              status: "FAILED",
              errorMessage: userErrors.map((u) => u.message).join("; "),
            });
          });
        } else {
          totalSkusGenerated += variantsToUpdate.length;
          variantsToUpdate.forEach((v) => {
            auditRows.push({
              shopDomain,
              generationRunId: runId,
              productId: product.id,
              variantId: v.id,
              productTitleSnapshot: product.title,
              variantTitleSnapshot: v.variantTitle,
              previousSku: v.previousSku,
              newSku: v.sku,
              status: "SUCCESS",
            });
          });
        }
      } catch (err) {
        totalFailed += variantsToUpdate.length;
      }
    }

    // GeneratedSku audit rows saving disabled to prevent DB bloat

    // Refund unused credits if any were skipped
    const unusedCredits = variants.length - variantsToUpdate.length;
    if (unusedCredits > 0) {
      await refundShopCredits({ shopDomain, refundCount: unusedCredits });
    }

    // Update Generation Run Audit Record
    await updateGenerationRunProgress({
      runId,
      processed: variants.length,
      successful: variantsToUpdate.length,
      failed: totalFailed,
      skipped: totalSkipped,
      status: totalFailed > 0 ? "COMPLETED_WITH_ERRORS" : "Completed",
    });

    // Update Automation Rule stats
    await AutomationRule.findByIdAndUpdate(rule._id, {
      $inc: {
        runCount: 1,
        skusGenerated: variantsToUpdate.length,
      },
      $set: {
        lastRunAt: new Date(),
        lastRunStatus: totalFailed > 0 ? "FAILED" : "SUCCESS",
      },
    });
  }

  return {
    success: true,
    totalGenerated: totalSkusGenerated,
    totalSkipped,
    totalFailed,
  };
}
