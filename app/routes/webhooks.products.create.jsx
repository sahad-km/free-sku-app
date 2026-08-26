import { authenticate, unauthenticated } from "../shopify.server";
import { evaluateAutomatedSkuForProduct } from "../services/sku/automatedSkuService.server";

export const action = async ({ request }) => {
  let authResult;
  try {
    authResult = await authenticate.webhook(request);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("[Webhook Auth Error - products/create]:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  const { shop, topic, payload } = authResult;
  console.log(`[Webhook PRODUCTS_CREATE] Received ${topic} webhook for shop ${shop}`);

  if (!shop || !payload) {
    return new Response(null, { status: 400 });
  }

  const productId = payload?.admin_graphql_api_id || (payload?.id ? `gid://shopify/Product/${payload.id}` : null);
  if (!productId) {
    console.warn(`[Webhook PRODUCTS_CREATE] Missing productId in payload for shop ${shop}`);
    return new Response(null, { status: 200 });
  }

  console.log(`[Webhook PRODUCTS_CREATE] Processing SKU evaluation for product ${productId} on shop ${shop}`);

  // Retrieve admin GraphQL client directly from authResult or fallback to unauthenticated offline session
  try {
    let admin = authResult?.admin;
    if (!admin) {
      const cleanShop = shop.toLowerCase().trim();
      const unauthResult = await unauthenticated.admin(shop).catch(() => null) ||
                           await unauthenticated.admin(cleanShop).catch(() => null);
      admin = unauthResult?.admin;
    }

    if (admin) {
      evaluateAutomatedSkuForProduct({
        admin,
        shopDomain: shop,
        productId,
        triggerType: "New product added",
      })
        .then((res) => {
          console.log(`[Webhook PRODUCTS_CREATE Result] for ${shop}:`, JSON.stringify(res));
        })
        .catch((err) => {
          console.error(`[Webhook PRODUCTS_CREATE Exec Error] for ${shop}:`, err.message);
        });
    } else {
      console.warn(`[Webhook PRODUCTS_CREATE Warning] Could not obtain admin GraphQL context for shop ${shop}`);
    }
  } catch (err) {
    console.error(`[Webhook PRODUCTS_CREATE Exception] for shop ${shop}:`, err.message);
  }

  return new Response(null, { status: 200 });
};
