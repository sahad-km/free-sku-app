import React from "react";
import { SearchIcon, CalendarIcon, ChevronDownIcon } from "./Icons";

export default function HistoryFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  ruleTypeFilter,
  setRuleTypeFilter,
  dateRange,
  setDateRange,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="card filters-card">
      <div className="filters-row">
        {/* Search Field */}
        <div className="search-input-box">
          <SearchIcon size={15} color="#9CA3AF" />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by rule name or note..."
          />
        </div>

        {/* Status Dropdown */}
        <div className="filter-select-group">
          <label className="filter-label">Status</label>
          <div className="select-wrapper">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All status</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="In Progress">In Progress</option>
            </select>
            <ChevronDownIcon size={14} color="#6B7280" />
          </div>
        </div>

        {/* Rule Type Dropdown */}
        <div className="filter-select-group">
          <label className="filter-label">Rule type</label>
          <div className="select-wrapper">
            <select
              className="filter-select"
              value={ruleTypeFilter}
              onChange={(e) => setRuleTypeFilter(e.target.value)}
            >
              <option value="All">All types</option>
              <option value="Manual run">Manual run</option>
              <option value="Automated">Automated</option>
              <option value="Bulk generation">Bulk generation</option>
            </select>
            <ChevronDownIcon size={14} color="#6B7280" />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="filter-select-group">
          <label className="filter-label">Date range</label>
          <button className="date-range-btn" type="button">
            <CalendarIcon size={15} color="#6B7280" />
            <span>{dateRange || "May 14 – May 20, 2025"}</span>
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={onClearFilters} type="button">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
