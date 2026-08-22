import Shop from "../../models/Shop.server";
import { connectMongoose } from "../../db.mongoose.server";

/**
 * Ensures store details (including primary email) are synced from Shopify Admin GraphQL
 * and stored in the MongoDB Shop collection upon app launch/authentication.
 */
export async function ensureShopDetailsSynced({ admin, shopDomain }) {
  if (!admin || !shopDomain) return null;

  try {
    await connectMongoose();

    const response = await admin.graphql(`
      query getShopDetailsForSync {
        shop {
          id
          name
          email
          currencyCode
          ianaTimezone
        }
      }
    `);

    const resJson = await response.json();
    const shopData = resJson.data?.shop;

    if (shopData) {
      const updatedShop = await Shop.findOneAndUpdate(
        { shopDomain },
        {
          $set: {
            shopDomain,
            shopifyShopId: shopData.id,
            shopName: shopData.name || shopDomain.split(".")[0],
            email: shopData.email || "",
            currency: shopData.currencyCode || "USD",
            timezone: shopData.ianaTimezone || "UTC",
            installationStatus: "active",
            lastSeenAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      console.log(`[ShopSync] Successfully synced shop details for ${shopDomain} (Email: ${shopData.email || "N/A"})`);
      return updatedShop;
    }
  } catch (err) {
    console.warn(`[ShopSync] Warning syncing shop details for ${shopDomain}:`, err.message);
  }

  return null;
}
