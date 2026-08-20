import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { syncBillingState } from "../services/billing/shopifyBillingService.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    return redirect("/app/pricing?error=unauthorized");
  }

  try {
    await syncBillingState(admin, session.shop);
    return redirect("/app/pricing?billingSuccess=true");
  } catch (error) {
    console.error(`[BillingCallbackError] Failed to process return for ${session.shop}:`, error);
    return redirect("/app/pricing?error=subscription_failed");
  }
};
