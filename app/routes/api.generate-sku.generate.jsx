import { authenticate } from "../shopify.server";
import { executeSkuGenerationRun } from "../services/sku/skuGenerationService.server";
import { requireEntitlementGuard, FEATURES } from "../services/billing/entitlementService.server";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { admin, session } = await authenticate.admin(request);
    await requireEntitlementGuard(session.shop, FEATURES.MANUAL_GENERATE_SKU);
    const body = await request.json();

    const idempotencyKey = request.headers.get("idempotency-key") || body.idempotencyKey || null;

    const {
      selection = { type: "ALL_PRODUCTS" },
      skuConfiguration = {},
      ruleName = "Manual SKU Run",
    } = body;

    const result = await executeSkuGenerationRun({
      admin,
      session,
      selection,
      skuConfiguration,
      ruleName,
      idempotencyKey,
    });

    if (!result.success && result.errorCode) {
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[API Generate SKU Error]:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to execute SKU generation" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
