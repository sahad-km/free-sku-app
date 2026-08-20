import React, { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  ZapIcon,
  CheckCircleIcon,
  DotsHorizontalIcon,
  PlayIcon,
  ShirtIcon,
  DocumentIcon,
  TagIcon,
  CalendarIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./Icons";

export default function AutomationTable({
  rules,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onToggleStatus,
  onEditRule,
  onDuplicateRule,
  onRunNow,
  onViewHistory,
  onDeleteRule,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  const renderRuleIcon = (type, color) => {
    switch (type) {
      case "shirt":
        return <ShirtIcon size={16} color={color} />;
      case "document":
        return <DocumentIcon size={16} color={color} />;
      case "tag":
        return <TagIcon size={16} color={color} />;
      case "calendar":
        return <CalendarIcon size={16} color={color} />;
      case "star":
      default:
        return <StarIcon size={16} color={color} />;
    }
  };

  return (
    <div className="card auto-table-card" onClick={closeMenu}>
      {/* ── Top Bar: Tabs & Search/Filters ──────────────────────────── */}
      <div className="auto-table-top-bar">
        <div className="auto-tabs-row">
          {["All rules", "Active", "Paused", "Drafts"].map((tab) => (
            <button
              key={tab}
              className={`auto-tab-btn ${
                activeTab === tab ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="auto-filter-controls">
          <div className="table-search-box">
            <SearchIcon size={15} color="#9CA3AF" />
            <input
              type="text"
              className="table-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules by name or scope..."
            />
          </div>

          <button className="btn-filter-trigger" type="button">
            <FilterIcon size={14} color="#374151" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Main Table ────────────────────────────────────────────── */}
      <div className="auto-table-wrapper">
        <table className="auto-table">
          <thead>
            <tr>
              <th>Rule name</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Trigger</th>
              <th>Last run</th>
              <th>SKUs generated</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={7} className="td-empty">
                  <div className="empty-table-state">
                    <p className="empty-title">No automation rules found</p>
                    <p className="empty-desc">
                      Try adjusting your search or tab filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rules.map((row) => {
                const isActive = row.status === "Active";
                const isPaused = row.status === "Paused";
                const isDraft = row.status === "Draft";
                const isMenuOpen = openMenuId === row.id;

                return (
                  <tr key={row.id}>
                    {/* Rule Name */}
                    <td className="td-rule-info">
                      <div className="rule-cell-flex">
                        <div className={`auto-rule-icon-box ${row.iconBg}`}>
                          {renderRuleIcon(row.iconType, row.iconColor)}
                        </div>
                        <div>
                          <div className="auto-rule-title">{row.name}</div>
                          <div className="auto-rule-desc">{row.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Scope */}
                    <td>
                      <div className="auto-scope-main">{row.scope}</div>
                      {row.scopeSubtext && (
                        <div className="auto-scope-sub">
                          {row.scopeSubtext === "VIP" ? (
                            <span className="vip-tag-pill">VIP</span>
                          ) : (
                            row.scopeSubtext
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span
                        className={`auto-status-badge ${
                          isActive
                            ? "status-active"
                            : isPaused
                            ? "status-paused"
                            : "status-draft"
                        }`}
                      >
                        <span className="status-dot">•</span>
                        <span>{row.status}</span>
                      </span>
                    </td>

                    {/* Trigger */}
                    <td>
                      <div className="auto-trigger-cell">
                        <ZapIcon size={14} color="#5B3DF5" />
                        <span>{row.trigger}</span>
                      </div>
                    </td>

                    {/* Last Run */}
                    <td>
                      <div className="last-run-cell">
                        {(row.lastRunStatus === "success" || row.lastRunStatus === "SUCCESS") && (
                          <CheckCircleIcon size={14} color="#16A34A" />
                        )}
                        <div>
                          <div className="last-run-date">
                            {row.lastRunAt ? new Date(row.lastRunAt).toLocaleDateString() : row.lastRunDate || "Never run"}
                          </div>
                          <div className="last-run-time">
                            {row.lastRunAt ? new Date(row.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : row.lastRunTime || "--"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKUs Generated */}
                    <td>
                      <div className="skus-gen-num">{Number(row.skusGenerated || 0).toLocaleString()}</div>
                      <div className="skus-gen-sub">{row.skusGeneratedSubtext || "Total"}</div>
                    </td>

                    {/* Actions & Toggle */}
                    <td className="td-actions">
                      <div className="action-toggle-row">
                        {/* Interactive Toggle Switch for Active/Paused */}
                        {!isDraft ? (
                          <button
                            className={`toggle-switch-btn ${
                              isActive ? "toggle-on" : "toggle-off"
                            }`}
                            onClick={() => onToggleStatus(row)}
                            type="button"
                            title={isActive ? "Pause automation" : "Activate automation"}
                          >
                            <span className="toggle-switch-circle" />
                          </button>
                        ) : (
                          <button
                            className="btn-play-run"
                            onClick={() => onRunNow(row)}
                            type="button"
                            title="Run automation now"
                          >
                            <PlayIcon size={12} />
                          </button>
                        )}

                        {/* Three Dots Menu */}
                        <div className="menu-popover-wrapper">
                          <button
                            className="btn-more-actions"
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
                                  onEditRule(row);
                                }}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onDuplicateRule(row);
                                }}
                                type="button"
                              >
                                Duplicate
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onRunNow(row);
                                }}
                                type="button"
                              >
                                Run now
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onToggleStatus(row);
                                }}
                                type="button"
                              >
                                {isActive ? "Pause" : "Activate"}
                              </button>
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onViewHistory(row);
                                }}
                                type="button"
                              >
                                View history
                              </button>
                              <div className="menu-divider" />
                              <button
                                className="dropdown-menu-item menu-item-danger"
                                onClick={() => {
                                  closeMenu();
                                  onDeleteRule(row);
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
      <div className="auto-table-pagination">
        <div className="pagination-info">Showing 1 to {rules.length} of 8 rules</div>

        <div className="pagination-btns">
          <button className="btn-page-nav" disabled type="button">
            <ChevronLeftIcon size={14} color="#9CA3AF" />
          </button>
          <button className="btn-page-num page-active" type="button">
            1
          </button>
          <button className="btn-page-num" type="button">
            2
          </button>
          <button className="btn-page-nav" type="button">
            <ChevronRightIcon size={14} color="#374151" />
          </button>
        </div>
      </div>
    </div>
  );
}
