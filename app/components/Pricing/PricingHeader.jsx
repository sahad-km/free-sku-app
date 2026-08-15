import React from "react";
import { CurvedArrowIcon } from "./Icons";

export default function PricingHeader({ billingInterval, setBillingInterval }) {
  const isAnnual = billingInterval === "annual";

  return (
    <div className="pricing-header">
      <div className="header-left">
        <h1 className="pricing-title">Plans & Pricing</h1>
        <p className="pricing-subtitle">
          Choose the perfect plan to manage and generate SKUs for your store.
        </p>
      </div>

      <div className="billing-toggle-container">
        <div className="billing-toggle-pill">
          <button
            className={`toggle-option-btn ${!isAnnual ? "toggle-active" : ""}`}
            onClick={() => setBillingInterval("monthly")}
            type="button"
          >
            Monthly
          </button>

          <button
            className={`toggle-option-btn ${isAnnual ? "toggle-active" : ""}`}
            onClick={() => setBillingInterval("annual")}
            type="button"
          >
            Annual (Save 20%)
          </button>
        </div>

        <div className="annual-save-hint">
          <CurvedArrowIcon size={24} color="#5B3DF5" />
          <span className="save-hint-text">
            Save up to 20% with annual billing
          </span>
        </div>
      </div>
    </div>
  );
}
