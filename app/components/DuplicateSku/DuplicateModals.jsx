import React, { useState } from "react";
import { CloseIcon } from "./Icons";

export function ScanHistoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const mockScanLogs = [
    { date: "May 20, 2025 10:30 AM", type: "Full scan", skusScanned: "1,842", duplicatesFound: 24, duration: "2m 34s", status: "Completed" },
    { date: "May 12, 2025 04:15 PM", type: "Partial scan", skusScanned: "1,200", duplicatesFound: 18, duration: "1m 45s", status: "Completed" },
    { date: "May 01, 2025 09:00 AM", type: "Full scan", skusScanned: "1,750", duplicatesFound: 32, duration: "2m 20s", status: "Completed" },
  ];

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
              {mockScanLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="date-main-text">{log.date}</td>
                  <td className="td-number">{log.type}</td>
                  <td className="td-number">{log.skusScanned}</td>
                  <td className="td-number text-orange-warning font-bold">{log.duplicatesFound}</td>
                  <td className="time-subtext">{log.duration}</td>
                  <td>
                    <span className="dup-status-badge badge-completed">{log.status}</span>
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
