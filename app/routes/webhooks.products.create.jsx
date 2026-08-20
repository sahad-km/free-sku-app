import { authenticate, unauthenticated } from "../shopify.server";
import { addAutomatedSkuJob } from "../services/queue/skuQueueService.server";
import { evaluateAutomatedSkuForProduct } from "../services/sku/automatedSkuService.server";

export const action = async ({ request }) => {
  try {
    const { shop, topic, payload } = await authenticate.webhook(request);
    console.log(`[Webhook] Received ${topic} webhook for shop ${shop}`);

    const productId = payload?.admin_graphql_api_id || (payload?.id ? `gid://shopify/Product/${payload.id}` : null);
    if (!productId) return new Response(null, { status: 200 });

    const eventId = request.headers.get("x-shopify-webhook-id") || `evt-${Date.now()}`;

    const queueRes = await addAutomatedSkuJob({
      shopDomain: shop,
      productId,
      triggerType: "New product added",
      eventId,
    });

    if (!queueRes.isQueue) {
      // Fallback in-process execution when Redis is unconfigured
      const { admin } = await unauthenticated.admin(shop);
      if (admin) {
        evaluateAutomatedSkuForProduct({
          admin,
          shopDomain: shop,
          productId,
          triggerType: "New product added",
        }).catch((err) => console.warn("[Automated SKU Fallback Error]:", err.message));
      }
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("[Webhook Exception]:", err.message);
    return new Response(null, { status: 400 });
  }
};
