import { authenticate } from "../shopify.server";
import {
  handleCustomerDataRequest,
  handleCustomerRedact,
  handleShopRedact,
} from "../services/shopify/complianceService.server";

export const action = async ({ request }) => {
  let authResult;
  try {
    authResult = await authenticate.webhook(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("[Webhook Auth Error - compliance]:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  const { shop, payload, topic } = authResult;
  console.log(`[Compliance Webhook Route] Received ${topic} for shop ${shop}`);

  const normalizedTopic = (topic || "").toUpperCase().replace(/\//g, "_");

  try {
    switch (normalizedTopic) {
      case "CUSTOMERS_DATA_REQUEST":
        await handleCustomerDataRequest({ shop, payload });
        break;
      case "CUSTOMERS_REDACT":
        await handleCustomerRedact({ shop, payload });
        break;
      case "SHOP_REDACT":
        await handleShopRedact({ shop, payload });
        break;
      default:
        console.warn(`[Compliance Webhook Route] Unhandled topic: ${topic}`);
    }

    return new Response("Webhook Processed", { status: 200 });
  } catch (error) {
    console.error(`[Compliance Webhook Error] ${topic} for ${shop}:`, error);
    return new Response("Webhook Processing Error", { status: 500 });
  }
};
