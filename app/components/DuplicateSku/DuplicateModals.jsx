import React, { useState, useEffect } from "react";
import { CloseIcon } from "./Icons";

export function ScanHistoryModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/duplicate-sku?intent=history")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">Duplicate Scan History Logs</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body overflow-y-auto max-h-400">
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>
              Loading scan history...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>
              No scan history records found. Run a store scan to get started!
            </div>
          ) : (
            <table className="dup-table">
              <thead>
                <tr>
                  <th>Scan Date</th>
                  <th>Scan Type</th>
                  <th>SKUs Scanned</th>
                  <th>Duplicates Found</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="date-main-text">{log.date}</td>
                    <td className="td-number">Full scan</td>
                    <td className="td-number">{Number(log.scanned || 0).toLocaleString()}</td>
                    <td className="td-number text-orange-warning font-bold">{log.duplicates}</td>
                    <td className="time-subtext">{log.duration}</td>
                    <td>
                      <span className="dup-status-badge badge-completed">{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export function ExportDuplicateModal({ isOpen, onClose, onExportConfirm }) {
  const [format, setFormat] = useState("csv");

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Export Duplicate SKUs Report</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field-group mb-16">
            <label className="field-label">Format</label>
            <div className="radio-group-vertical">
              <label className="radio-inline-label">
                <input
                  type="radio"
                  name="expFormat"
                  checked={format === "csv"}
                  onChange={() => setFormat("csv")}
                />
                <span>CSV File (.csv)</span>
              </label>
              <label className="radio-inline-label">
                <input
                  type="radio"
                  name="expFormat"
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
