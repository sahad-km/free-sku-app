import { Worker } from "bullmq";
import { getRedisConnection } from "./skuQueueService.server.js";
import { executeSkuGenerationRun } from "../sku/skuGenerationService.server.js";
import { evaluateAutomatedSkuForProduct } from "../sku/automatedSkuService.server.js";
import { unauthenticated } from "../../shopify.server.js";
import { connectMongoose } from "../../db.mongoose.server.js";
import SkuGenerationRun from "../../models/SkuGenerationRun.server.js";

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
 * Recover any stuck "QUEUED" runs in MongoDB that were submitted before worker was ready
 */

let isRecovering = false;
async function recoverStuckQueuedRuns() {
  if (isRecovering) return;
  isRecovering = true;

  try {
    await connectMongoose();
    const stuckRuns = await SkuGenerationRun.find({
      status: "QUEUED",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).limit(10);

    if (stuckRuns.length > 0) {
      console.log(`[SkuWorker] Found ${stuckRuns.length} stuck QUEUED run(s). Triggering recovery execution...`);

      for (const run of stuckRuns) {
        try {
          const { admin } = await unauthenticated.admin(run.shopDomain);
          if (admin) {
            console.log(`[SkuWorker Recovery] Recovering run ${run._id} for shop ${run.shopDomain}...`);
            await executeSkuGenerationRun({
              admin,
              session: { shop: run.shopDomain },
              selection: run.selectionSnapshot || { type: "ALL_PRODUCTS" },
              skuConfiguration: run.skuConfiguration || {},
              ruleName: run.ruleName || "Manual SKU Run",
              idempotencyKey: run.idempotencyKey,
              existingRunId: run._id.toString(),
            });
          }
        } catch (err) {
          console.warn(`[SkuWorker Recovery] Failed to recover run ${run._id}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.warn("[SkuWorker Recovery] Error during queued run recovery:", err.message);
  } finally {
    isRecovering = false;
  }
}

/**
 * Initialize BullMQ Worker listener if Redis is connected
 */
export function initSkuWorker() {
  const redisConnection = getRedisConnection();

  if (!redisConnection) {
    console.log("[SkuWorker] REDIS_URL not configured. Worker listener omitted.");
    return null;
  }

  if (workerInstance) {
    // Trigger recovery check on existing worker
    recoverStuckQueuedRuns().catch(() => {});
    return workerInstance;
  }

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

    workerInstance.on("ready", () => {
      console.log("[SkuWorker] BullMQ Worker listener connected and ready for jobs!");
      recoverStuckQueuedRuns().catch(() => {});
    });

    workerInstance.on("completed", (job) => {
      console.log(`[SkuWorker] Job ${job.id} (${job.name}) completed successfully.`);
    });

    workerInstance.on("failed", async (job, err) => {
      console.error(`[SkuWorker] Job ${job?.id} failed with error:`, err?.message);
      if (job?.data?.runId) {
        await connectMongoose();
        await SkuGenerationRun.findByIdAndUpdate(job.data.runId, {
          $set: {
            status: "Failed",
            errorSummary: `Worker Failure: ${err?.message || "Unknown error"}`,
            completedAt: new Date(),
          },
        }).catch(() => {});
      }
    });

    console.log("[SkuWorker] BullMQ Worker listener initialized with concurrency: 5");
    
    // Trigger immediate recovery check for any currently queued runs
    recoverStuckQueuedRuns().catch(() => {});

    return workerInstance;
  } catch (err) {
    console.warn("[SkuWorker] Failed to start BullMQ Worker:", err.message);
    return null;
  }
}
