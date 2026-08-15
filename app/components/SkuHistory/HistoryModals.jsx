import React, { useState } from "react";
import { CloseIcon, SearchIcon } from "./Icons";
import { sampleGeneratedSkus } from "./mockData";

export function ViewDetailsModal({ record, onClose }) {
  if (!record) return null;

  const isFailed = record.status === "Failed";

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Rule Execution Details</h3>
            <p className="modal-subtitle-id">Run ID: {record.id}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body overflow-y-auto max-h-500">
          {/* Status banner */}
          <div
            className={`detail-status-banner ${
              isFailed ? "banner-failed" : "banner-completed"
            }`}
          >
            <span className="banner-status-text">
              Status: <strong>{record.status}</strong>
            </span>
            <span className="banner-date-text">Executed on {record.date} at {record.time}</span>
          </div>

          {isFailed && (
            <div className="failure-details-box">
              <h4 className="failure-box-title">Failure reason</h4>
              <p className="failure-box-text">
                {record.failureReason ||
                  "Some products could not be updated because their SKU already exists."}
              </p>
            </div>
          )}

          {/* Execution Overview Grid */}
          <h4 className="details-section-heading">Overview</h4>
          <div className="details-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Rule Name</span>
              <span className="metric-val">{record.rule}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Rule Type</span>
              <span className="metric-val">{record.ruleType}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Target Scope</span>
              <span className="metric-val">{record.scope}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Products Processed</span>
              <span className="metric-val">{record.products}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Variants Processed</span>
              <span className="metric-val">{record.variants}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Generated SKUs</span>
              <span className="metric-val font-mono">{record.generated}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Credits Used</span>
              <span className="metric-val">{record.creditsUsed} credits</span>
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
                  <span className="chip-val">{record.settings.bodyType}</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Padding:</span>
                  <span className="chip-val">{record.settings.padding} digits</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Suffix:</span>
                  <span className="chip-val">{record.settings.suffix || "None"}</span>
                </div>
                <div className="setting-chip">
                  <span className="chip-label">Separator:</span>
                  <span className="chip-val">{record.settings.separator}</span>
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

  const skusList = sampleGeneratedSkus[record.id] || [
    { product: "The Minimal Snowboard", variant: "Black / 152", sku: `${record.rule.substring(0, 4).toUpperCase()}-0001`, status: "Generated" },
    { product: "The Minimal Snowboard", variant: "Black / 156", sku: `${record.rule.substring(0, 4).toUpperCase()}-0002`, status: "Generated" },
    { product: "The Videographer Snowboard", variant: "Purple / 154", sku: `${record.rule.substring(0, 4).toUpperCase()}-0003`, status: "Generated" },
  ];

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
