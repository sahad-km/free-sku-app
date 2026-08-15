import React from "react";
import { useNavigate } from "react-router";
import { HistoryClockIcon, ExportIcon, PlusIcon } from "./Icons";

export default function SkuHistoryHeader({ onExport }) {
  const navigate = useNavigate();

  return (
    <div className="history-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="history-title">SKU History</h1>
          <HistoryClockIcon size={22} color="#5B3DF5" />
        </div>
        <p className="history-subtitle">
          Track all generated SKUs and rule executions
        </p>
      </div>

      <div className="header-actions">
        <button className="btn-export" onClick={onExport} type="button">
          <ExportIcon size={15} color="#374151" />
          <span>Export history</span>
        </button>

        <button
          className="btn-generate-new"
          onClick={() => navigate("/app/generate-sku")}
          type="button"
        >
          <PlusIcon size={16} color="#FFFFFF" />
          <span>Generate new SKUs</span>
        </button>
      </div>
    </div>
  );
}
