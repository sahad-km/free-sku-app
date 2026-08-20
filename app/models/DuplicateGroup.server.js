import mongoose from "mongoose";

const DuplicateGroupSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    scanRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DuplicateScan",
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    groupTag: {
      type: String,
      default: "Exact Match",
    },
    duplicateType: {
      type: String,
      default: "Exact SKU Match",
    },
    status: {
      type: String,
      enum: ["UNRESOLVED", "RESOLVED", "IGNORED"],
      default: "UNRESOLVED",
      index: true,
    },
    records: [
      {
        id: { type: String, required: true },
        productId: { type: String, required: true },
        variantId: { type: String, required: true },
        product: { type: String, required: true },
        variant: { type: String, required: true },
        currentSku: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

DuplicateGroupSchema.index({ shopDomain: 1, status: 1, createdAt: -1 });
DuplicateGroupSchema.index({ shopDomain: 1, sku: 1 });

export default mongoose.models.DuplicateGroup ||
  mongoose.model("DuplicateGroup", DuplicateGroupSchema);
