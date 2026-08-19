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
      enum: ["Completed", "In Progress", "Failed"],
      default: "Completed",
      index: true,
    },
    totalVariantsScanned: {
      type: Number,
      default: 0,
    },
    duplicateGroupsFound: {
      type: Number,
      default: 0,
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
