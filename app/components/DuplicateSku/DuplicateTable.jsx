import React, { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  ShirtIcon,
  BagIcon,
  MugIcon,
  CapIcon,
  BottleIcon,
  EyeIcon,
  WrenchIcon,
  EyeOffIcon,
} from "./Icons";

export default function DuplicateTable({
  groups,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onViewDetails,
  onResolveDuplicate,
  onIgnoreGroup,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  const renderGroupIcon = (type, color) => {
    switch (type) {
      case "shirt":
        return <ShirtIcon size={16} color={color} />;
      case "bag":
        return <BagIcon size={16} color={color} />;
      case "mug":
        return <MugIcon size={16} color={color} />;
      case "cap":
        return <CapIcon size={16} color={color} />;
      case "bottle":
      default:
        return <BottleIcon size={16} color={color} />;
    }
  };

  return (
    <div className="card dup-table-card" onClick={closeMenu}>
      {/* ── Header Bar ────────────────────────────────────────────── */}
      <div className="dup-table-header">
        <h3 className="dup-table-title">
          Duplicate groups ({groups.length})
        </h3>

        <div className="dup-table-controls">
          <div className="search-input-box">
            <SearchIcon size={15} color="#9CA3AF" />
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU or product..."
            />
          </div>

          <div className="sort-dropdown-box">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="severity">Sort by</option>
              <option value="affected">Affected SKUs</option>
              <option value="name">Group name</option>
            </select>
            <ChevronDownIcon size={14} color="#6B7280" />
          </div>

          <button className="btn-filter-trigger" type="button">
            <FilterIcon size={14} color="#374151" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="dup-table-wrapper">
        <table className="dup-table">
          <thead>
            <tr>
              <th>GROUP</th>
              <th>DUPLICATE TYPE</th>
              <th>AFFECTED SKUS</th>
              <th>EXAMPLE SKU</th>
              <th className="th-actions">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="td-empty">
                  <div className="empty-table-state">
                    <p className="empty-title">No duplicate groups found</p>
                    <p className="empty-desc">
                      All your product SKUs appear to be unique!
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const isExact = group.duplicateType === "Exact match";
                const isMenuOpen = openMenuId === group.id;

                return (
                  <tr key={group.id}>
                    {/* Group Column */}
                    <td className="td-group-col">
                      <div className="group-cell-content">
                        <div className={`group-icon-box ${group.iconBg}`}>
                          {renderGroupIcon(group.iconType, group.iconColor)}
                        </div>
                        <div>
                          <div className="group-title-text">{group.title}</div>
                          <div className="group-tag-text">{group.groupTag}</div>
                        </div>
                      </div>
                    </td>

                    {/* Duplicate Type */}
                    <td>
                      <div className="match-type-cell">
                        <span
                          className={`match-type-badge ${
                            isExact ? "badge-exact-match" : "badge-potential-match"
                          }`}
                        >
                          <span className="badge-dot">•</span>
                          <span>{group.duplicateType}</span>
                        </span>
                        <div className="match-type-sub">
                          {group.duplicateTypeDesc}
                        </div>
                      </div>
                    </td>

                    {/* Affected SKUs */}
                    <td>
                      <div className="affected-skus-val">
                        {group.affectedSkusCount}
                      </div>
                      <div className="affected-prods-sub">
                        {group.affectedProductsCount}
                      </div>
                    </td>

                    {/* Example SKU */}
                    <td>
                      <div className="example-sku-code">{group.exampleSku}</div>
                      <div className="example-sku-sub">{group.moreCount}</div>
                    </td>

                    {/* Action Column */}
                    <td className="td-actions">
                      <div className="action-buttons-flex">
                        <button
                          className="btn-view-details-outline"
                          onClick={() => onViewDetails(group)}
                          type="button"
                        >
                          View details
                        </button>

                        <div className="popover-action-wrapper">
                          <button
                            className="btn-dots-menu"
                            onClick={(e) => handleToggleMenu(group.id, e)}
                            type="button"
                          >
                            <DotsHorizontalIcon size={16} color="#6B7280" />
                          </button>

                          {isMenuOpen && (
                            <div className="dropdown-action-menu">
                              <button
                                className="dropdown-menu-item"
                                onClick={() => {
                                  closeMenu();
                                  onViewDetails(group);
                                }}
                                type="button"
                              >
                                <EyeIcon size={14} color="#4B5563" />
                                <span>View details</span>
                              </button>
                              <button
                                className="dropdown-menu-item menu-item-primary"
                                onClick={() => {
                                  closeMenu();
                                  onResolveDuplicate(group);
                                }}
                                type="button"
                              >
                                <WrenchIcon size={14} color="#5B3DF5" />
                                <span>Resolve duplicate</span>
                              </button>
                              <div className="menu-divider" />
                              <button
                                className="dropdown-menu-item menu-item-muted"
                                onClick={() => {
                                  closeMenu();
                                  onIgnoreGroup(group);
                                }}
                                type="button"
                              >
                                <EyeOffIcon size={14} color="#9CA3AF" />
                                <span>Ignore duplicate</span>
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
      <div className="dup-table-pagination">
        <div className="pagination-text-info">
          Showing 1 to {groups.length} of 18 groups
        </div>

        <div className="pagination-controls-flex">
          <button className="btn-pg-nav" disabled type="button">
            <ChevronLeftIcon size={14} color="#9CA3AF" />
          </button>
          <button className="btn-pg-num pg-active" type="button">
            1
          </button>
          <button className="btn-pg-num" type="button">
            2
          </button>
          <button className="btn-pg-num" type="button">
            3
          </button>
          <button className="btn-pg-num" type="button">
            4
          </button>
          <button className="btn-pg-nav" type="button">
            <ChevronRightIcon size={14} color="#374151" />
          </button>
        </div>

        <div className="per-page-select-wrapper">
          <select className="per-page-select">
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
          </select>
          <ChevronDownIcon size={14} color="#6B7280" />
        </div>
      </div>
    </div>
  );
}
