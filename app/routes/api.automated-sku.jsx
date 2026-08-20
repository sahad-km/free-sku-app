import { authenticate } from "../shopify.server";
import {
  getAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  toggleAutomationRuleStatus,
  evaluateAutomatedSkuForProduct,
} from "../services/sku/automatedSkuService.server";
import { resolveSkuSelection } from "../services/sku/skuSelectionService";
import { requireEntitlementGuard, FEATURES } from "../services/billing/entitlementService.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const statusTab = url.searchParams.get("tab") || "All rules";

  try {
    const result = await getAutomationRules({ shopDomain, search, statusTab });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[API Automated SKU Loader Error]:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session?.shop;
  const method = request.method.toUpperCase();

  try {
    await requireEntitlementGuard(shopDomain, FEATURES.AUTOMATED_SKU);
    const body = await request.json();

    if (method === "POST") {
      const { name, description, trigger, scope, skuConfiguration } = body;
      const result = await createAutomationRule({
        shopDomain,
        name,
        description,
        trigger,
        scope,
        skuConfiguration,
      });
      return new Response(JSON.stringify(result), { status: 201 });
    }

    if (method === "PATCH") {
      const { intent, ruleId, updateData } = body;

      if (intent === "toggle-status") {
        const result = await toggleAutomationRuleStatus({ shopDomain, ruleId });
        return new Response(JSON.stringify(result), { status: 200 });
      }

      if (intent === "run-now") {
        // Fetch sample products from catalog to evaluate immediately
        const selectionRes = await resolveSkuSelection({
          admin,
          selection: { type: "ALL_PRODUCTS" },
          limit: 5,
        });
        const sampleProducts = selectionRes.products || [];

        let totalGenerated = 0;
        for (const p of sampleProducts) {
          const evalRes = await evaluateAutomatedSkuForProduct({
            admin,
            shopDomain,
            productId: p.id,
          });
          totalGenerated += evalRes.totalGenerated || 0;
        }

        return new Response(
          JSON.stringify({ success: true, totalGenerated, message: "Rule triggered successfully" }),
          { status: 200 }
        );
      }

      const result = await updateAutomationRule({ shopDomain, ruleId, updateData });
      return new Response(JSON.stringify(result), { status: 200 });
    }

    if (method === "DELETE") {
      const { ruleId } = body;
      const result = await deleteAutomationRule({ shopDomain, ruleId });
      return new Response(JSON.stringify(result), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error("[API Automated SKU Action Error]:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Operation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
