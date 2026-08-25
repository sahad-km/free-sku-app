import { connectMongoose } from "../../db.mongoose.server";
import AutomationRule from "../../models/AutomationRule.server";

/**
 * Synchronize Shopify webhooks dynamically based on active automation rules.
 * 
 * If a store has at least ONE active automation rule, ensure PRODUCTS_CREATE and PRODUCTS_UPDATE
 * webhooks are registered on Shopify.
 * If a store has ZERO active automation rules, unsubscribe/delete those webhooks to save bandwidth and compute.
 */
export async function syncAutomationWebhooks({ admin, shopDomain }) {
  if (!admin || !shopDomain) {
    console.warn("[Webhook Sync] Missing admin or shopDomain, skipping webhook sync.");
    return { success: false, reason: "Missing admin or shopDomain" };
  }

  await connectMongoose();

  const activeRulesCount = await AutomationRule.countDocuments({
    shopDomain,
    status: "Active",
  });

  const shouldHaveWebhooks = activeRulesCount > 0;
  const appUrl = process.env.SHOPIFY_APP_URL || "";

  if (!appUrl) {
    console.warn("[Webhook Sync] SHOPIFY_APP_URL environment variable is not defined");
    return { success: false, reason: "SHOPIFY_APP_URL missing" };
  }

  const cleanAppUrl = appUrl.replace(/\/$/, "");
  const createCallbackUrl = `${cleanAppUrl}/webhooks/products/create`;
  const updateCallbackUrl = `${cleanAppUrl}/webhooks/products/update`;

  try {
    // 1. Fetch existing webhook subscriptions from Shopify
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
      // Ensure PRODUCTS_CREATE is registered
      if (!existingCreateWebhook) {
        console.log(`[Webhook Sync] Registering PRODUCTS_CREATE for ${shopDomain}`);
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
      }

      // Ensure PRODUCTS_UPDATE is registered
      if (!existingUpdateWebhook) {
        console.log(`[Webhook Sync] Registering PRODUCTS_UPDATE for ${shopDomain}`);
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
      }

      return { success: true, status: "Webhooks Active", activeRulesCount };
    } else {
      // Zero active rules -> Unsubscribe/Delete webhooks if present
      if (existingCreateWebhook) {
        console.log(`[Webhook Sync] Removing PRODUCTS_CREATE webhook for ${shopDomain}`);
        await admin.graphql(`
          mutation deleteWebhook($id: ID!) {
            webhookSubscriptionDelete(id: $id) {
              userErrors { field message }
            }
          }
        `, { variables: { id: existingCreateWebhook.id } });
      }

      if (existingUpdateWebhook) {
        console.log(`[Webhook Sync] Removing PRODUCTS_UPDATE webhook for ${shopDomain}`);
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
