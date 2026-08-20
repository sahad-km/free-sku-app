import React from "react";
import { ShieldCheckIcon, UserIcon, CodeIcon, StoreIcon } from "./Icons";

export default function MoneyBackBanner() {
  return (
    <div className="card money-back-banner-card">
      <div className="banner-left-guarantee">
        <div className="guarantee-icon-box">
          <ShieldCheckIcon size={22} color="#16A34A" />
        </div>
        <div>
          <h4 className="guarantee-title">3-Day Free Trial Included</h4>
          <p className="guarantee-desc">
            Try SKU Generator risk-free on all paid plans. Cancel anytime.
          </p>
        </div>
      </div>

      <div className="banner-right-trust-card">
        <div className="avatar-stack-container">
          <div className="avatar-circle avatar-1 bg-blue-light">
            <UserIcon size={14} color="#2563EB" />
          </div>
          <div className="avatar-circle avatar-2 bg-purple-light">
            <CodeIcon size={14} color="#7C3AED" />
          </div>
          <div className="avatar-circle avatar-3 bg-green-light">
            <StoreIcon size={14} color="#16A34A" />
          </div>
          <div className="avatar-count-badge">5y+</div>
        </div>
        <span className="trusted-text">
          5+ years of experience in store management and custom solution building
        </span>
      </div>
    </div>
  );
}
