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
            Unlimited rule creation, 24/7 support and regular updates.
          </p>
        </div>
      </div>

      <div className="benefit-info-box">
        <div className="benefit-icon-box bg-purple-light">
          <ShieldCheckIcon size={18} color="#5B3DF5" />
        </div>
        <div>
          <h4 className="benefit-box-title">30-day money back</h4>
          <p className="benefit-box-desc">
            Not satisfied? Get a full refund within 30 days of purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
