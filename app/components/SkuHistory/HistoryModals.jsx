import React, { useState } from "react";
import { CloseIcon, SearchIcon } from "./Icons";
import { sampleGeneratedSkus } from "./mockData";

export function ViewDetailsModal({ record, onClose }) {
  if (!record) return null;

  const isFailed = (record.status || "").toLowerCase() === "failed";
  const dateStr = record.date || (record.createdAt ? new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
  const timeStr = record.time || (record.createdAt ? new Date(record.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Rule Execution Details</h3>
            <p className="modal-subtitle-id">Run ID: {record.id}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body max-h-500">
          {/* Status banner */}
          <div
            className={`detail-status-banner ${
              isFailed ? "banner-failed" : "banner-completed"
            }`}
          >
            <span className="banner-status-text">
              Status: <strong>{record.status}</strong>
            </span>
            <span className="banner-date-text">
              {dateStr ? `Executed on ${dateStr}${timeStr ? ` at ${timeStr}` : ""}` : ""}
            </span>
          </div>

          {isFailed && (
            <div className="failure-details-box">
              <h4 className="failure-box-title">Failure reason</h4>
              <p className="failure-box-text">
                {record.failureReason ||
                  `${record.variants || record.variantsProcessed || "Some"} variant updates failed.`}
              </p>
            </div>
          )}

          {/* Execution Overview Grid */}
          <h4 className="details-section-heading">Overview</h4>
          <div className="details-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Rule Name</span>
              <span className="metric-val">{record.rule || record.ruleName || "Manual run"}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Rule Type</span>
              <span className="metric-val">{record.ruleType || "Manual run"}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Target Scope</span>
              <span className="metric-val">{record.scope || "All products"}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Products Processed</span>
              <span className="metric-val">{record.products ?? record.productsProcessed ?? 0}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Variants Processed</span>
              <span className="metric-val">{record.variants ?? record.variantsProcessed ?? 0}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Generated SKUs</span>
              <span className="metric-val font-mono">{record.generated ?? record.generatedSkusCount ?? "—"}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Credits Used</span>
              <span className="metric-val">{record.creditsUsed ?? record.variants ?? 0} credits</span>
            </div>
          </div>

          {/* Settings Config Summary */}
          {record.settings && (
            <>
              <h4 className="details-section-heading">SKU Structure Configuration</h4>
              <div className="details-settings-row">
                <div className="setting-chip">
                  <span className="chip-label">Prefix:</span>
                  <span className="chip-val">{record.settings.prefix || "None"}</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Body Type:</span>
                  <span className="chip-val">{record.settings.bodyType || "sequential"}</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Padding:</span>
                  <span className="chip-val">{record.settings.padding || 4} digits</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Suffix:</span>
                  <span className="chip-val">{record.settings.suffix || "None"}</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Separator:</span>
                  <span className="chip-val">{record.settings.separator || "none"}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ViewGeneratedSkusModal({ record, onClose }) {
  const [skuSearch, setSkuSearch] = useState("");
  if (!record) return null;

  const skusList =
    record.generatedSkus ||
    record.auditLogs ||
    sampleGeneratedSkus[record.id] ||
    [];

  const filteredSkus = skusList.filter(
    (item) =>
      item.product.toLowerCase().includes(skuSearch.toLowerCase()) ||
      item.variant.toLowerCase().includes(skuSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(skuSearch.toLowerCase())
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Generated SKUs</h3>
            <p className="modal-subtitle-id">Rule: {record.rule}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body overflow-y-auto max-h-500">
          <div className="modal-search-box mb-16">
            <SearchIcon size={15} color="#9CA3AF" />
            <input
              type="text"
              className="search-input"
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              placeholder="Search by product, variant or SKU..."
            />
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Generated SKU</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkus.map((item, idx) => (
                <tr key={idx}>
                  <td className="td-rule-name">{item.product}</td>
                  <td className="td-number">{item.variant}</td>
                  <td>
                    <span className="sku-pill-tag purple-sku">{item.sku}</span>
                  </td>
                  <td>
                    <span className="status-badge status-completed">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteHistoryModal({ record, onClose, onDeleteConfirm }) {
  if (!record) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title text-danger">Delete generation record?</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-delete-desc">
            This will remove the history record for <strong>"{record.rule}"</strong> from your SKU history. This action cannot be undone.
          </p>

          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="btn-modal-danger"
              onClick={() => onDeleteConfirm(record.id)}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExportModal({ isOpen, onClose, onExportConfirm }) {
  const [format, setFormat] = useState("csv");

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Export SKU History</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field-group mb-16">
            <label className="field-label">Export format</label>
            <div className="radio-group-vertical">
              <label className="radio-inline-label">
                <input
                  type="radio"
                  name="exportFormat"
                  checked={format === "csv"}
                  onChange={() => setFormat("csv")}
                />
                <span>CSV File (.csv)</span>
              </label>
              <label className="radio-inline-label">
                <input
                  type="radio"
                  name="exportFormat"
                  checked={format === "excel"}
                  onChange={() => setFormat("excel")}
                />
                <span>Excel Spreadsheet (.xlsx)</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="btn-modal-submit"
              onClick={() => onExportConfirm(format)}
              type="button"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
