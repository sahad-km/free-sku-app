import { authenticate } from "../shopify.server";
import { getSkuHistoryDetail, getGeneratedSkusForRun } from "../services/sku/skuHistoryService.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;
  const { runId } = params;

  if (!shopDomain) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const limit = url.searchParams.get("limit") || 100;

  const runDetail = await getSkuHistoryDetail({ shopDomain, runId });
  if (!runDetail) {
    return new Response(JSON.stringify({ error: "Run not found or unauthorized" }), { status: 404 });
  }

  const { items: auditLogs } = await getGeneratedSkusForRun({ shopDomain, runId, search, limit });

  return new Response(
    JSON.stringify({
      success: true,
      run: runDetail,
      auditLogs,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
