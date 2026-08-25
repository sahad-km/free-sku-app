import Shop from "../../models/Shop.server";
import ShopBilling from "../../models/ShopBilling.server";
import { getPlanConfigByHandle, PLAN_HANDLES } from "./planConfig.server";

export const FEATURES = {
  MANUAL_GENERATE_SKU: "MANUAL_GENERATE_SKU",
  AUTOMATED_SKU: "AUTOMATED_SKU",
  DUPLICATE_RESOLUTION: "DUPLICATE_RESOLUTION",
  EXPORT_HISTORY: "EXPORT_HISTORY",
  PRIORITY_SUPPORT: "PRIORITY_SUPPORT",
};

/**
 * Gets full entitlement configuration for a store based on verified billing state.
 */
export async function getShopEntitlements(shopDomain) {
  const billing = await ShopBilling.findOne({ shopDomain });
  const planHandle = billing?.planHandle || PLAN_HANDLES.FREE;
  const planConfig = getPlanConfigByHandle(planHandle);
  const dbShop = await Shop.findOne({ shopDomain });

  return {
    shopDomain,
    planHandle,
    planName: planConfig.name,
    billingInterval: billing?.billingInterval || "monthly",
    status: billing?.status || "FREE",
    entitlements: planConfig.entitlements,
    credits: {
      allocated: dbShop?.creditsAllocated || planConfig.entitlements.monthlyCredits,
      used: dbShop?.creditsUsed || 0,
      remaining: Math.max(0, (dbShop?.creditsAllocated || planConfig.entitlements.monthlyCredits) - (dbShop?.creditsUsed || 0)),
    },
  };
}

/**
 * Validates whether a store can use a specific feature.
 */
export async function canUseFeature(shopDomain, featureKey) {
  // Unlimited access for introductory launch
  return true;
}

/**
 * Server guard function to enforce feature entitlements in API routes.
 * Throws a Response with 403 status if entitlement is missing.
 */
export async function requireEntitlementGuard(shopDomain, featureKey) {
  const isAllowed = await canUseFeature(shopDomain, featureKey);

  if (!isAllowed) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: `Feature '${featureKey}' is not available on your current plan or your credits are depleted. Please upgrade your plan.`,
        code: "ENTITLEMENT_RESTRICTED",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return true;
}
