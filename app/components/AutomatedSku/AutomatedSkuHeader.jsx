import React from "react";
import { useNavigate } from "react-router";
import { SparkleIcon, HistoryClockIcon, PlusIcon } from "./Icons";

export default function AutomatedSkuHeader({ onCreateNewRule }) {
  const navigate = useNavigate();

  return (
    <div className="auto-sku-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="auto-sku-title">Automated SKU</h1>
          <SparkleIcon size={20} color="#5B3DF5" />
        </div>
        <p className="auto-sku-subtitle">
          Automatically generate SKUs for new products based on your rules.
        </p>
      </div>

      <div className="header-actions">
        <button
          className="btn-view-history"
          onClick={() => navigate("/app/generate-history")}
          type="button"
        >
          <HistoryClockIcon size={16} color="#374151" />
          <span>View history</span>
        </button>

        <button
          className="btn-create-rule"
          onClick={onCreateNewRule}
          type="button"
        >
          <PlusIcon size={16} color="#FFFFFF" />
          <span>Create new rule</span>
        </button>
      </div>
    </div>
  );
}
