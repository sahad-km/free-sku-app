import React from "react";
import { SparkleIcon, HeadsetIcon } from "./Icons";

export default function UpgradeAndHelpSidebar() {
  return (
    <>
      {/* Upgrade Card */}
      <div className="card sidebar-card upgrade-card">
        <div className="upgrade-card-header">
          <div className="upgrade-icon-sparkle">
            <SparkleIcon size={18} color="#5B3DF5" />
          </div>
          <h3 className="upgrade-title">Upgrade for more power</h3>
        </div>

        <p className="upgrade-subtitle">
          Unlock advanced rules, more credits and priority support.
        </p>

        <ul className="upgrade-bullet-list">
          <li>
            <span className="bullet-check">✓</span> Advanced components
          </li>
          <li>
            <span className="bullet-check">✓</span> More automation limits
          </li>
          <li>
            <span className="bullet-check">✓</span> Priority email support
          </li>
        </ul>

        <button className="btn-upgrade-plan" type="button">
          Upgrade plan
        </button>
      </div>

      {/* Need Help Card */}
      <div className="card sidebar-card help-card">
        <div className="help-card-body">
          <div className="help-text-content">
            <h3 className="help-title">Need help?</h3>
            <p className="help-desc">
              Check our guide or contact our support team.
            </p>
          </div>
          <div className="help-icon-illustration">
            <HeadsetIcon size={32} color="#5B3DF5" />
          </div>
        </div>

        <button className="btn-view-doc" type="button">
          View documentation
        </button>
      </div>
    </>
  );
}
