import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import SkuHistoryHeader from "../components/SkuHistory/SkuHistoryHeader";
import HistorySummary from "../components/SkuHistory/HistorySummary";
import HistoryFilters from "../components/SkuHistory/HistoryFilters";
import HistoryTable from "../components/SkuHistory/HistoryTable";
import {
  ViewDetailsModal,
  ViewGeneratedSkusModal,
  DeleteHistoryModal,
  ExportModal,
} from "../components/SkuHistory/HistoryModals";
import { initialHistoryRecords, initialSummaryData } from "../components/SkuHistory/mockData";
import "../styles/app.generate-history.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function GenerateHistoryPage() {
  const navigate = useNavigate();

  // ─── Data State ───────────────────────────────────────────────────────
  const [records, setRecords] = useState(initialHistoryRecords);
  const [summaryData, setSummaryData] = useState(initialSummaryData);

  // ─── Filter & Search State ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("All");
  const [dateRange, setDateRange] = useState("May 14 – May 20, 2025");
  const [activeTab, setActiveTab] = useState("All history");

  // ─── Modal States ─────────────────────────────────────────────────────
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [selectedSkusRecord, setSelectedSkusRecord] = useState(null);
  const [selectedDeleteRecord, setSelectedDeleteRecord] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Tab filter
      if (activeTab === "Successful" && rec.status !== "Completed") return false;
      if (activeTab === "Failed" && rec.status !== "Failed") return false;

      // Status dropdown filter
      if (statusFilter !== "All" && rec.status !== statusFilter) return false;

      // Rule type dropdown filter
      if (ruleTypeFilter !== "All" && rec.ruleType !== ruleTypeFilter) return false;

      // Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchRule = rec.rule.toLowerCase().includes(query);
        const matchScope = rec.scope.toLowerCase().includes(query);
        const matchId = rec.id.toLowerCase().includes(query);
        const matchType = rec.ruleType.toLowerCase().includes(query);

        if (!matchRule && !matchScope && !matchId && !matchType) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, statusFilter, ruleTypeFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "All" || ruleTypeFilter !== "All";

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setRuleTypeFilter("All");
  };

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleRunAgain = (record) => {
    // Navigate to Generate SKU page with pre-filled state
    navigate("/app/generate-sku");
  };

  const handleDuplicateRule = (record) => {
    navigate("/app/generate-sku");
  };

  const handleDeleteConfirm = (id) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);

    // Update summary counts
    setSummaryData((prev) => ({
      ...prev,
      totalExecuted: Math.max(0, prev.totalExecuted - 1),
    }));

    setSelectedDeleteRecord(null);
  };

  const handleExportConfirm = (format) => {
    setIsExportModalOpen(false);
    alert(`SKU History successfully exported as ${format.toUpperCase()}!`);
  };

  const handleRefresh = () => {
    alert("History refreshed!");
  };

  return (
    <div className="history-page-root">
      <div className="history-page-inner">
        {/* ── Header ───────────────────────────────────────────────── */}
        <SkuHistoryHeader onExport={() => setIsExportModalOpen(true)} />

        {/* ── Summary KPI Cards ────────────────────────────────────── */}
        <HistorySummary summaryData={summaryData} />

        {/* ── Search & Filter Controls ─────────────────────────────── */}
        <HistoryFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          ruleTypeFilter={ruleTypeFilter}
          setRuleTypeFilter={setRuleTypeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* ── History Table & Tabs ─────────────────────────────────── */}
        <HistoryTable
          records={filteredRecords}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefresh={handleRefresh}
          onViewDetails={(rec) => setSelectedDetailRecord(rec)}
          onViewGeneratedSkus={(rec) => setSelectedSkusRecord(rec)}
          onRunAgain={handleRunAgain}
          onDuplicateRule={handleDuplicateRule}
          onDeleteRecord={(rec) => setSelectedDeleteRecord(rec)}
        />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <ViewDetailsModal
        record={selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
      />

      <ViewGeneratedSkusModal
        record={selectedSkusRecord}
        onClose={() => setSelectedSkusRecord(null)}
      />

      <DeleteHistoryModal
        record={selectedDeleteRecord}
        onClose={() => setSelectedDeleteRecord(null)}
        onDeleteConfirm={handleDeleteConfirm}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportConfirm={handleExportConfirm}
      />
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
