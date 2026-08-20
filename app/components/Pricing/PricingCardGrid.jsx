import React from "react";
import IncludedBenefitsPanel from "./IncludedBenefitsPanel";
import { LeafIcon, CrownIcon, RocketIcon, BuildingIcon, CheckIcon, StarIcon } from "./Icons";
import { plans } from "./mockData";

export default function PricingCardGrid({ billingInterval, onSelectPlan, currentPlan, isSubmitting }) {
  const isAnnual = billingInterval === "annual";

  const renderPlanIcon = (type, color) => {
    switch (type) {
      case "leaf":
        return <LeafIcon size={20} color={color} />;
      case "crown":
        return <CrownIcon size={20} color={color} />;
      case "rocket":
        return <RocketIcon size={20} color={color} />;
      case "building":
      default:
        return <BuildingIcon size={20} color={color} />;
    }
  };

  return (
    <div className="pricing-grid-layout">
      {/* Left Benefits Panel */}
      <IncludedBenefitsPanel />

      {/* 3 Pricing Cards */}
      <div className="pricing-cards-flex">
        {plans.map((plan) => {
          const isPopular = plan.isPopular;
          const isCurrent = currentPlan === plan.name;
          const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const displayPeriod = isAnnual ? "/ year" : "/ month";

          return (
            <div
              key={plan.id}
              className={`card pricing-card ${
                isPopular ? "card-popular" : ""
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="popular-top-badge">
                  <StarIcon size={12} color="#FFFFFF" />
                  <span>MOST POPULAR</span>
                </div>
              )}

              {/* Card Header */}
              <div className="pricing-card-header">
                <div className="card-title-row">
                  <div className="plan-name-text">{plan.name}</div>
                  <div className={`plan-icon-box ${plan.iconBg}`}>
                    {renderPlanIcon(plan.iconType, plan.iconColor)}
                  </div>
                </div>
                <p className="plan-desc-text">{plan.description}</p>
              </div>

              {/* Pricing Section */}
              <div className="pricing-amount-section">
                <div className="price-row">
                  <span className="currency-symbol">$</span>
                  <span className="price-number">{displayPrice}</span>
                  <span className="price-period">{displayPeriod}</span>
                </div>

                <div className="price-subtext">
                  {plan.monthlyPrice === 0 ? (
                    "Free forever"
                  ) : isAnnual ? (
                    <div className="annual-price-sub-flex">
                      <span>
                        Billed ${plan.annualPrice}/yr (
                        <span className="strikethrough-price">${plan.fullYearMonthlyCost}</span>)
                      </span>
                      <span className="savings-badge-pill">
                        Save ${plan.annualSavings}/yr
                      </span>
                    </div>
                  ) : (
                    `Billed $${plan.monthlyPrice} monthly`
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="pricing-cta-section">
                <button
                  className={`btn-pricing-cta ${
                    isCurrent
                      ? "btn-current-plan"
                      : isPopular
                      ? "btn-purple-solid"
                      : "btn-purple-outline"
                  }`}
                  onClick={() => onSelectPlan(plan)}
                  disabled={isCurrent || isSubmitting}
                  type="button"
                >
                  {isCurrent ? "Current plan" : isSubmitting ? "Processing..." : plan.buttonText}
                </button>
              </div>

              {/* Features List */}
              <div className="pricing-features-list">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="feature-item-row">
                    <div className="feature-check-icon">
                      <CheckIcon size={14} color="#5B3DF5" />
                    </div>
                    <span className="feature-item-text">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
