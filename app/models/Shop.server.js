import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    shopDomain: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    shopifyShopId: {
      type: String,
      index: true,
    },
    shopName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    plan: {
      type: String,
      enum: ["Basic", "Pro", "Advanced", "Enterprise"],
      default: "Pro",
    },
    creditsAllocated: {
      type: Number,
      default: 100,
    },
    creditsUsed: {
      type: Number,
      default: 40,
    },
    installationStatus: {
      type: String,
      enum: ["active", "uninstalled"],
      default: "active",
      index: true,
    },
    lastSyncAt: {
      type: Date,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalVariants: {
      type: Number,
      default: 0,
    },
    catalogCountsSyncedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
