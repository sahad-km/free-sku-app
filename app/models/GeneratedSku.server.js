import mongoose from "mongoose";

const GeneratedSkuSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    generationRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkuGenerationRun",
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    variantId: {
      type: String,
      required: true,
      index: true,
    },
    productTitleSnapshot: {
      type: String,
      default: "",
    },
    variantTitleSnapshot: {
      type: String,
      default: "",
    },
    previousSku: {
      type: String,
      default: "",
    },
    newSku: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "SKIPPED"],
      default: "SUCCESS",
      index: true,
    },
    errorCode: {
      type: String,
      default: "",
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

GeneratedSkuSchema.index({ shopDomain: 1, variantId: 1 });
GeneratedSkuSchema.index({ shopDomain: 1, newSku: 1 });
GeneratedSkuSchema.index({ shopDomain: 1, generationRunId: 1 });

export default mongoose.models.GeneratedSku ||
  mongoose.model("GeneratedSku", GeneratedSkuSchema);
