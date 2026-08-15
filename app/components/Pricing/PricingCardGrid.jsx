import React from "react";
import IncludedBenefitsPanel from "./IncludedBenefitsPanel";
import { LeafIcon, CrownIcon, RocketIcon, BuildingIcon, CheckIcon, StarIcon } from "./Icons";
import { plans } from "./mockData";

export default function PricingCardGrid({ billingInterval, onSelectPlan, currentPlan }) {
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

      {/* 4 Pricing Cards */}
      <div className="pricing-cards-flex">
        {plans.map((plan) => {
          const isPopular = plan.isPopular;
          const isCurrent = currentPlan === plan.name;
          const displayPrice = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;

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
                {!plan.isCustom ? (
                  <>
                    <div className="price-row">
                      <span className="currency-symbol">$</span>
                      <span className="price-number">{displayPrice}</span>
                      <span className="price-period">/ month</span>
                    </div>

                    <div className="price-subtext">
                      {isAnnual ? (
                        <>
                          Billed annually at ${plan.annualTotalPrice}
                          {plan.strikethroughAnnualTotal && (
                            <span className="strikethrough-price">
                              {" "}${plan.strikethroughAnnualTotal}
                            </span>
                          )}
                        </>
                      ) : (
                        "Billed monthly"
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="price-row">
                      <span className="custom-price-title">{plan.customPriceText}</span>
                    </div>
                    <div className="price-subtext">{plan.customPriceSubtext}</div>
                  </>
                )}
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
                  disabled={isCurrent}
                  type="button"
                >
                  {isCurrent ? "Current plan" : plan.buttonText}
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
