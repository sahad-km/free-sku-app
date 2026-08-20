import mongoose from "mongoose";

const AutomationRuleSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Paused", "Draft"],
      default: "Active",
      index: true,
    },
    trigger: {
      type: String,
      default: "New product added",
    },
    scope: {
      type: String,
      default: "All products",
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skuConfiguration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skusGenerated: {
      type: Number,
      default: 0,
    },
    runCount: {
      type: Number,
      default: 0,
    },
    lastRunAt: {
      type: Date,
    },
    lastRunStatus: {
      type: String,
      enum: ["SUCCESS", "FAILED", "SKIPPED", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

AutomationRuleSchema.index({ shopDomain: 1, status: 1 });
AutomationRuleSchema.index({ shopDomain: 1, createdAt: -1 });

export default mongoose.models.AutomationRule ||
  mongoose.model("AutomationRule", AutomationRuleSchema);
