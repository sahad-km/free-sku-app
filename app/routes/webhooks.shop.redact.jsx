import { authenticate } from "../shopify.server";
import { handleShopRedact } from "../services/shopify/complianceService.server";

export const action = async ({ request }) => {
  let authResult;
  try {
    authResult = await authenticate.webhook(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("[Webhook Auth Error - shop/redact]:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  const { shop, payload } = authResult;

  try {
    await handleShopRedact({ shop, payload });
    return new Response("Shop Redact Processed", { status: 200 });
  } catch (error) {
    console.error(`[Webhook SHOP_REDACT Error] for ${shop}:`, error);
    return new Response("Webhook Processing Error", { status: 500 });
  }
};
