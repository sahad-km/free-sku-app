import { connectMongoose } from "../../db.mongoose.server";
import ShopSkuCounter from "../../models/ShopSkuCounter.server";

/**
 * Atomic Sequential Number Counter Service
 * Atomically reserves sequence numbers for a given shopDomain and counterKey.
 */
export async function getNextSequenceNumber({
  shopDomain,
  counterKey = "default",
  startNumber = 1,
  incrementStep = 1,
  count = 1,
}) {
  if (!shopDomain) {
    throw new Error("shopDomain is required for atomic counter");
  }

  await connectMongoose();

  const step = (parseInt(incrementStep, 10) || 1) * count;
  const initialStart = parseInt(startNumber, 10) || 1;

  // Find counter doc or create if missing
  let doc = await ShopSkuCounter.findOne({ shopDomain, counterKey });

  if (!doc) {
    // Upsert initial counter
    try {
      doc = await ShopSkuCounter.create({
        shopDomain,
        counterKey,
        nextValue: initialStart + step,
      });
      return initialStart;
    } catch (err) {
      // Race condition handle: retry findOneAndUpdate
      doc = await ShopSkuCounter.findOne({ shopDomain, counterKey });
    }
  }

  // Atomically increment counter by step
  const updatedDoc = await ShopSkuCounter.findOneAndUpdate(
    { shopDomain, counterKey },
    { $inc: { nextValue: step } },
    { new: false, upsert: true }
  );

  const startValue = updatedDoc ? updatedDoc.nextValue : initialStart;
  return startValue;
}

/**
 * Get current counter value without incrementing
 */
export async function getCurrentSequenceNumber({ shopDomain, counterKey = "default", startNumber = 1 }) {
  if (!shopDomain) return startNumber;
  await connectMongoose();
  const doc = await ShopSkuCounter.findOne({ shopDomain, counterKey });
  return doc ? doc.nextValue : startNumber;
}
