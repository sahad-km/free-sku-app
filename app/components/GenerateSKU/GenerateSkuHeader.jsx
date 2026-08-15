import React from "react";
import { SparkleIcon, ArrowRightIcon } from "./Icons";

export default function GenerateSkuHeader({ onSaveDraft, onNextStep, isSaving }) {
  return (
    <div className="generate-header">
      <div className="header-title-container">
        <div className="header-title-row">
          <h1 className="generate-page-title">Generate SKUs</h1>
          <SparkleIcon size={20} color="#5B3DF5" />
        </div>
        <p className="generate-page-subtitle">
          Create powerful SKU rules and apply them to your products.
        </p>
      </div>

      <div className="header-actions">
        <button
          className="btn-save-draft"
          onClick={onSaveDraft}
          type="button"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save draft"}
        </button>
        <button
          className="btn-next-step"
          onClick={onNextStep}
          type="button"
        >
          <span>Next: Select scope</span>
          <ArrowRightIcon size={14} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}
