import React from "react";
import { useNavigate } from "react-router";
import { ArrowRightIcon, DotsVerticalIcon } from "./Icons";

export default function RecentActivity({ items }) {
  const navigate = useNavigate();

  return (
    <div className="card recent-activity-card">
      <div className="recent-activity-header">
        <h2 className="card-section-title">Recent activity</h2>
        <button
          className="header-link-btn"
          onClick={() => navigate("/app/generate-history")}
          type="button"
        >
          <span>View all</span>
          <ArrowRightIcon size={14} color="#5B3DF5" />
        </button>
      </div>

      <div className="activity-table-wrapper">
        {items && items.length > 0 ? (
          <table className="activity-table">
            <thead>
              <tr>
                <th>Rule name</th>
                <th>Status</th>
                <th>Products</th>
                <th>Variants</th>
                <th>Generated</th>
                <th>Date</th>
                <th className="th-action"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="td-rule-name">{row.rule}</td>
                  <td>
                    <span
                      className={`status-badge ${row.status === "Completed"
                        ? "status-completed"
                        : "status-failed"
                        }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="td-number">{row.products}</td>
                  <td className="td-number">{row.variants}</td>
                  <td className="td-number">{row.generated}</td>
                  <td className="td-date">{row.date}</td>
                  <td className="td-action">
                    {row.action === "Retry" ? (
                      <button
                        className="retry-action-btn"
                        onClick={() => navigate("/app/generate-sku")}
                        type="button"
                      >
                        Retry
                      </button>
                    ) : (
                      <button className="icon-action-btn" type="button" aria-label="More options">
                        <DotsVerticalIcon size={16} color="#9CA3AF" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>
            No SKU generation activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
