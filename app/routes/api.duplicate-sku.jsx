import { authenticate } from "../shopify.server";
import {
  executeCatalogDuplicateScan,
  getDuplicateSummaryAndGroups,
  getScanHistory,
} from "../services/sku/duplicateScanService.server";
import { resolveDuplicateGroup } from "../services/sku/duplicateResolutionService.server";
import { requireEntitlementGuard, FEATURES } from "../services/billing/entitlementService.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sort") || "severity";
  const intent = url.searchParams.get("intent") || "";

  try {
    if (intent === "history") {
      const history = await getScanHistory({ shopDomain });
      return new Response(JSON.stringify({ history }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await getDuplicateSummaryAndGroups({ shopDomain, searchQuery: search, sortBy });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[API Duplicate SKU Loader Error]:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  try {
    const body = await request.json();
    const { intent = "scan", groupId, method = "generate", manualSku = "", selectedKeepId = "" } = body;

    if (intent === "scan") {
      const scanRes = await executeCatalogDuplicateScan({ admin, shopDomain });
      return new Response(JSON.stringify(scanRes), { status: 200 });
    }

    if (intent === "resolve" || intent === "ignore") {
      if (intent === "resolve") {
        await requireEntitlementGuard(shopDomain, FEATURES.DUPLICATE_RESOLUTION);
      }
      const resolveRes = await resolveDuplicateGroup({
        admin,
        shopDomain,
        groupId,
        method: intent === "ignore" ? "ignore" : method,
        manualSku,
        selectedKeepId,
      });
      return new Response(JSON.stringify(resolveRes), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error("[API Duplicate SKU Action Error]:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Operation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
