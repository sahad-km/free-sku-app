import React from "react";
import { SparkleIcon } from "./Icons";

export default function UpgradeBanner() {
  return (
    <div className="card upgrade-banner-card">
      <div className="banner-left-content">
        <div className="banner-sparkle-box">
          <SparkleIcon size={18} color="#5B3DF5" />
        </div>
        <div>
          <h4 className="banner-title">Upgrade to unlock more automation</h4>
          <p className="banner-desc">
            You're using 5 of 8 automation rules. Upgrade your plan to create more rules and automate without limits.
          </p>
        </div>
      </div>

      <button className="btn-view-plans" type="button">
        View plans
      </button>
    </div>
  );
}
