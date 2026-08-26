import { connectMongoose } from "../../db.mongoose.server.js";
import shopify from "../../shopify.server.js";
import Shop from "../../models/Shop.server.js";
import ShopBilling from "../../models/ShopBilling.server.js";
import AutomationRule from "../../models/AutomationRule.server.js";
import DuplicateGroup from "../../models/DuplicateGroup.server.js";
import DuplicateScan from "../../models/DuplicateScan.server.js";
import GeneratedSku from "../../models/GeneratedSku.server.js";
import ShopSkuCounter from "../../models/ShopSkuCounter.server.js";
import SkuGenerationRun from "../../models/SkuGenerationRun.server.js";

/**
 * Handle mandatory CUSTOMERS_DATA_REQUEST webhook.
 * Shopify sends this when a customer requests a copy of their personal data.
 * Since this app only manages product SKUs and store-level configurations,
 * no customer-specific personal data is stored.
 */
export async function handleCustomerDataRequest({ shop, payload }) {
  console.log(`[Compliance Webhook] CUSTOMERS_DATA_REQUEST received for shop: ${shop}`);
  console.log(`[Compliance Webhook] Payload detail:`, JSON.stringify(payload));
  // No personal customer data stored. Return successfully.
  return { success: true, message: "No customer personal data stored by this app." };
}

/**
 * Handle mandatory CUSTOMERS_REDACT webhook.
 * Shopify sends this when a customer requests deletion of their personal data.
 * Since this app does not store personal customer data, no deletion is required.
 */
export async function handleCustomerRedact({ shop, payload }) {
  console.log(`[Compliance Webhook] CUSTOMERS_REDACT received for shop: ${shop}`);
  console.log(`[Compliance Webhook] Payload detail:`, JSON.stringify(payload));
  // No personal customer data stored. Return successfully.
  return { success: true, message: "No customer personal data stored by this app." };
}

/**
 * Handle mandatory SHOP_REDACT webhook.
 * Shopify sends this 48 hours after a shop uninstalls the app.
 * The app must delete all stored data associated with this shop from its database.
 */
export async function handleShopRedact({ shop, payload }) {
  const shopDomain = shop || payload?.shop_domain;
  console.log(`[Compliance Webhook] Starting SHOP_REDACT for shop: ${shopDomain}`);

  if (!shopDomain) {
    console.warn("[Compliance Webhook] SHOP_REDACT missing shop domain");
    return { success: false, reason: "Missing shop domain" };
  }

  try {
    await connectMongoose();

    const dbShop = await Shop.findOne({ shopDomain });
    const shopId = dbShop?._id;

    // Purge all shop-related collections
    const deleteOps = [
      ShopBilling.deleteMany({ shopDomain }),
      AutomationRule.deleteMany({ shopDomain }),
      DuplicateScan.deleteMany({ shopDomain }),
      DuplicateGroup.deleteMany({ shopDomain }),
      GeneratedSku.deleteMany({ shopDomain }),
      ShopSkuCounter.deleteMany({ shopDomain }),
      SkuGenerationRun.deleteMany({ shopDomain }),
      Shop.deleteMany({ shopDomain }),
    ];

    if (shopId) {
      deleteOps.push(
        ShopBilling.deleteMany({ shopId }),
        AutomationRule.deleteMany({ shopId }),
        DuplicateScan.deleteMany({ shopId }),
        DuplicateGroup.deleteMany({ shopId }),
        GeneratedSku.deleteMany({ shopId }),
        ShopSkuCounter.deleteMany({ shopId }),
        SkuGenerationRun.deleteMany({ shopId })
      );
    }

    const results = await Promise.allSettled(deleteOps);
    console.log(`[Compliance Webhook] DB cleanup completed for ${shopDomain}. Results:`, results.length);

    // Clean up session storage
    if (shopify.sessionStorage) {
      try {
        const sessions = await shopify.sessionStorage.findSessionsByShop(shopDomain);
        if (sessions && sessions.length > 0) {
          await shopify.sessionStorage.deleteSessions(sessions.map((s) => s.id));
          console.log(`[Compliance Webhook] Deleted ${sessions.length} session(s) for ${shopDomain}`);
        }
      } catch (sessErr) {
        console.error(`[Compliance Webhook] Error deleting sessions for ${shopDomain}:`, sessErr.message);
      }
    }

    return { success: true, message: `Successfully redacted all data for shop ${shopDomain}` };
  } catch (err) {
    console.error(`[Compliance Webhook Error] SHOP_REDACT failed for ${shopDomain}:`, err);
    throw err;
  }
}
