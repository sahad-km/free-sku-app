import { authenticate } from "../shopify.server";
import { calculateSelectionScopeCounts } from "../services/sku/skuSelectionService";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { admin } = await authenticate.admin(request);
    const body = await request.json();
    const { selection = { type: "ALL_PRODUCTS" } } = body;

    const scopeCounts = await calculateSelectionScopeCounts({ admin, selection });

    return new Response(
      JSON.stringify({
        success: true,
        scopeCounts,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[API Scope Counts Error]:", err.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Failed to calculate scope counts",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
