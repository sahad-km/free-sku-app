import React from "react";
import { SparkleIcon, ArrowRightIcon } from "./Icons";

export default function GenerateSkuHeader({
  activeStep = 1,
  onSaveDraft,
  onNextStep,
  onBack,
  isSaving,
}) {
  return (
    <div className="generate-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <div className="header-title-container">
        <div className="header-title-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h1 className="generate-page-title" style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Generate SKUs
          </h1>
          <SparkleIcon size={20} color="#5B3DF5" />
        </div>
        <p className="generate-page-subtitle" style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px", margin: 0 }}>
          {activeStep === 3
            ? "Review the SKUs that will be generated for your selected products and variants."
            : activeStep === 2
            ? "Choose which products and variants this SKU rule will apply to."
            : "Create powerful SKU rules and apply them to your products."}
        </p>
      </div>

      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {activeStep === 1 ? (
          <>
            <button
              className="btn-next-step"
              onClick={onNextStep}
              type="button"
              style={{
                backgroundColor: "#5B3DF5",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "8px",
                fontWeight: 500,
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <span>Next: Select Scope</span>
              <ArrowRightIcon size={14} color="#FFFFFF" />
            </button>
          </>
        ) : activeStep === 2 ? (
          <>
            <button
              type="button"
              onClick={onBack}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                color: "#374151",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onNextStep}
              style={{
                backgroundColor: "#5B3DF5",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "8px",
                fontWeight: 500,
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <span>Next: Preview & Confirm</span>
              <ArrowRightIcon size={14} color="#FFFFFF" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBack}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                color: "#374151",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onNextStep}
              style={{
                backgroundColor: "#5B3DF5",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "8px",
                fontWeight: 500,
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <span>Next: Generate SKUs</span>
              <ArrowRightIcon size={14} color="#FFFFFF" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
