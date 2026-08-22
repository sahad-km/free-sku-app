import { redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return redirect("/app");
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const formData = await request.formData();
  const requestedPlanName = formData.get("planName");
  const billingInterval = formData.get("billingInterval") || "monthly";

  if (!requestedPlanName) {
    return { success: false, error: "Plan name is required" };
  }

  const planHandle = getPlanHandleFromName(requestedPlanName, billingInterval);

  try {
    if (requestedPlanName === "Free") {
      await cancelSubscription(admin, shopDomain);
      return { success: true, isFree: true, planName: "Free" };
    }

    // Construct app return URL for Shopify confirmation screen
    const url = new URL(request.url);
    const returnUrl = `${url.origin}/app/billing/callback`;

    const result = await requestSubscription(admin, shopDomain, planHandle, returnUrl);

    if (result.confirmationUrl) {
      return { success: true, confirmationUrl: result.confirmationUrl };
    }

    return { success: true, isFree: true, planName: "Free" };
  } catch (err) {
    console.error(`[PricingActionError] for ${shopDomain}:`, err);
    return { success: false, error: err.message || "Failed to process subscription request" };
  }
};

export default function PricingPage() {
  const loaderData = useLoaderData() || {};
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [billingInterval, setBillingInterval] = useState(loaderData?.billingInterval || "monthly");
  const [currentPlan, setCurrentPlan] = useState(loaderData?.currentPlan || "Free");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loaderData?.currentPlan) {
      setCurrentPlan(loaderData.currentPlan);
    }
  }, [loaderData?.currentPlan]);

  // Handle billing action response
  useEffect(() => {
    if (fetcher.data) {
      setIsSubmitting(false);

      if (fetcher.data.confirmationUrl) {
        // Redirect merchant to Shopify approval screen
        if (window.top) {
          window.top.location.href = fetcher.data.confirmationUrl;
        } else {
          window.location.href = fetcher.data.confirmationUrl;
        }
      } else if (fetcher.data.isFree) {
        setCurrentPlan("Free");
        showToast("Your subscription has been updated to the Free plan.", "success");
      } else if (fetcher.data.error) {
        showToast(`Billing Error: ${fetcher.data.error}`, "error");
      }
    }
  }, [fetcher.data]);

  const handleSelectPlan = (plan) => {
    if (plan.name === currentPlan) return;

    const actionText = plan.name === "Free" ? "downgrade to Free" : `subscribe to ${plan.name} (${billingInterval})`;

    if (confirm(`Are you sure you want to ${actionText}?`)) {
      setIsSubmitting(true);

      fetcher.submit(
        {
          planName: plan.name,
          billingInterval,
        },
        { method: "post" }
      );
    }
  };

  const handleContactSupport = () => {
    showToast("Opening SKU Generator Support chat...", "info");
  };

  const handleContactSales = () => {
    showToast("Opening Enterprise Custom Solutions contact form...", "info");
  };

  return (
    <div className="pricing-page-root">
      <div className="pricing-page-inner">
        {/* Success Banner if returned from callback */}
        {searchParams.get("billingSuccess") === "true" && (
          <div className="card" style={{ padding: "14px 20px", backgroundColor: "#DCFCE7", borderColor: "#86EFAC", color: "#15803D", fontWeight: 600, fontSize: "14px", borderRadius: "10px" }}>
            🎉 Success! Your subscription has been confirmed by Shopify.
          </div>
        )}

        {/* ── Page Header ─────────────────────────────────────────── */}
        <PricingHeader
          billingInterval={billingInterval}
          setBillingInterval={setBillingInterval}
        />

        {/* ── Main Pricing Cards Grid (Included benefits + 3 Cards) ── */}
        <PricingCardGrid
          billingInterval={billingInterval}
          onSelectPlan={handleSelectPlan}
          currentPlan={currentPlan}
          isSubmitting={isSubmitting}
        />

        {/* ── Bottom Section (Compare Table & Support Sidebar Cards) ─ */}
        <div className="pricing-bottom-grid">
          <FeatureComparisonTable />
          <SupportSidebarCards
            onContactSupport={handleContactSupport}
            onContactSales={handleContactSales}
          />
        </div>

        {/* ── Bottom Guarantee & Trust Banner ─────────────────────── */}
        <MoneyBackBanner />
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
