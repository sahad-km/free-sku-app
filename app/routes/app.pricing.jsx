import React, { useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import PricingHeader from "../components/Pricing/PricingHeader";
import PricingCardGrid from "../components/Pricing/PricingCardGrid";
import FeatureComparisonTable from "../components/Pricing/FeatureComparisonTable";
import SupportSidebarCards from "../components/Pricing/SupportSidebarCards";
import MoneyBackBanner from "../components/Pricing/MoneyBackBanner";
import { initialPricingData } from "../components/Pricing/mockData";
import "../styles/app.pricing.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState(initialPricingData.billingInterval);
  const [currentPlan, setCurrentPlan] = useState(initialPricingData.currentPlan);

  const handleSelectPlan = (plan) => {
    if (plan.name === currentPlan) return;

    if (plan.isCustom) {
      alert("Thank you for your interest! Our Enterprise team will contact you shortly.");
      return;
    }

    const intervalText = billingInterval === "annual" ? "annual" : "monthly";
    const priceText = billingInterval === "annual" ? `$${plan.annualMonthlyPrice}/mo` : `$${plan.monthlyPrice}/mo`;

    if (confirm(`Upgrade to the ${plan.name} plan (${priceText}, billed ${intervalText})?`)) {
      setCurrentPlan(plan.name);
      alert(`Success! Your store has been upgraded to the ${plan.name} plan.`);
    }
  };

  const handleContactSupport = () => {
    alert("Opening Shopify SKU Support chat...");
  };

  const handleContactSales = () => {
    alert("Opening Enterprise Sales contact form...");
  };

  return (
    <div className="pricing-page-root">
      <div className="pricing-page-inner">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <PricingHeader
          billingInterval={billingInterval}
          setBillingInterval={setBillingInterval}
        />

        {/* ── Main Pricing Cards Grid (Included benefits + 4 Cards) ── */}
        <PricingCardGrid
          billingInterval={billingInterval}
          onSelectPlan={handleSelectPlan}
          currentPlan={currentPlan}
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
