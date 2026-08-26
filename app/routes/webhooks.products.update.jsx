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
    console.error("[Webhook Auth Error - products/update]:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  const { shop, topic, payload } = authResult;
  console.log(`[Webhook PRODUCTS_UPDATE] Received ${topic} webhook for shop ${shop}`);

  if (!shop || !payload) {
    return new Response(null, { status: 400 });
  }

  const productId = payload?.admin_graphql_api_id || (payload?.id ? `gid://shopify/Product/${payload.id}` : null);
  if (!productId) return new Response(null, { status: 200 });

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
        triggerType: "Product updated",
      })
        .then((res) => {
          console.log(`[Webhook PRODUCTS_UPDATE Result] for ${shop}:`, JSON.stringify(res));
        })
        .catch((err) => {
          console.error(`[Webhook PRODUCTS_UPDATE Exec Error] for ${shop}:`, err.message);
        });
    } else {
      console.warn(`[Webhook PRODUCTS_UPDATE Warning] Could not obtain admin GraphQL context for shop ${shop}`);
    }
  } catch (err) {
    console.error(`[Webhook PRODUCTS_UPDATE Exception] for shop ${shop}:`, err.message);
  }

  return new Response(null, { status: 200 });
};
