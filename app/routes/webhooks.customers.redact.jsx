import { authenticate } from "../shopify.server";
import { handleCustomerRedact } from "../services/shopify/complianceService.server";

export const action = async ({ request }) => {
  let authResult;
  try {
    authResult = await authenticate.webhook(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("[Webhook Auth Error - customers/redact]:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  const { shop, payload } = authResult;

  try {
    await handleCustomerRedact({ shop, payload });
    return new Response("Customer Redact Processed", { status: 200 });
  } catch (error) {
    console.error(`[Webhook CUSTOMERS_REDACT Error] for ${shop}:`, error);
    return new Response("Webhook Processing Error", { status: 500 });
  }
};
