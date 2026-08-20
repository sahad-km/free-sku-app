import mongoose from "mongoose";

const DuplicateScanSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["QUEUED", "In Progress", "Completed", "Failed"],
      default: "Completed",
      index: true,
    },
    totalProductsScanned: {
      type: Number,
      default: 0,
    },
    totalVariantsScanned: {
      type: Number,
      default: 0,
    },
    duplicateGroupsFound: {
      type: Number,
      default: 0,
    },
    affectedVariants: {
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
    scanType: {
      type: String,
      default: "FULL_CATALOG",
    },
    error: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

DuplicateScanSchema.index({ shopDomain: 1, createdAt: -1 });

export default mongoose.models.DuplicateScan ||
  mongoose.model("DuplicateScan", DuplicateScanSchema);
