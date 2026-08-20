import { Queue } from "bullmq";
import Redis from "ioredis";

const QUEUE_NAME = "sku-generation";

let redisConnection = null;
let skuQueue = null;
let isRedisAvailable = false;

// Initialize Redis Connection if REDIS_URL is provided
const redisUrl = process.env.REDIS_URL || process.env.REDIS_KV_URL;

if (redisUrl) {
  try {
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn("[SkuQueue] Redis connection retries exhausted. Disabling BullMQ queue mode.");
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisConnection.on("connect", () => {
      console.log("[SkuQueue] Successfully connected to Redis.");
      isRedisAvailable = true;
    });

    redisConnection.on("error", (err) => {
      console.warn("[SkuQueue] Redis error:", err.message);
      isRedisAvailable = false;
    });

    skuQueue = new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  } catch (err) {
    console.warn("[SkuQueue] Failed to initialize Redis client:", err.message);
  }
} else {
  console.log("[SkuQueue] REDIS_URL not configured. Operating with in-process worker fallback.");
}

/**
 * Add a Manual SKU Generation job to the queue
 */
export async function addSkuGenerationJob(jobData) {
  const { runId, shopDomain, selection, skuConfiguration, ruleName, idempotencyKey } = jobData;

  if (isRedisAvailable && skuQueue) {
    try {
      const job = await skuQueue.add(
        "generate-skus",
        {
          jobType: "manual-sku",
          runId,
          shopDomain,
          selection,
          skuConfiguration,
          ruleName,
          idempotencyKey,
          queuedAt: new Date().toISOString(),
        },
        {
          jobId: runId,
        }
      );

      console.log(`[SkuQueue] Manual job ${job.id} enqueued for shop ${shopDomain}`);
      return { enqueued: true, jobId: job.id, isQueue: true };
    } catch (err) {
      console.warn("[SkuQueue] Failed to enqueue job, falling back to direct execution:", err.message);
    }
  }

  return { enqueued: false, isQueue: false };
}

/**
 * Add an Automated SKU Webhook job to the queue
 */
export async function addAutomatedSkuJob({ shopDomain, productId, triggerType, eventId }) {
  const jobId = `auto-${shopDomain}-${productId}-${eventId || Date.now()}`;

  if (isRedisAvailable && skuQueue) {
    try {
      const job = await skuQueue.add(
        "automated-sku-event",
        {
          jobType: "automated-sku",
          shopDomain,
          productId,
          triggerType,
          eventId,
          queuedAt: new Date().toISOString(),
        },
        {
          jobId,
        }
      );

      console.log(`[SkuQueue] Automated SKU job ${job.id} enqueued for shop ${shopDomain}`);
      return { enqueued: true, jobId: job.id, isQueue: true };
    } catch (err) {
      console.warn("[SkuQueue] Failed to enqueue automated job:", err.message);
    }
  }

  return { enqueued: false, isQueue: false };
}

export function getSkuQueueInstance() {
  return skuQueue;
}

export function getRedisConnection() {
  return redisConnection;
}

export function isQueueActive() {
  return isRedisAvailable && skuQueue !== null;
}
