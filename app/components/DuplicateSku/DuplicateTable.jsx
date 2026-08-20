import React, { useState, useEffect } from "react";
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
  groups = [],
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onViewDetails,
  onResolveDuplicate,
  onIgnoreGroup,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 whenever search, sort, or groups change
  useEffect(() => {
    setCurrentPage(1);
  }, [groups.length, searchQuery, sortBy]);

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

  // Dynamic pagination math
  const totalGroups = groups.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalGroups);
  const pagedGroups = groups.slice(startIndex, endIndex);

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
          className={`btn-pg-num ${p === validCurrentPage ? "pg-active" : ""}`}
          onClick={() => setCurrentPage(p)}
          type="button"
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="card dup-table-card" onClick={closeMenu}>
      {/* ── Header Bar ────────────────────────────────────────────── */}
      <div className="dup-table-header">
        <h3 className="dup-table-title">
          Duplicate groups ({totalGroups})
        </h3>

        <div className="dup-table-controls">
          <div className="search-input-box">
            <SearchIcon size={15} color="#9CA3AF" />
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by SKU or product..."
            />
          </div>

          <div className="sort-dropdown-box">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
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
            {pagedGroups.length === 0 ? (
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
              pagedGroups.map((group) => {
                const isExact = group.duplicateType === "Exact match";
                const isMenuOpen = openMenuId === group.id;

                return (
                  <tr key={group.id}>
                    {/* Group Column */}
                    <td className="td-group-col">
                      <div className="group-cell-content">
                        <div className={`group-icon-box ${group.iconBg || "bg-purple-light"}`}>
                          {renderGroupIcon(group.iconType, group.iconColor || "#5B3DF5")}
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
          {totalGroups === 0
            ? "Showing 0 of 0 groups"
            : `Showing ${startIndex + 1} to ${endIndex} of ${totalGroups} groups`}
        </div>

        <div className="pagination-controls-flex">
          <button
            className="btn-pg-nav"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            <ChevronLeftIcon size={14} color={validCurrentPage <= 1 ? "#9CA3AF" : "#374151"} />
          </button>

          {renderPaginationButtons()}

          <button
            className="btn-pg-nav"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            type="button"
          >
            <ChevronRightIcon size={14} color={validCurrentPage >= totalPages ? "#9CA3AF" : "#374151"} />
          </button>
        </div>

        <div className="per-page-select-wrapper">
          <select
            className="per-page-select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 per page</option>
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
