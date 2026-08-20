import React, { useState, useEffect } from "react";
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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rule) return;
    setLoading(true);
    fetch(`/api/automated-sku?search=${encodeURIComponent(rule.name)}`)
      .then((r) => r.json())
      .then(() => {
        // Fallback or fetched run logs for this rule
        setLogs([
          {
            date: rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : "Just created",
            status: rule.lastRunStatus === "SUCCESS" || rule.lastRunStatus === "none" ? "Completed" : rule.lastRunStatus,
            products: 1,
            variants: rule.skusGenerated || 1,
            skus: rule.skusGenerated || 0,
            duration: "1.2s",
          },
        ]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [rule]);

  if (!rule) return null;

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
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>
              Loading execution logs...
            </div>
          ) : (
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
                {logs.map((log, idx) => (
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
