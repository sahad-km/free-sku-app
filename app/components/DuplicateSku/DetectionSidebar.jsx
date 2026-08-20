import React from "react";
import {
  ExternalLinkIcon,
  HeadsetIcon,
  DuplicateSquaresIcon,
  SparkleIcon,
  ClusterIcon,
  ShieldCheckIcon,
  HistoryClockIcon,
  TagIcon,
  BagIcon,
  CheckIcon,
  FilterIcon,
} from "./Icons";

export default function DetectionSidebar({ scanSummary = {}, onContactSupport }) {
  const {
    startTime = "Never",
    scanType = "Full Catalog",
    totalProducts = 0,
    totalVariants = 0,
    scanDuration = "--",
    status = "Completed",
  } = scanSummary || {};

  return (
    <div className="detection-sidebar-column">
      {/* Card 1: How duplicate detection works */}
      <div className="card sidebar-card how-detection-card">
        <h3 className="sidebar-card-title mb-14">How duplicate detection works</h3>

        <div className="how-detection-list">
          <div className="how-det-item">
            <div className="how-det-icon-box bg-purple-light">
              <DuplicateSquaresIcon size={14} color="#5B3DF5" />
            </div>
            <span className="how-det-text">Scans all SKUs in your store</span>
          </div>

          <div className="how-det-item">
            <div className="how-det-icon-box bg-blue-light">
              <SparkleIcon size={14} color="#2563EB" />
            </div>
            <span className="how-det-text">Identifies exact & similar matches</span>
          </div>

          <div className="how-det-item">
            <div className="how-det-icon-box bg-orange-light">
              <ClusterIcon size={14} color="#D97706" />
            </div>
            <span className="how-det-text">Groups duplicates for easy review</span>
          </div>

          <div className="how-det-item">
            <div className="how-det-icon-box bg-green-light">
              <ShieldCheckIcon size={14} color="#16A34A" />
            </div>
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
            <div className="info-label-flex">
              <HistoryClockIcon size={14} color="#6B7280" />
              <span className="info-label">Start time</span>
            </div>
            <span className="info-val">{startTime}</span>
          </div>

          <div className="summary-info-row">
            <div className="info-label-flex">
              <FilterIcon size={14} color="#6B7280" />
              <span className="info-label">Scan type</span>
            </div>
            <span className="info-val">{scanType}</span>
          </div>

          <div className="summary-info-row">
            <div className="info-label-flex">
              <BagIcon size={14} color="#6B7280" />
              <span className="info-label">Total products</span>
            </div>
            <span className="info-val">{Number(totalProducts).toLocaleString()}</span>
          </div>

          <div className="summary-info-row">
            <div className="info-label-flex">
              <TagIcon size={14} color="#6B7280" />
              <span className="info-label">Total variants</span>
            </div>
            <span className="info-val">{Number(totalVariants).toLocaleString()}</span>
          </div>

          <div className="summary-info-row">
            <div className="info-label-flex">
              <HistoryClockIcon size={14} color="#6B7280" />
              <span className="info-label">Scan duration</span>
            </div>
            <span className="info-val">{scanDuration}</span>
          </div>

          <div className="summary-info-row">
            <div className="info-label-flex">
              <CheckIcon size={14} color="#16A34A" />
              <span className="info-label">Status</span>
            </div>
            <span className="dup-status-badge badge-completed">{status}</span>
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
