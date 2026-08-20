import React from "react";
import { LockIcon, ShieldCheckIcon } from "./Icons";

export default function IncludedBenefitsPanel() {
  return (
    <div className="benefits-side-panel">
      <div className="benefit-info-box">
        <div className="benefit-icon-box bg-purple-light">
          <LockIcon size={18} color="#5B3DF5" />
        </div>
        <div>
          <h4 className="benefit-box-title">All plans include</h4>
          <p className="benefit-box-desc">
            Unlimited rule creation, full dedicated support and regular updates.
          </p>
        </div>
      </div>

      <div className="benefit-info-box">
        <div className="benefit-icon-box bg-purple-light">
          <ShieldCheckIcon size={18} color="#5B3DF5" />
        </div>
        <div>
          <h4 className="benefit-box-title">3-day free trial</h4>
          <p className="benefit-box-desc">
            Try any plan risk-free with a 3-day free trial. Cancel anytime before trial ends.
          </p>
        </div>
      </div>
    </div>
  );
}
