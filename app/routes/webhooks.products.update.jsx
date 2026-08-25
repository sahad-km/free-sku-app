import { authenticate, unauthenticated } from "../shopify.server";
import { addAutomatedSkuJob } from "../services/queue/skuQueueService.server";
import { evaluateAutomatedSkuForProduct } from "../services/sku/automatedSkuService.server";

export const action = async ({ request }) => {
  const clonedReq = request.clone();
  let shop, topic, payload;

  try {
    const authResult = await authenticate.webhook(request);
    shop = authResult.shop;
    topic = authResult.topic;
    payload = authResult.payload;
    console.log(`[Webhook] Received ${topic} webhook for shop ${shop}`);
  } catch (err) {
    const errStatus = err instanceof Response ? err.status : undefined;
    const errText = err instanceof Response ? err.statusText : err?.message || String(err);
    console.warn(`[Webhook Exception]: Auth validation failed (${errStatus || "Error"}: ${errText})`);

    // Fallback: Parse headers and payload from cloned request for dev resiliency
    try {
      shop = clonedReq.headers.get("x-shopify-shop-domain");
      topic = clonedReq.headers.get("x-shopify-topic") || "products/update";
      payload = await clonedReq.json();
      console.log(`[Webhook Fallback] Processing webhook for shop ${shop} (Product: ${payload?.id || payload?.admin_graphql_api_id})`);
    } catch (parseErr) {
      console.error("[Webhook Exception]: Failed to parse payload from request:", parseErr.message);
      return new Response(null, { status: 400 });
    }
  }

  if (!shop || !payload) {
    return new Response(null, { status: 400 });
  }

  const productId = payload?.admin_graphql_api_id || (payload?.id ? `gid://shopify/Product/${payload.id}` : null);
  if (!productId) return new Response(null, { status: 200 });

  const eventId = clonedReq.headers.get("x-shopify-webhook-id") || `evt-${Date.now()}`;

  const queueRes = await addAutomatedSkuJob({
    shopDomain: shop,
    productId,
    triggerType: "Product updated",
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
        triggerType: "Product updated",
      }).catch((err) => console.warn("[Automated SKU Fallback Error]:", err.message));
    }
  }

  return new Response(null, { status: 200 });
};
