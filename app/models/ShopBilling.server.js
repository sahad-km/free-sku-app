import mongoose from "mongoose";

const ShopBillingSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    shopDomain: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    planHandle: {
      type: String,
      enum: ["FREE", "BASIC_MONTHLY", "BASIC_YEARLY", "PRO_MONTHLY", "PRO_YEARLY"],
      default: "FREE",
      required: true,
    },
    planName: {
      type: String,
      enum: ["Free", "Basic", "Pro"],
      default: "Free",
      required: true,
    },
    billingInterval: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
    },
    subscriptionId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["FREE", "ACTIVE", "PENDING", "CANCELLED", "EXPIRED", "FROZEN", "DECLINED"],
      default: "FREE",
      index: true,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ShopBilling || mongoose.model("ShopBilling", ShopBillingSchema);
