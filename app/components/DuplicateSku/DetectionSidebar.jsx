import React from "react";
import { ExternalLinkIcon, HeadsetIcon } from "./Icons";
import { initialScanSummary } from "./mockData";

export default function DetectionSidebar({ scanSummary = initialScanSummary, onContactSupport }) {
  return (
    <div className="detection-sidebar-column">
      {/* Card 1: How duplicate detection works */}
      <div className="card sidebar-card how-detection-card">
        <h3 className="sidebar-card-title mb-14">How duplicate detection works</h3>

        <div className="how-detection-list">
          <div className="how-det-item">
            <div className="how-det-icon-box">📄</div>
            <span className="how-det-text">Scans all SKUs in your store</span>
          </div>

          <div className="how-det-item">
            <div className="how-det-icon-box">≈</div>
            <span className="how-det-text">Identifies exact and similar matches</span>
          </div>

          <div className="how-det-item">
            <div className="how-det-icon-box">👥</div>
            <span className="how-det-text">Groups duplicates for easy review</span>
          </div>

          <div className="how-det-item">
            <div className="how-det-icon-box">🏠</div>
            <span className="how-det-text">You decide what to keep or remove</span>
          </div>
        </div>

        <a href="#" className="learn-more-link" onClick={(e) => e.preventDefault()}>
          <span>Learn more about duplicate detection</span>
          <ExternalLinkIcon size={13} color="#5B3DF5" />
        </a>
      </div>

      {/* Card 2: Scan summary */}
      <div className="card sidebar-card scan-summary-card">
        <h3 className="sidebar-card-title mb-14">Scan summary</h3>

        <div className="scan-summary-list">
          <div className="summary-info-row">
            <span className="info-label">⏱ Start time</span>
            <span className="info-val">{scanSummary.startTime}</span>
          </div>

          <div className="summary-info-row">
            <span className="info-label">⚙ Scan type</span>
            <span className="info-val">{scanSummary.scanType}</span>
          </div>

          <div className="summary-info-row">
            <span className="info-label">🛍 Total products</span>
            <span className="info-val">{scanSummary.totalProducts}</span>
          </div>

          <div className="summary-info-row">
            <span className="info-label">📦 Total variants</span>
            <span className="info-val">{scanSummary.totalVariants}</span>
          </div>

          <div className="summary-info-row">
            <span className="info-label">⌛ Scan duration</span>
            <span className="info-val">{scanSummary.scanDuration}</span>
          </div>

          <div className="summary-info-row">
            <span className="info-label">✓ Status</span>
            <span className="dup-status-badge badge-completed">{scanSummary.status}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Need help */}
      <div className="card sidebar-card help-sidebar-card">
        <h3 className="sidebar-card-title mb-8">Need help?</h3>
        <p className="help-card-text">
          If you have questions about duplicate SKUs, our support team is here to help.
        </p>

        <button className="btn-contact-support" onClick={onContactSupport} type="button">
          <HeadsetIcon size={15} color="#5B3DF5" />
          <span>Contact support</span>
        </button>
      </div>
    </div>
  );
}
