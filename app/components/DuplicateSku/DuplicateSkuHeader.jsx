import React from "react";
import { DuplicateSquaresIcon, HistoryClockIcon, SparkleIcon } from "./Icons";

export default function DuplicateSkuHeader({ onStartScan, onOpenHistory }) {
  return (
    <div className="dup-header">
      <div className="header-left">
        <div className="header-title-row">
          <div className="header-icon-box">
            <DuplicateSquaresIcon size={20} color="#5B3DF5" />
          </div>
          <h1 className="dup-title">Duplicate SKUs</h1>
        </div>
        <p className="dup-subtitle">
          Find and manage duplicate SKUs in your store.
        </p>
      </div>

      <div className="header-actions">
        <button className="btn-scan-history" onClick={onOpenHistory} type="button">
          <HistoryClockIcon size={16} color="#374151" />
          <span>Scan history</span>
        </button>

        <button className="btn-start-scan" onClick={onStartScan} type="button">
          <SparkleIcon size={16} color="#FFFFFF" />
          <span>Start new scan</span>
        </button>
      </div>
    </div>
  );
}
