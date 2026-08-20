import mongoose from "mongoose";

const SkuGenerationRunSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
    ruleName: {
      type: String,
      required: true,
      default: "Manual SKU Run",
    },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "Completed", "COMPLETED_WITH_ERRORS", "Failed", "In Progress", "CANCELLED"],
      default: "PROCESSING",
      index: true,
    },
    scopeType: {
      type: String,
      default: "ALL_PRODUCTS",
    },
    selectionSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skuConfiguration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalVariants: {
      type: Number,
      default: 0,
    },
    processedVariants: {
      type: Number,
      default: 0,
    },
    successfulVariants: {
      type: Number,
      default: 0,
    },
    failedVariants: {
      type: Number,
      default: 0,
    },
    skippedVariants: {
      type: Number,
      default: 0,
    },
    variantsWithSku: {
      type: Number,
      default: 0,
    },
    variantsWithoutSku: {
      type: Number,
      default: 0,
    },
    skusGenerated: {
      type: Number,
      default: 0,
    },
    creditsReserved: {
      type: Number,
      default: 0,
    },
    creditsConsumed: {
      type: Number,
      default: 0,
    },
    creditsUsed: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    errorSummary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

SkuGenerationRunSchema.index({ shopDomain: 1, createdAt: -1 });
SkuGenerationRunSchema.index({ shopDomain: 1, status: 1, createdAt: -1 });
SkuGenerationRunSchema.index({ shopDomain: 1, scopeType: 1, createdAt: -1 });
SkuGenerationRunSchema.index({ shopDomain: 1, idempotencyKey: 1 });
SkuGenerationRunSchema.index({ shopDomain: 1, ruleName: 1 });

export default mongoose.models.SkuGenerationRun ||
  mongoose.model("SkuGenerationRun", SkuGenerationRunSchema);
