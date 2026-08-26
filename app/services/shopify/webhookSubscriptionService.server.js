import { connectMongoose } from "../../db.mongoose.server";
import AutomationRule from "../../models/AutomationRule.server";

/**
 * Synchronize Shopify webhooks dynamically based on active automation rules.
 * 
 * If a store has at least ONE active automation rule, ensure PRODUCTS_CREATE and PRODUCTS_UPDATE
 * webhooks are registered on Shopify with the current callback URL.
 * If callback URLs differ (e.g. after domain/tunnel changes), update them automatically.
 * If a store has ZERO active automation rules, delete those webhooks to save bandwidth.
 */
export async function syncAutomationWebhooks({ admin, shopDomain }) {
  if (!admin || !shopDomain) {
    console.warn("[Webhook Sync] Missing admin or shopDomain, skipping webhook sync.");
    return { success: false, reason: "Missing admin or shopDomain" };
  }

  await connectMongoose();

  const cleanShopDomain = shopDomain.toLowerCase().trim();

  const activeRulesCount = await AutomationRule.countDocuments({
    shopDomain: cleanShopDomain,
    status: "Active",
  });

  const shouldHaveWebhooks = activeRulesCount > 0;

  // Resolve App Base URL with sensible fallbacks
  const appUrl =
    process.env.SHOPIFY_APP_URL ||
    process.env.HOST ||
    "https://sku-bulk-generator.onrender.com";

  const cleanAppUrl = appUrl.replace(/\/$/, "");
  const createCallbackUrl = `${cleanAppUrl}/webhooks/products/create`;
  const updateCallbackUrl = `${cleanAppUrl}/webhooks/products/update`;

  try {
    // 1. Fetch existing webhook subscriptions from Shopify for this store
    const queryRes = await admin.graphql(`
      query getAutomationWebhookSubscriptions {
        webhookSubscriptions(first: 50) {
          nodes {
            id
            topic
            endpoint {
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
          }
        }
      }
    `);

    const queryJson = await queryRes.json();
    const existingWebhooks = queryJson?.data?.webhookSubscriptions?.nodes || [];

    const existingCreateWebhook = existingWebhooks.find(
      (w) => w.topic === "PRODUCTS_CREATE"
    );
    const existingUpdateWebhook = existingWebhooks.find(
      (w) => w.topic === "PRODUCTS_UPDATE"
    );

    if (shouldHaveWebhooks) {
      // ── Ensure PRODUCTS_CREATE is registered & pointing to current URL ──
      const currentCreateUrl = existingCreateWebhook?.endpoint?.callbackUrl;
      if (!existingCreateWebhook) {
        console.log(`[Webhook Sync] Registering PRODUCTS_CREATE for ${cleanShopDomain} -> ${createCallbackUrl}`);
        await admin.graphql(`
          mutation createProductsCreateWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
            webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
              userErrors { field message }
              webhookSubscription { id topic }
            }
          }
        `, {
          variables: {
            topic: "PRODUCTS_CREATE",
            webhookSubscription: {
              callbackUrl: createCallbackUrl,
              format: "JSON",
            },
          },
        });
      } else if (currentCreateUrl !== createCallbackUrl) {
        console.log(`[Webhook Sync] Updating PRODUCTS_CREATE callbackUrl for ${cleanShopDomain}: ${currentCreateUrl} -> ${createCallbackUrl}`);
        await admin.graphql(`
          mutation updateProductsCreateWebhook($id: ID!, $webhookSubscription: WebhookSubscriptionInput!) {
            webhookSubscriptionUpdate(id: $id, webhookSubscription: $webhookSubscription) {
              userErrors { field message }
              webhookSubscription { id topic }
            }
          }
        `, {
          variables: {
            id: existingCreateWebhook.id,
            webhookSubscription: {
              callbackUrl: createCallbackUrl,
              format: "JSON",
            },
          },
        });
      }

      // ── Ensure PRODUCTS_UPDATE is registered & pointing to current URL ──
      const currentUpdateUrl = existingUpdateWebhook?.endpoint?.callbackUrl;
      if (!existingUpdateWebhook) {
        console.log(`[Webhook Sync] Registering PRODUCTS_UPDATE for ${cleanShopDomain} -> ${updateCallbackUrl}`);
        await admin.graphql(`
          mutation createProductsUpdateWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
            webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
              userErrors { field message }
              webhookSubscription { id topic }
            }
          }
        `, {
          variables: {
            topic: "PRODUCTS_UPDATE",
            webhookSubscription: {
              callbackUrl: updateCallbackUrl,
              format: "JSON",
            },
          },
        });
      } else if (currentUpdateUrl !== updateCallbackUrl) {
        console.log(`[Webhook Sync] Updating PRODUCTS_UPDATE callbackUrl for ${cleanShopDomain}: ${currentUpdateUrl} -> ${updateCallbackUrl}`);
        await admin.graphql(`
          mutation updateProductsUpdateWebhook($id: ID!, $webhookSubscription: WebhookSubscriptionInput!) {
            webhookSubscriptionUpdate(id: $id, webhookSubscription: $webhookSubscription) {
              userErrors { field message }
              webhookSubscription { id topic }
            }
          }
        `, {
          variables: {
            id: existingUpdateWebhook.id,
            webhookSubscription: {
              callbackUrl: updateCallbackUrl,
              format: "JSON",
            },
          },
        });
      }

      return { success: true, status: "Webhooks Active", activeRulesCount };
    } else {
      // Zero active rules -> Unsubscribe/Delete webhooks if present
      if (existingCreateWebhook) {
        console.log(`[Webhook Sync] Removing PRODUCTS_CREATE webhook for ${cleanShopDomain}`);
        await admin.graphql(`
          mutation deleteWebhook($id: ID!) {
            webhookSubscriptionDelete(id: $id) {
              userErrors { field message }
            }
          }
        `, { variables: { id: existingCreateWebhook.id } });
      }

      if (existingUpdateWebhook) {
        console.log(`[Webhook Sync] Removing PRODUCTS_UPDATE webhook for ${cleanShopDomain}`);
        await admin.graphql(`
          mutation deleteWebhook($id: ID!) {
            webhookSubscriptionDelete(id: $id) {
              userErrors { field message }
            }
          }
        `, { variables: { id: existingUpdateWebhook.id } });
      }

      return { success: true, status: "Webhooks Inactive", activeRulesCount: 0 };
    }
  } catch (err) {
    console.error("[Webhook Sync Exception]:", err.message);
    return { success: false, error: err.message };
  }
}
