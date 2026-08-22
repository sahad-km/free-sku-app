import SkuGenerationRun from "./app/models/SkuGenerationRun.server.js";
import GeneratedSku from "./app/models/GeneratedSku.server.js";
import { connectMongoose } from "./app/db.mongoose.server.js";

process.env.MONGODB_URI = "mongodb+srv://catalystcreationapps:7E4IiofePmW3diIU@cluster0.qombf.mongodb.net/?appName=Cluster0";

async function main() {
  await connectMongoose();
  const lastRun = await SkuGenerationRun.findOne().sort({ createdAt: -1 });

  if (!lastRun) {
    console.log("No runs found.");
    process.exit(0);
  }

  console.log("=== LATEST RUN LOG ===");
  console.log(`ID: ${lastRun._id} | CreatedAt: ${lastRun.createdAt}`);
  console.log(`Rule: ${lastRun.ruleName}`);
  console.log(`Status: ${lastRun.status}`);
  console.log(`TotalProducts: ${lastRun.totalProducts} | TotalVariants: ${lastRun.totalVariants}`);
  console.log(`ProcessedVariants: ${lastRun.processedVariants} | Successful: ${lastRun.successfulVariants} | Failed: ${lastRun.failedVariants} | Skipped: ${lastRun.skippedVariants}`);
  console.log(`ErrorSummary: ${lastRun.errorSummary || "NONE"}`);
  console.log(`Config:`, JSON.stringify(lastRun.skuConfiguration));

  const auditRows = await GeneratedSku.find({ generationRunId: lastRun._id.toString() }).limit(5);
  console.log(`=== AUDIT ROWS FOR RUN ${lastRun._id} ===`);
  for (const r of auditRows) {
    console.log(`Product: ${r.productTitleSnapshot} | Variant: ${r.variantTitleSnapshot}`);
    console.log(`Status: ${r.status} | ErrorCode: ${r.errorCode} | ErrorMessage: ${r.errorMessage}`);
  }

  process.exit(0);
}

main().catch(console.error);
