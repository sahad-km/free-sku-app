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
    skuConfiguration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastRunAt: {
      type: Date,
    },
    nextRunAt: {
      type: Date,
    },
    runCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

AutomationRuleSchema.index({ shopDomain: 1, status: 1 });

export default mongoose.models.AutomationRule ||
  mongoose.model("AutomationRule", AutomationRuleSchema);
