import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher, useSubmit } from "react-router";
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
import "../styles/app.generate-history.css";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  if (!shopDomain) {
    throw new Response("Unauthorized Shopify session", { status: 401 });
  }

  const { getSkuHistoryList, getSkuHistorySummary } = await import("../services/sku/skuHistoryService.server");

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const statusFilter = url.searchParams.get("status") || "All";
  const ruleTypeFilter = url.searchParams.get("ruleType") || "All";
  const activeTab = url.searchParams.get("tab") || "All history";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);

  const [historyData, summaryData] = await Promise.all([
    getSkuHistoryList({
      shopDomain,
      page,
      limit,
      search,
      statusFilter,
      ruleTypeFilter,
      activeTab,
    }),
    getSkuHistorySummary({ shopDomain }),
  ]);

  return {
    records: historyData.items || [],
    summaryData,
    pagination: historyData.pagination,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  if (!shopDomain) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { deleteSkuHistoryRecord, exportSkuHistoryRecords, getGeneratedSkusForRun } = await import("../services/sku/skuHistoryService.server");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const runId = formData.get("runId");
    const result = await deleteSkuHistoryRecord({ shopDomain, runId });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "export") {
    const format = formData.get("format") || "csv";
    const exportData = await exportSkuHistoryRecords({ shopDomain, format });
    return new Response(exportData.content, {
      status: 200,
      headers: {
        "Content-Type": exportData.mimeType,
        "Content-Disposition": `attachment; filename="${exportData.filename}"`,
      },
    });
  }

  if (intent === "fetch-skus") {
    const runId = formData.get("runId");
    const result = await getGeneratedSkusForRun({ shopDomain, runId, limit: 100 });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

export default function GenerateHistoryPage() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const fetcher = useFetcher();

  // ─── Data State ───────────────────────────────────────────────────────
  const [records, setRecords] = useState(loaderData?.records || []);
  const [summaryData, setSummaryData] = useState(loaderData?.summaryData || {});

  // Sync state when loaderData changes
  useEffect(() => {
    if (loaderData?.records) setRecords(loaderData.records);
    if (loaderData?.summaryData) setSummaryData(loaderData.summaryData);
  }, [loaderData]);

  // ─── Filter & Search State ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("All");
  const [dateRange, setDateRange] = useState("All time");
  const [activeTab, setActiveTab] = useState("All history");

  // ─── Modal States ─────────────────────────────────────────────────────
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [selectedSkusRecord, setSelectedSkusRecord] = useState(null);
  const [selectedDeleteRecord, setSelectedDeleteRecord] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoadingSkus, setIsLoadingSkus] = useState(false);

  // ─── Client Filter Logic ─────────────────────────────────────────────
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
  const handleRunAgain = () => {
    navigate("/app/generate-sku");
  };

  const handleDuplicateRule = () => {
    navigate("/app/generate-sku");
  };

  const handleViewGeneratedSkus = async (record) => {
    setSelectedSkusRecord(record);
    setIsLoadingSkus(true);

    try {
      const res = await fetch(`/api/generate-sku/runs/${record.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) {
          setSelectedSkusRecord({
            ...record,
            generatedSkus: data.auditLogs,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch generated SKUs:", err);
    } finally {
      setIsLoadingSkus(false);
    }
  };

  const handleDeleteConfirm = (id) => {
    // Optimistic UI update
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSummaryData((prev) => ({
      ...prev,
      totalExecuted: Math.max(0, (prev.totalExecuted || 1) - 1),
    }));

    setSelectedDeleteRecord(null);

    // Backend deletion trigger
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("runId", id);
    fetcher.submit(formData, { method: "post" });
  };

  const handleExportConfirm = (format) => {
    setIsExportModalOpen(false);
    const formData = new FormData();
    formData.append("intent", "export");
    formData.append("format", format);

    fetcher.submit(formData, { method: "post" });
  };

  const handleRefresh = () => {
    navigate(".", { replace: true });
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
          onViewGeneratedSkus={handleViewGeneratedSkus}
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
