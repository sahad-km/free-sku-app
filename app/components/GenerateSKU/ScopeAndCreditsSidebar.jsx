import React from "react";
import { InfoIcon } from "./Icons";

export default function ScopeAndCreditsSidebar({
  selection = { type: "ALL_PRODUCTS" },
  totalProducts = 0,
  totalVariants = 0,
  estimatedCredits = 0,
  creditsAvailable = 100,
  onChangeScope,
}) {
  const getScopeLabel = () => {
    if (selection.type === "ALL_PRODUCTS") return "All products";
    if (selection.type === "COLLECTIONS") return `Collections (${selection.collectionIds?.length || 0})`;
    if (selection.type === "PRODUCTS") return `Products (${selection.productIds?.length || 0})`;
    if (selection.type === "VARIANTS") return `Variants (${selection.variantIds?.length || 0})`;
    if (selection.type === "TAG") return `Tag: "${selection.tag || ""}"`;
    return "All products";
  };

  return (
    <>
      {/* Selected Scope Card */}
      <div className="card sidebar-card scope-card">
        <h3 className="sidebar-title">Selected scope</h3>

        <div className="scope-pill-badge">
          <span>
            {totalProducts} product{totalProducts !== 1 ? "s" : ""} and {totalVariants} variant
            {totalVariants !== 1 ? "s" : ""}
          </span>
        </div>

        <p className="scope-help-text">You're ready to apply this rule to:</p>

        <div className="scope-action-row">
          <span className="scope-target-text">{getScopeLabel()}</span>
          <button
            className="btn-change-scope"
            onClick={onChangeScope}
            type="button"
          >
            Change
          </button>
        </div>
      </div>

      {/* Credits Summary Card */}
      <div className="card sidebar-card credits-summary-card">
        <h3 className="sidebar-title">Credits summary</h3>

        <div className="credits-list">
          <div className="credit-row">
            <div className="credit-row-left">
              <InfoIcon size={14} color="#9CA3AF" />
              <span>Credits required (est.)</span>
            </div>
            <span className="credit-value-bold">{estimatedCredits} credits</span>
          </div>

          <div className="credit-row">
            <div className="credit-row-left">
              <InfoIcon size={14} color="#9CA3AF" />
              <span>Credits available</span>
            </div>
            <span className="credit-value-sub">{creditsAvailable} credits</span>
          </div>

          <div className="credit-row">
            <div className="credit-row-left">
              <InfoIcon size={14} color="#9CA3AF" />
              <span>Each variant costs</span>
            </div>
            <span className="credit-value-sub">1 credit</span>
          </div>
        </div>
      </div>
    </>
  );
}
