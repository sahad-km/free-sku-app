/**
 * Server-controlled plan configurations for Shopify Billing.
 * Never trust pricing, credit limits, or entitlements submitted by the client.
 */

export const PLAN_HANDLES = {
  FREE: "FREE",
  BASIC_MONTHLY: "BASIC_MONTHLY",
  BASIC_YEARLY: "BASIC_YEARLY",
  PRO_MONTHLY: "PRO_MONTHLY",
  PRO_YEARLY: "PRO_YEARLY",
};

export const PLAN_CONFIG = {
  [PLAN_HANDLES.FREE]: {
    handle: PLAN_HANDLES.FREE,
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 0,
    isPaid: false,
    entitlements: {
      maxSkus: 500,
      maxActiveRules: 1,
      canAutoSku: false,
      canDuplicateResolve: false,
      canExportHistory: false,
      prioritySupport: false,
      monthlyCredits: 500,
    },
  },

  [PLAN_HANDLES.BASIC_MONTHLY]: {
    handle: PLAN_HANDLES.BASIC_MONTHLY,
    name: "Basic",
    price: 9.0,
    currency: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 3,
    isPaid: true,
    entitlements: {
      maxSkus: 10000,
      maxActiveRules: 5,
      canAutoSku: true,
      canDuplicateResolve: true,
      canExportHistory: false,
      prioritySupport: false,
      monthlyCredits: 10000,
    },
  },

  [PLAN_HANDLES.BASIC_YEARLY]: {
    handle: PLAN_HANDLES.BASIC_YEARLY,
    name: "Basic",
    price: 100.0,
    currency: "USD",
    interval: "ANNUAL",
    trialDays: 3,
    isPaid: true,
    entitlements: {
      maxSkus: 10000,
      maxActiveRules: 5,
      canAutoSku: true,
      canDuplicateResolve: true,
      canExportHistory: false,
      prioritySupport: false,
      monthlyCredits: 10000,
    },
  },

  [PLAN_HANDLES.PRO_MONTHLY]: {
    handle: PLAN_HANDLES.PRO_MONTHLY,
    name: "Pro",
    price: 19.0,
    currency: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 3,
    isPaid: true,
    entitlements: {
      maxSkus: 9999999, // Unlimited
      maxActiveRules: 9999, // Unlimited
      canAutoSku: true,
      canDuplicateResolve: true,
      canExportHistory: true,
      prioritySupport: true,
      monthlyCredits: 999999, // Unlimited
    },
  },

  [PLAN_HANDLES.PRO_YEARLY]: {
    handle: PLAN_HANDLES.PRO_YEARLY,
    name: "Pro",
    price: 220.0,
    currency: "USD",
    interval: "ANNUAL",
    trialDays: 3,
    isPaid: true,
    entitlements: {
      maxSkus: 9999999, // Unlimited
      maxActiveRules: 9999, // Unlimited
      canAutoSku: true,
      canDuplicateResolve: true,
      canExportHistory: true,
      prioritySupport: true,
      monthlyCredits: 999999, // Unlimited
    },
  },
};

/**
 * Get plan configuration object by handle.
 */
export function getPlanConfigByHandle(handle) {
  return PLAN_CONFIG[handle] || PLAN_CONFIG[PLAN_HANDLES.FREE];
}

/**
 * Map plan name (Free, Basic, Pro) and billing interval (monthly, annual) to plan handle.
 */
export function getPlanHandleFromName(name, interval = "monthly") {
  const normalizedName = (name || "Free").trim().toLowerCase();
  const isAnnual = interval === "annual";

  if (normalizedName === "basic") {
    return isAnnual ? PLAN_HANDLES.BASIC_YEARLY : PLAN_HANDLES.BASIC_MONTHLY;
  }

  if (normalizedName === "pro") {
    return isAnnual ? PLAN_HANDLES.PRO_YEARLY : PLAN_HANDLES.PRO_MONTHLY;
  }

  return PLAN_HANDLES.FREE;
}

/**
 * Map a raw Shopify subscription object to internal plan handle.
 */
export function mapShopifySubscriptionToHandle(subscription) {
  if (!subscription || subscription.status !== "ACTIVE") {
    return PLAN_HANDLES.FREE;
  }

  const name = subscription.name?.toLowerCase() || "";
  const price = parseFloat(subscription.lineItems?.[0]?.plan?.pricingDetails?.price?.amount || "0");
  const interval = subscription.lineItems?.[0]?.plan?.pricingDetails?.interval || "";

  const isAnnual = interval === "ANNUAL" || price > 50;

  if (name.includes("pro") || price >= 18) {
    return isAnnual ? PLAN_HANDLES.PRO_YEARLY : PLAN_HANDLES.PRO_MONTHLY;
  }

  if (name.includes("basic") || price >= 8) {
    return isAnnual ? PLAN_HANDLES.BASIC_YEARLY : PLAN_HANDLES.BASIC_MONTHLY;
  }

  return PLAN_HANDLES.FREE;
}
