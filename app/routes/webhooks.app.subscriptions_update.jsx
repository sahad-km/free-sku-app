import { authenticate } from "../shopify.server";
import Shop from "../models/Shop.server";
import ShopBilling from "../models/ShopBilling.server";
import { mapShopifySubscriptionToHandle, getPlanConfigByHandle, PLAN_HANDLES } from "../services/billing/planConfig.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  if (topic !== "APP_SUBSCRIPTIONS_UPDATE") {
    return new Response("Topic Ignored", { status: 200 });
  }

  try {
    const dbShop = await Shop.findOne({ shopDomain: shop });
    let dbBilling = await ShopBilling.findOne({ shopDomain: shop });

    if (!dbShop) {
      return new Response("Shop Not Found", { status: 200 });
    }

    if (!dbBilling) {
      dbBilling = new ShopBilling({
        shopId: dbShop._id,
        shopDomain: shop,
      });
    }

    const appSubscription = payload?.app_subscription;
    const status = appSubscription?.status;

    if (status === "ACTIVE") {
      const handle = mapShopifySubscriptionToHandle({
        name: appSubscription.name,
        status: appSubscription.status,
        lineItems: appSubscription.line_items,
      });

      const planConfig = getPlanConfigByHandle(handle);

      dbBilling.planHandle = handle;
      dbBilling.planName = planConfig.name;
      dbBilling.subscriptionId = appSubscription.admin_graphql_api_id;
      dbBilling.status = "ACTIVE";
      dbBilling.lastVerifiedAt = new Date();

      dbShop.plan = planConfig.name;
      dbShop.creditsAllocated = planConfig.entitlements.monthlyCredits;
    } else {
      // CANCELLED / EXPIRED / FROZEN -> Downgrade to Free
      const freeConfig = getPlanConfigByHandle(PLAN_HANDLES.FREE);

      dbBilling.planHandle = PLAN_HANDLES.FREE;
      dbBilling.planName = "Free";
      dbBilling.subscriptionId = null;
      dbBilling.status = status === "DECLINED" ? "DECLINED" : "FREE";
      dbBilling.lastVerifiedAt = new Date();

      dbShop.plan = "Free";
      dbShop.creditsAllocated = freeConfig.entitlements.monthlyCredits;
    }

    await dbBilling.save();
    await dbShop.save();

    return new Response("Webhook Processed", { status: 200 });
  } catch (err) {
    console.error(`[Webhook APP_SUBSCRIPTIONS_UPDATE Error] for ${shop}:`, err);
    return new Response("Webhook Error", { status: 500 });
  }
};
