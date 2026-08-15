import React, { useState } from "react";
import { CloseIcon, CheckIcon, SparkleIcon } from "./Icons";

export default function ResolveDuplicateModal({ group, onClose, onResolveConfirm }) {
  if (!group) return null;

  const [resolutionMethod, setResolutionMethod] = useState("generate");
  const [manualSku, setManualSku] = useState(`${group.exampleSku}-FIXED`);
  const [selectedKeepId, setSelectedKeepId] = useState(group.records[0]?.id || "");

  const handleApply = () => {
    onResolveConfirm(group.id, resolutionMethod);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Resolve Duplicate SKUs</h3>
            <p className="modal-subtitle-id">
              Group: <strong>{group.title}</strong> ({group.groupTag})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body overflow-y-auto max-h-500">
          <div className="duplicate-sku-alert-box mb-16">
            <span className="alert-sku-label">Duplicate SKU Value:</span>
            <span className="sku-pill-tag purple-sku font-mono">{group.exampleSku}</span>
            <span className="alert-count-sub">({group.records.length} records affected)</span>
          </div>

          {/* Affected Records List */}
          <h4 className="resolve-section-heading">Affected Products & Variants</h4>
          <div className="affected-records-list mb-20">
            {group.records.map((rec) => (
              <div key={rec.id} className="affected-record-card">
                <div className="record-info-left">
                  <span className="record-prod-title">{rec.product}</span>
                  <span className="record-var-title">Variant: {rec.variant}</span>
                  <span className="record-ids-sub">
                    PID: {rec.productId} | VID: {rec.variantId}
                  </span>
                </div>
                <div className="record-sku-right">
                  <span className="sku-pill-tag red-sku">{rec.currentSku}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Resolution Options */}
          <h4 className="resolve-section-heading">Select Resolution Action</h4>
          <div className="resolution-methods-grid mb-16">
            {/* Method 1: Generate New SKU */}
            <label
              className={`method-option-card ${
                resolutionMethod === "generate" ? "method-selected" : ""
              }`}
            >
              <div className="method-radio-row">
                <input
                  type="radio"
                  name="resMethod"
                  checked={resolutionMethod === "generate"}
                  onChange={() => setResolutionMethod("generate")}
                />
                <span className="method-title">Generate new SKU numbers</span>
              </div>
              <p className="method-desc">
                Automatically generate unique new SKUs using your default SKU rule.
              </p>
              {resolutionMethod === "generate" && (
                <div className="method-sub-config">
                  <span className="config-label">New Preview SKU:</span>
                  <span className="sku-pill-tag purple-sku">
                    {group.exampleSku}-002
                  </span>
                </div>
              )}
            </label>

            {/* Method 2: Manual Edit */}
            <label
              className={`method-option-card ${
                resolutionMethod === "manual" ? "method-selected" : ""
              }`}
            >
              <div className="method-radio-row">
                <input
                  type="radio"
                  name="resMethod"
                  checked={resolutionMethod === "manual"}
                  onChange={() => setResolutionMethod("manual")}
                />
                <span className="method-title">Edit SKU manually</span>
              </div>
              <p className="method-desc">
                Enter a custom unique SKU value for duplicate records.
              </p>
              {resolutionMethod === "manual" && (
                <div className="method-sub-config">
                  <input
                    type="text"
                    className="text-input"
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                  />
                  <span className="avail-status text-green-success">
                    <CheckIcon size={12} color="#16A34A" /> SKU is available
                  </span>
                </div>
              )}
            </label>

            {/* Method 3: Keep SKU */}
            <label
              className={`method-option-card ${
                resolutionMethod === "keep" ? "method-selected" : ""
              }`}
            >
              <div className="method-radio-row">
                <input
                  type="radio"
                  name="resMethod"
                  checked={resolutionMethod === "keep"}
                  onChange={() => setResolutionMethod("keep")}
                />
                <span className="method-title">Keep SKU for one record only</span>
              </div>
              <p className="method-desc">
                Select which product keeps "{group.exampleSku}". Others will be assigned new SKUs.
              </p>
            </label>

            {/* Method 4: Ignore */}
            <label
              className={`method-option-card ${
                resolutionMethod === "ignore" ? "method-selected" : ""
              }`}
            >
              <div className="method-radio-row">
                <input
                  type="radio"
                  name="resMethod"
                  checked={resolutionMethod === "ignore"}
                  onChange={() => setResolutionMethod("ignore")}
                />
                <span className="method-title">Ignore this duplicate</span>
              </div>
              <p className="method-desc">
                Mark as ignored so it no longer appears in unresolved duplicate results.
              </p>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-modal-submit" onClick={handleApply} type="button">
            Apply Resolution
          </button>
        </div>
      </div>
    </div>
  );
}
