import React from "react";
import { CloseIcon, CheckCircleIcon } from "./Icons";

export function RunNowModal({ rule, onClose, onConfirmRun }) {
  if (!rule) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Run automation now?</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-delete-desc">
            This will immediately generate SKUs for all products matching current scope for <strong>"{rule.name}"</strong>.
          </p>

          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="btn-modal-submit"
              onClick={() => onConfirmRun(rule)}
              type="button"
            >
              Run now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RuleHistoryModal({ rule, onClose }) {
  if (!rule) return null;

  const mockLogs = [
    { date: "May 20, 2025 10:30 AM", status: "Completed", products: 12, variants: 18, skus: 30, duration: "3.2s" },
    { date: "May 19, 2025 09:15 AM", status: "Completed", products: 8, variants: 24, skus: 32, duration: "2.8s" },
    { date: "May 18, 2025 02:45 PM", status: "Completed", products: 15, variants: 27, skus: 42, duration: "4.1s" },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Automation History Logs</h3>
            <p className="modal-subtitle-id">Rule: {rule.name}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body overflow-y-auto max-h-400">
          <table className="auto-table">
            <thead>
              <tr>
                <th>Run date</th>
                <th>Status</th>
                <th>Products</th>
                <th>Variants</th>
                <th>Generated SKUs</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="date-main-text">{log.date}</td>
                  <td>
                    <span className="auto-status-badge status-active">• {log.status}</span>
                  </td>
                  <td className="td-number">{log.products}</td>
                  <td className="td-number">{log.variants}</td>
                  <td className="td-number font-mono">{log.skus}</td>
                  <td className="time-subtext">{log.duration}</td>
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

export function DeleteAutomationModal({ rule, onClose, onDeleteConfirm }) {
  if (!rule) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title text-danger">Delete automation?</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-delete-desc">
            This will permanently remove <strong>"{rule.name}"</strong>. Previously generated SKUs will not be deleted. This action cannot be undone.
          </p>

          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="btn-modal-danger"
              onClick={() => onDeleteConfirm(rule.id)}
              type="button"
            >
              Delete automation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
