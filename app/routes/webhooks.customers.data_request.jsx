import { authenticate } from "../shopify.server";
import { handleCustomerDataRequest } from "../services/shopify/complianceService.server";

export const action = async ({ request }) => {
  let authResult;
  try {
    authResult = await authenticate.webhook(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("[Webhook Auth Error - customers/data_request]:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  const { shop, payload } = authResult;

  try {
    await handleCustomerDataRequest({ shop, payload });
    return new Response("Customer Data Request Processed", { status: 200 });
  } catch (error) {
    console.error(`[Webhook CUSTOMERS_DATA_REQUEST Error] for ${shop}:`, error);
    return new Response("Webhook Processing Error", { status: 500 });
  }
};
