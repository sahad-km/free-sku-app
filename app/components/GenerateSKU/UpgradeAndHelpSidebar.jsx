import React from "react";
import { HeadsetIcon } from "./Icons";

export default function UpgradeAndHelpSidebar() {
  return (
    <>
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
