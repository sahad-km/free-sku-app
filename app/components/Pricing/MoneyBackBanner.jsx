import React from "react";
import { ShieldCheckIcon, StarIcon } from "./Icons";

export default function MoneyBackBanner() {
  return (
    <div className="card money-back-banner-card">
      <div className="banner-left-guarantee">
        <div className="guarantee-icon-box">
          <ShieldCheckIcon size={22} color="#16A34A" />
        </div>
        <div>
          <h4 className="guarantee-title">30-Day Money Back Guarantee</h4>
          <p className="guarantee-desc">
            Try SKU Generator risk-free. If you're not happy with our app, get a full refund within 30 days.
          </p>
        </div>
      </div>

      <div className="banner-right-trust">
        <div className="avatar-stack-container">
          <div className="avatar-circle avatar-1">👨</div>
          <div className="avatar-circle avatar-2">👩</div>
          <div className="avatar-circle avatar-3">👨‍💼</div>
          <div className="avatar-count-badge">2k+</div>
        </div>

        <div className="trust-rating-info">
          <span className="trusted-text">Trusted by 2,000+ Shopify stores</span>
          <div className="stars-row">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} size={12} color="#EAB308" />
            ))}
            <span className="rating-num">4.9/5 average rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
