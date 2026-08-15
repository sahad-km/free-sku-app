import React from "react";
import { InfoIcon } from "./Icons";

export default function ScopeAndCreditsSidebar({ onChangeScope }) {
  return (
    <>
      {/* Selected Scope Card */}
      <div className="card sidebar-card scope-card">
        <h3 className="sidebar-title">Selected scope</h3>

        <div className="scope-pill-badge">
          <span>78 products and 93 variants</span>
        </div>

        <p className="scope-help-text">You're ready to apply this rule to:</p>

        <div className="scope-action-row">
          <span className="scope-target-text">All products</span>
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
            <span className="credit-value-bold">93 credits</span>
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
