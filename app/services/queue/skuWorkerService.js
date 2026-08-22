import { Worker } from "bullmq";
import { getRedisConnection, isQueueActive } from "./skuQueueService";
import { executeSkuGenerationRun } from "../sku/skuGenerationService";
import { unauthenticated } from "../../shopify.server";
import { connectMongoose } from "../../db.mongoose.server";
import SkuGenerationRun from "../../models/SkuGenerationRun.server";

const QUEUE_NAME = "sku-generation";
let workerInstance = null;

/**
 * Worker processor function: Executes enqueued SKU Generation job
 */
export async function processSkuGenerationJob(job) {
  const { runId, shopDomain, selection, skuConfiguration, ruleName, idempotencyKey } = job.data;

  console.log(`[SkuWorker] Starting processing job for shop ${shopDomain} (Run ID: ${runId})`);

  await connectMongoose();

  // Retrieve unauthenticated GraphQL admin context for shopDomain from offline session storage
  const { admin, session } = await unauthenticated.admin(shopDomain);

  if (!admin) {
    throw new Error(`Failed to initialize offline admin session for shop ${shopDomain}`);
  }

  // Execute generation run via Hybrid Engine
  const result = await executeSkuGenerationRun({
    admin,
    session,
    selection,
    skuConfiguration,
    ruleName,
    idempotencyKey,
    existingRunId: runId, // Pass pre-created run ID
  });

  console.log(`[SkuWorker] Finished processing run ${runId} with status: ${result?.status || "COMPLETED"}`);
  return result;
}

/**
 * Initialize BullMQ Worker listener if Redis is connected
 */
export function initSkuWorker() {
  const redisConnection = getRedisConnection();

  if (!redisConnection) {
    console.log("[SkuWorker] Redis queue not active. Worker listener omitted.");
    return null;
  }

  if (workerInstance) return workerInstance;

  try {
    workerInstance = new Worker(
      QUEUE_NAME,
      async (job) => {
        return await processSkuGenerationJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 5, // Process up to 5 concurrent SKU generation runs across shops
      }
    );

    workerInstance.on("completed", (job) => {
      console.log(`[SkuWorker] Job ${job.id} completed successfully.`);
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
