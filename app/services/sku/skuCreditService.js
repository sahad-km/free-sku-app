import { connectMongoose } from "../../db.mongoose.server";
import Shop from "../../models/Shop.server";

/**
 * Atomic Credit Management Service
 */

/**
 * Check if shop has sufficient credits without modifying state
 */
export async function checkShopCredits({ shopDomain, requiredCredits = 1 }) {
  if (!shopDomain) {
    throw new Error("shopDomain is required to check credits");
  }

  await connectMongoose();
  let shopDoc = await Shop.findOne({ shopDomain });

  if (!shopDoc) {
    // Auto-create shop if missing
    shopDoc = await Shop.create({
      shopDomain,
      shopName: shopDomain.split(".")[0],
      creditsAllocated: 100,
      creditsUsed: 0,
    });
  }

  const allocated = shopDoc.creditsAllocated ?? 100;
  const used = shopDoc.creditsUsed ?? 0;
  const remaining = Math.max(0, allocated - used);
  const hasCredits = remaining >= requiredCredits;

  return {
    hasCredits,
    requiredCredits,
    creditsAllocated: allocated,
    creditsUsed: used,
    remainingCredits: remaining,
  };
}

/**
 * Atomically reserve credits before generation
 */
export async function reserveShopCredits({ shopDomain, requiredCredits = 1 }) {
  await connectMongoose();

  const creditStatus = await checkShopCredits({ shopDomain, requiredCredits });
  if (!creditStatus.hasCredits) {
    return {
      success: false,
      reason: "INSUFFICIENT_CREDITS",
      requiredCredits,
      availableCredits: creditStatus.remainingCredits,
    };
  }

  // Atomically increment creditsUsed
  const updatedShop = await Shop.findOneAndUpdate(
    { shopDomain },
    { $inc: { creditsUsed: requiredCredits } },
    { new: true }
  );

  return {
    success: true,
    reservedCredits: requiredCredits,
    creditsUsed: updatedShop ? updatedShop.creditsUsed : creditStatus.creditsUsed + requiredCredits,
    creditsAllocated: updatedShop ? updatedShop.creditsAllocated : creditStatus.creditsAllocated,
  };
}

/**
 * Atomically refund unused or failed credits
 */
export async function refundShopCredits({ shopDomain, refundCount = 1 }) {
  if (refundCount <= 0) return;
  await connectMongoose();

  const shopDoc = await Shop.findOne({ shopDomain });
  if (!shopDoc) return;

  const currentUsed = Math.max(0, shopDoc.creditsUsed || 0);
  const newUsed = Math.max(0, currentUsed - refundCount);

  await Shop.findOneAndUpdate(
    { shopDomain },
    { $set: { creditsUsed: newUsed } },
    { new: true }
  );
}
