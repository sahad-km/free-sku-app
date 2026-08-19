import mongoose from "mongoose";

const ShopSkuCounterSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    counterKey: {
      type: String,
      required: true,
      default: "default",
    },
    nextValue: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

ShopSkuCounterSchema.index({ shopDomain: 1, counterKey: 1 }, { unique: true });

export default mongoose.models.ShopSkuCounter ||
  mongoose.model("ShopSkuCounter", ShopSkuCounterSchema);
