import { Worker } from "bullmq";
import { getRedisConnection, isQueueActive } from "./skuQueueService.server";
import { executeSkuGenerationRun } from "../sku/skuGenerationService.server";
import { evaluateAutomatedSkuForProduct } from "../sku/automatedSkuService.server";
import { unauthenticated } from "../../shopify.server";
import { connectMongoose } from "../../db.mongoose.server";
import SkuGenerationRun from "../../models/SkuGenerationRun.server";

const QUEUE_NAME = "sku-generation";
let workerInstance = null;

/**
 * Worker processor function: Handles both Manual and Automated SKU jobs
 */
export async function processSkuJob(job) {
  const { jobType = "manual-sku", shopDomain, productId, triggerType } = job.data;

  await connectMongoose();
  const { admin } = await unauthenticated.admin(shopDomain);

  if (!admin) {
    throw new Error(`Failed to initialize offline admin session for shop ${shopDomain}`);
  }

  if (jobType === "automated-sku") {
    console.log(`[SkuWorker] Processing automated SKU job for shop ${shopDomain} (Product: ${productId})`);
    return await evaluateAutomatedSkuForProduct({
      admin,
      shopDomain,
      productId,
      triggerType,
    });
  }

  // Default: Manual SKU Generation run
  const { runId, selection, skuConfiguration, ruleName, idempotencyKey } = job.data;
  console.log(`[SkuWorker] Starting manual SKU job for shop ${shopDomain} (Run ID: ${runId})`);

  const result = await executeSkuGenerationRun({
    admin,
    session: { shop: shopDomain },
    selection,
    skuConfiguration,
    ruleName,
    idempotencyKey,
    existingRunId: runId,
  });

  console.log(`[SkuWorker] Finished manual run ${runId} with status: ${result?.status || "COMPLETED"}`);
  return result;
}

/**
 * Initialize BullMQ Worker listener if Redis is connected
 */
export function initSkuWorker() {
  const redisConnection = getRedisConnection();

  if (!isQueueActive() || !redisConnection) {
    console.log("[SkuWorker] Redis queue not active. Worker listener omitted.");
    return null;
  }

  if (workerInstance) return workerInstance;

  try {
    workerInstance = new Worker(
      QUEUE_NAME,
      async (job) => {
        return await processSkuJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 5,
      }
    );

    workerInstance.on("completed", (job) => {
      console.log(`[SkuWorker] Job ${job.id} (${job.name}) completed successfully.`);
    });

    workerInstance.on("failed", async (job, err) => {
      console.error(`[SkuWorker] Job ${job?.id} failed with error:`, err.message);
      if (job?.data?.runId) {
        await connectMongoose();
        await SkuGenerationRun.findByIdAndUpdate(job.data.runId, {
          status: "Failed",
          errorSummary: `Worker Failure: ${err.message}`,
        }).catch(() => {});
      }
    });

    console.log("[SkuWorker] BullMQ Worker listener initialized with concurrency: 5");
    return workerInstance;
  } catch (err) {
    console.warn("[SkuWorker] Failed to start BullMQ Worker:", err.message);
    return null;
  }
}
