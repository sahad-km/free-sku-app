import SkuGenerationRun from "../../models/SkuGenerationRun.server";
import { connectMongoose } from "../../db.mongoose.server";

/**
 * Background / Async Generation Job Service
 * Tracks progress and status for large catalog generation runs.
 */

export async function createGenerationRunRecord({
  shopDomain,
  ruleName = "Manual SKU Run",
  selection = {},
  skuConfiguration = {},
  totalProducts = 0,
  totalVariants = 0,
  creditsReserved = 0,
  idempotencyKey = null,
}) {
  await connectMongoose();

  // Idempotency check: if matching idempotencyKey exists for this shop, return existing run
  if (idempotencyKey) {
    const existing = await SkuGenerationRun.findOne({ shopDomain, idempotencyKey });
    if (existing) return existing;
  }

  const runDoc = await SkuGenerationRun.create({
    shopDomain,
    idempotencyKey: idempotencyKey || undefined,
    ruleName,
    status: "PROCESSING",
    scopeType: selection.type || "ALL_PRODUCTS",
    selectionSnapshot: selection,
    skuConfiguration,
    totalProducts,
    totalVariants,
    processedVariants: 0,
    successfulVariants: 0,
    failedVariants: 0,
    skippedVariants: 0,
    creditsReserved,
    creditsConsumed: 0,
    creditsUsed: creditsReserved,
    startedAt: new Date(),
  });

  return runDoc;
}

export async function updateGenerationRunProgress({
  runId,
  processed = 0,
  successful = 0,
  failed = 0,
  skipped = 0,
  status = "PROCESSING",
  errorSummary = "",
}) {
  await connectMongoose();

  const updateFields = {
    $inc: {
      processedVariants: processed,
      successfulVariants: successful,
      failedVariants: failed,
      skippedVariants: skipped,
      skusGenerated: successful,
    },
    status,
  };

  if (errorSummary) {
    updateFields.errorSummary = errorSummary;
  }

  if (status === "Completed" || status === "COMPLETED_WITH_ERRORS" || status === "Failed") {
    updateFields.completedAt = new Date();
  }

  const updated = await SkuGenerationRun.findByIdAndUpdate(runId, updateFields, { new: true });
  return updated;
}
