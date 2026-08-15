import React, { useState } from "react";
import {
  EyeIcon,
  DotsHorizontalIcon,
  RefreshIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentIcon,
} from "./Icons";

export default function HistoryTable({
  records,
  activeTab,
  setActiveTab,
  onRefresh,
  onViewDetails,
  onViewGeneratedSkus,
  onRunAgain,
  onDuplicateRule,
  onDeleteRecord,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  return (
    <div className="card table-card" onClick={closeMenu}>
      {/* ── Table Top Bar: Tabs & Refresh ──────────────────────────── */}
      <div className="table-top-bar">
        <div className="table-tabs-row">
          {["All history", "Successful", "Failed"].map((tab) => (
            <button
              key={tab}
              className={`table-tab-btn ${
                activeTab === tab ? "tab-active" : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          className="btn-refresh"
          onClick={onRefresh}
          type="button"
          title="Refresh history"
        >
          <RefreshIcon size={15} color="#6B7280" />
        </button>
      </div>

      {/* ── Main Table ────────────────────────────────────────────── */}
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Rule name</th>
              <th>Scope</th>
              <th>Products</th>
              <th>Variants</th>
              <th>Generated SKUs</th>
              <th>Status</th>
              <th>Executed on</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="td-empty">
                  <div className="empty-table-state">
                    <p className="empty-title">No history records found</p>
                    <p className="empty-desc">
                      Try adjusting your search query or filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((row) => {
                const isMenuOpen = openMenuId === row.id;
                return (
                  <tr key={row.id}>
                    {/* Rule Name */}
                    <td className="td-rule-col">
                      <div className="rule-cell-content">
                        <div className={`rule-icon-box ${row.iconBg}`}>
                          <DocumentIcon size={16} color={row.iconColor} />
                        </div>
                        <div>
                          <div className="rule-name-text">{row.rule}</div>
                          <div className="rule-type-subtext">{row.ruleType}</div>
                        </div>
                      </div>
                    </td>

                    {/* Scope */}
                    <td>
                      <div className="scope-name-text">{row.scope}</div>
                      <div className="scope-count-subtext">{row.scopeCount}</div>
                    </td>

                    {/* Counts */}
                    <td className="td-number">{row.products}</td>
                    <td className="td-number">{row.variants}</td>
                    <td className="td-number font-mono">{row.generated}</td>

                    {/* Status Badge */}
                    <td>
                      <span
                        className={`history-status-badge ${
                          row.status === "Completed"
                            ? "status-completed"
                            : row.status === "Failed"
                            ? "status-failed"
                            : "status-in-progress"
                        }`}
                      >
                        <span className="status-dot">•</span>
                        <span>{row.status}</span>
                      </span>
                    </td>

                    {/* Executed On */}
                    <td>
                      <div className="date-main-text">{row.date}</div>
                      <div className="time-subtext">{row.time}</div>
                    </td>

                    {/* Actions */}
                    <td className="td-actions">
                      <div className="action-buttons-group">
                        <button
                          className="btn-action-icon"
                          onClick={() => onViewDetails(row)}
                          type="button"
                          title="View details"
                        >
                          <EyeIcon size={16} color="#6B7280" />
                        </button>

                        <div className="action-menu-popover-container">
                          <button
                            className="btn-action-icon"
                            onClick={(e) => handleToggleMenu(row.id, e)}
                            type="button"
                            title="More options"
                          >
                            <DotsHorizontalIcon size={16} color="#6B7280" />
                          </button>

                          {isMenuOpen && (
                            <div className="dropdown-action-menu">
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onViewDetails(row);
                                }}
                                type="button"
                              >
                                View details
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onViewGeneratedSkus(row);
                                }}
                                type="button"
                              >
                                View generated SKUs
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onRunAgain(row);
                                }}
                                type="button"
                              >
                                Run again
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onDuplicateRule(row);
                                }}
                                type="button"
                              >
                                Duplicate rule
                              </button>
                              <div className="menu-divider" />
                              <button
                                className="dropdown-menu-item menu-item-danger"
                                onClick={() => {
                                  closeMenu();
                                  onDeleteRecord(row);
                                }}
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────── */}
      <div className="table-pagination-footer">
        <div className="pagination-info-text">
          Showing 1 to {records.length} of 24 results
        </div>

        <div className="pagination-controls-row">
          <button className="btn-pagination-nav" disabled type="button">
            <ChevronLeftIcon size={14} color="#9CA3AF" />
          </button>
          <button className="btn-page-number page-active" type="button">
            1
          </button>
          <button className="btn-page-number" type="button">
            2
          </button>
          <button className="btn-page-number" type="button">
            3
          </button>
          <button className="btn-page-number" type="button">
            4
          </button>
          <span className="pagination-ellipsis">...</span>
          <button className="btn-pagination-nav" type="button">
            <span>Next</span>
            <ChevronRightIcon size={14} color="#374151" />
          </button>
        </div>

        <div className="per-page-selector">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="per-page-select-input"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <ChevronDownIcon size={14} color="#6B7280" />
        </div>
      </div>
    </div>
  );
}
