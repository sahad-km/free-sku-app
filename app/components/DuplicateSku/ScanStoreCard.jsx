import React from "react";
import { SparkleIcon, CheckIcon, WaveIcon, UsersGroupIcon } from "./Icons";

export default function ScanStoreCard({ onStartScan, lastScanText }) {
  return (
    <div className="card scan-store-card">
      <div className="scan-left-illustration-block">
        <div className="illustration-wrapper">
          <div className="doc-bg-box">
            <div className="doc-line line-1" />
            <div className="doc-line line-2" />
            <div className="doc-line line-3" />
          </div>
          <div className="glass-magnifier">🔍</div>
        </div>
      </div>

      <div className="scan-middle-content">
        <h3 className="scan-panel-title">Check your store for duplicate SKUs</h3>
        <p className="scan-panel-subtitle">
          We'll scan your entire inventory and group identical SKUs together.
        </p>

        <div className="scan-features-row">
          <div className="scan-feature-item">
            <div className="feature-icon-circle blue-circle">
              <CheckIcon size={12} color="#2563EB" />
            </div>
            <div>
              <span className="feature-bold-title">Exact matches</span>
              <span className="feature-light-sub">Identical SKUs</span>
            </div>
          </div>

          <div className="scan-feature-item">
            <div className="feature-icon-circle blue-circle">
              <WaveIcon size={12} color="#2563EB" />
            </div>
            <div>
              <span className="feature-bold-title">Partial matches</span>
              <span className="feature-light-sub">Similar SKUs</span>
            </div>
          </div>

          <div className="scan-feature-item">
            <div className="feature-icon-circle blue-circle">
              <UsersGroupIcon size={12} color="#2563EB" />
            </div>
            <div>
              <span className="feature-bold-title">Smart grouping</span>
              <span className="feature-light-sub">Easy to review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="scan-right-action-block">
        <button className="btn-panel-start-scan" onClick={onStartScan} type="button">
          <SparkleIcon size={16} color="#FFFFFF" />
          <span>Start scan</span>
        </button>
        <span className="scan-timestamp-sub">
          {lastScanText || "Last scan: May 20, 2025 10:30 AM"}
        </span>
      </div>
    </div>
  );
}
