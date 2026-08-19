import { authenticate } from "../shopify.server";
import { connectMongoose } from "../db.mongoose.server";
import SkuGenerationRun from "../models/SkuGenerationRun.server";
import GeneratedSku from "../models/GeneratedSku.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;
  const { runId } = params;

  if (!shopDomain) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectMongoose();

  const runDoc = await SkuGenerationRun.findOne({ _id: runId, shopDomain });
  if (!runDoc) {
    return new Response(JSON.stringify({ error: "Run not found" }), { status: 404 });
  }

  const auditLogs = await GeneratedSku.find({ generationRunId: runId, shopDomain })
    .sort({ createdAt: -1 })
    .limit(100);

  return new Response(
    JSON.stringify({
      success: true,
      run: runDoc,
      auditLogs,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
