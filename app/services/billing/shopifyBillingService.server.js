import Shop from "../../models/Shop.server";
import ShopBilling from "../../models/ShopBilling.server";
import {
  getPlanConfigByHandle,
  mapShopifySubscriptionToHandle,
  PLAN_HANDLES,
} from "./planConfig.server";

const APP_SUBSCRIPTION_CREATE_MUTATION = `#graphql
  mutation AppSubscriptionCreate(
    $name: String!
    $returnUrl: URL!
    $trialDays: Int
    $test: Boolean
    $lineItems: [AppSubscriptionLineItemInput!]!
  ) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      trialDays: $trialDays
      test: $test
      lineItems: $lineItems
    ) {
      userErrors {
        field
        message
      }
      confirmationUrl
      appSubscription {
        id
        status
      }
    }
  }
`;

const APP_SUBSCRIPTION_CANCEL_MUTATION = `#graphql
  mutation AppSubscriptionCancel($id: ID!, $prorate: Boolean) {
    appSubscriptionCancel(id: $id, prorate: $prorate) {
      userErrors {
        field
        message
      }
      appSubscription {
        id
        status
      }
    }
  }
`;

const GET_CURRENT_SUBSCRIPTIONS_QUERY = `#graphql
  query GetCurrentSubscriptions {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        status
        createdAt
        trialDays
        currentPeriodEnd
        lineItems {
          plan {
            pricingDetails {
              ... on AppRecurringPricing {
                price {
                  amount
                  currencyCode
                }
                interval
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Initiates a Shopify App Subscription upgrade/subscription request.
 */
export async function requestSubscription(admin, shopDomain, planHandle, returnUrl) {
  const plan = getPlanConfigByHandle(planHandle);

  if (!plan.isPaid) {
    // If requesting Free plan, cancel active paid subscription
    await cancelSubscription(admin, shopDomain);
    await syncBillingState(admin, shopDomain);
    return { confirmationUrl: null, planHandle: PLAN_HANDLES.FREE };
  }

  // Construct line items based on interval
  const isAnnual = plan.interval === "ANNUAL";
  const lineItems = [
    {
      plan: {
        appRecurringPricingDetails: {
          price: {
            amount: plan.price,
            currencyCode: plan.currency,
          },
          interval: isAnnual ? "ANNUAL" : "EVERY_30_DAYS",
        },
      },
    },
  ];

  // Dev stores / non-production env use test: true
  const isTest = process.env.NODE_ENV !== "production" || shopDomain.includes("myshopify.com");

  const response = await admin.graphql(APP_SUBSCRIPTION_CREATE_MUTATION, {
    variables: {
      name: `Free SKU Generator ${plan.name} Plan (${isAnnual ? "Annual" : "Monthly"})`,
      returnUrl,
      trialDays: plan.trialDays || 3,
      test: isTest,
      lineItems,
    },
  });

  const responseJson = await response.json();
  const data = responseJson?.data?.appSubscriptionCreate;

  if (data?.userErrors?.length > 0) {
    const errorMsg = data.userErrors.map((e) => e.message).join(", ");
    throw new Error(`Shopify Subscription Request Failed: ${errorMsg}`);
  }

  return {
    confirmationUrl: data?.confirmationUrl,
    subscriptionId: data?.appSubscription?.id,
    planHandle: plan.handle,
  };
}

/**
 * Cancels an active Shopify subscription for a shop.
 */
export async function cancelSubscription(admin, shopDomain) {
  const shopBilling = await ShopBilling.findOne({ shopDomain });

  if (shopBilling?.subscriptionId) {
    try {
      await admin.graphql(APP_SUBSCRIPTION_CANCEL_MUTATION, {
        variables: {
          id: shopBilling.subscriptionId,
          prorate: true,
        },
      });
    } catch (err) {
      console.warn(`[ShopifyBilling] Cancel subscription error for ${shopDomain}:`, err.message);
    }
  }

  // Update DB snapshot to FREE
  const dbShop = await Shop.findOne({ shopDomain });

  if (dbShop) {
    dbShop.plan = "Free";
    dbShop.creditsAllocated = getPlanConfigByHandle(PLAN_HANDLES.FREE).entitlements.monthlyCredits;
    await dbShop.save();
  }

  if (shopBilling) {
    shopBilling.planHandle = PLAN_HANDLES.FREE;
    shopBilling.planName = "Free";
    shopBilling.status = "FREE";
    shopBilling.subscriptionId = null;
    shopBilling.lastVerifiedAt = new Date();
    await shopBilling.save();
  }

  return { status: "FREE" };
}

/**
 * Synchronizes store billing state from Shopify Admin GraphQL API into MongoDB.
 */
export async function syncBillingState(admin, shopDomain) {
  let activeSub = null;

  try {
    const response = await admin.graphql(GET_CURRENT_SUBSCRIPTIONS_QUERY);
    const responseJson = await response.json();
    const subs = responseJson?.data?.currentAppInstallation?.activeSubscriptions || [];
    activeSub = subs.find((s) => s.status === "ACTIVE") || subs[0] || null;
  } catch (err) {
    console.error(`[ShopifyBilling] Failed to query active subscriptions for ${shopDomain}:`, err);
  }

  const dbShop = await Shop.findOne({ shopDomain });
  let dbBilling = await ShopBilling.findOne({ shopDomain });

  if (!dbShop) {
    throw new Error(`Shop record not found in database for ${shopDomain}`);
  }

  if (!dbBilling) {
    dbBilling = new ShopBilling({
      shopId: dbShop._id,
      shopDomain,
      planHandle: PLAN_HANDLES.FREE,
      planName: "Free",
      status: "FREE",
    });
  }

  if (activeSub && activeSub.status === "ACTIVE") {
    const handle = mapShopifySubscriptionToHandle(activeSub);
    const planConfig = getPlanConfigByHandle(handle);

    dbBilling.planHandle = handle;
    dbBilling.planName = planConfig.name;
    dbBilling.billingInterval = planConfig.interval === "ANNUAL" ? "annual" : "monthly";
    dbBilling.subscriptionId = activeSub.id;
    dbBilling.status = "ACTIVE";
    dbBilling.currentPeriodEnd = activeSub.currentPeriodEnd ? new Date(activeSub.currentPeriodEnd) : null;
    dbBilling.lastVerifiedAt = new Date();

    dbShop.plan = planConfig.name;
    dbShop.creditsAllocated = planConfig.entitlements.monthlyCredits;
  } else {
    // No active paid subscription -> Free Plan
    const freeConfig = getPlanConfigByHandle(PLAN_HANDLES.FREE);

    dbBilling.planHandle = PLAN_HANDLES.FREE;
    dbBilling.planName = "Free";
    dbBilling.billingInterval = "monthly";
    dbBilling.subscriptionId = null;
    dbBilling.status = "FREE";
    dbBilling.lastVerifiedAt = new Date();

    dbShop.plan = "Free";
    dbShop.creditsAllocated = freeConfig.entitlements.monthlyCredits;
  }

  await dbBilling.save();
  await dbShop.save();

  return {
    shopDomain,
    planHandle: dbBilling.planHandle,
    planName: dbBilling.planName,
    status: dbBilling.status,
    billingInterval: dbBilling.billingInterval,
    creditsAllocated: dbShop.creditsAllocated,
    creditsUsed: dbShop.creditsUsed,
  };
}
