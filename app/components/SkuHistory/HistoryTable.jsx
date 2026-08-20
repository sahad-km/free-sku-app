import React, { useState, useEffect } from "react";
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
  records = [],
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

  // Reset to page 1 whenever activeTab or records change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, records.length]);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  // Dynamic pagination math
  const totalRecords = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const pagedRecords = records.slice(startIndex, endIndex);

  const renderPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) pages.push("...");
      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(totalPages - 1, validCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (validCurrentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === "...") {
        return (
          <span key={`ellipsis_${idx}`} className="pagination-ellipsis">
            ...
          </span>
        );
      }
      return (
        <button
          key={`page_${p}`}
          className={`btn-page-number ${p === validCurrentPage ? "page-active" : ""}`}
          onClick={() => setCurrentPage(p)}
          type="button"
        >
          {p}
        </button>
      );
    });
  };

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
            {pagedRecords.length === 0 ? (
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
              pagedRecords.map((row) => {
                const isMenuOpen = openMenuId === row.id;
                return (
                  <tr key={row.id}>
                    {/* Rule Name */}
                    <td className="td-rule-col">
                      <div className="rule-cell-content">
                        <div className={`rule-icon-box ${row.iconBg || "bg-purple-light"}`}>
                          <DocumentIcon size={16} color={row.iconColor || "#5B3DF5"} />
                        </div>
                        <div>
                          <div className="rule-name-text">{row.rule || row.ruleName}</div>
                          <div className="rule-type-subtext">{row.ruleType || "Manual run"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Scope */}
                    <td>
                      <div className="scope-name-text">{row.scope || "All products"}</div>
                      <div className="scope-count-subtext">{row.scopeCount || ""}</div>
                    </td>

                    {/* Counts */}
                    <td className="td-number">{row.products ?? row.productsProcessed ?? 0}</td>
                    <td className="td-number">{row.variants ?? row.variantsProcessed ?? 0}</td>
                    <td className="td-number font-mono">{row.generated ?? row.generatedSkusCount ?? "—"}</td>

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
          {totalRecords === 0
            ? "Showing 0 of 0 results"
            : `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} results`}
        </div>

        <div className="pagination-controls-row">
          <button
            className="btn-pagination-nav"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            <ChevronLeftIcon size={14} color={validCurrentPage <= 1 ? "#9CA3AF" : "#374151"} />
            <span>Prev</span>
          </button>

          {renderPaginationButtons()}

          <button
            className="btn-pagination-nav"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            type="button"
          >
            <span>Next</span>
            <ChevronRightIcon size={14} color={validCurrentPage >= totalPages ? "#9CA3AF" : "#374151"} />
          </button>
        </div>

        <div className="per-page-selector">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
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
