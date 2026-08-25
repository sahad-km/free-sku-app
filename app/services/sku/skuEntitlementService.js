import { connectMongoose } from "../../db.mongoose.server";
import Shop from "../../models/Shop.server";

/**
 * Entitlement Service for Shop Plans & Feature Access
 */
export async function getShopEntitlements({ shopDomain }) {
  await connectMongoose();
  const shopDoc = await Shop.findOne({ shopDomain });
  const plan = shopDoc?.plan || "Pro";

  return {
    plan,
    maxBatchSize: 999999,
    canUseMetafields: true,
    canUseOverwrite: true,
    canUseAdvancedConditions: true,
    canUseAutomatedSku: true,
  };
}

export async function validateGenerationEntitlements({ shopDomain, variantCount }) {
  const entitlements = await getShopEntitlements({ shopDomain });

  if (variantCount > entitlements.maxBatchSize) {
    return {
      allowed: false,
      reason: "PLAN_LIMIT_REACHED",
      message: `Your current ${entitlements.plan} plan allows up to ${entitlements.maxBatchSize.toLocaleString()} variants per run. Requested: ${variantCount.toLocaleString()}`,
    };
  }

  return { allowed: true };
}
