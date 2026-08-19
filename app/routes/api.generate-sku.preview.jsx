import { authenticate } from "../shopify.server";
import { getSkuPreviewDataset } from "../services/sku/skuPreviewService";

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

    const {
      selection = { type: "ALL_PRODUCTS" },
      skuConfiguration = {},
      sort = "TITLE_ASC",
      search = "",
      cursor = null,
      limit = 10,
    } = body;

    const dataset = await getSkuPreviewDataset({
      admin,
      selection,
      skuConfiguration,
      sort,
      search,
      cursor,
      limit: parseInt(limit, 10) || 10,
    });

    return new Response(JSON.stringify({ success: true, ...dataset }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[API Preview Error]:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to generate preview" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
