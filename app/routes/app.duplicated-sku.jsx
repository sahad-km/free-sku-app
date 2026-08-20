import React, { useState, useMemo, useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getDuplicateSummaryAndGroups } from "../services/sku/duplicateScanService.server";
import DuplicateSkuHeader from "../components/DuplicateSku/DuplicateSkuHeader";
import DuplicateSummary from "../components/DuplicateSku/DuplicateSummary";
import ScanStoreCard from "../components/DuplicateSku/ScanStoreCard";
import DetectionSidebar from "../components/DuplicateSku/DetectionSidebar";
import DuplicateTable from "../components/DuplicateSku/DuplicateTable";
import ScanProgressModal from "../components/DuplicateSku/ScanProgressModal";
import ResolveDuplicateModal from "../components/DuplicateSku/ResolveDuplicateModal";
import {
  ScanHistoryModal,
  ExportDuplicateModal,
} from "../components/DuplicateSku/DuplicateModals";
import { useToast } from "../components/Common/Toast";
import "../styles/app.duplicated-sku.css";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  try {
    const data = await getDuplicateSummaryAndGroups({ shopDomain });
    return {
      groups: data.groups || [],
      summary: data.summary || {
        duplicateGroups: 0,
        affectedVariants: 0,
        affectedProducts: 0,
        riskLevel: "Low Risk",
        lastScanDate: "Never",
        lastScanTime: "--",
      },
      scanSummary: data.scanSummary || {
        totalScanned: 0,
        startTime: "Never scanned",
      },
    };
  } catch (err) {
    console.warn("Loader Duplicated SKU warning:", err.message);
    return {
      groups: [],
      summary: {
        duplicateGroups: 0,
        affectedVariants: 0,
        affectedProducts: 0,
        riskLevel: "Low Risk",
        lastScanDate: "Never",
        lastScanTime: "--",
      },
      scanSummary: {
        totalScanned: 0,
        startTime: "Never scanned",
      },
    };
  }
};

export default function DuplicatedSkuPage() {
  const loaderData = useLoaderData() || {};
  const revalidator = useRevalidator();
  const { showToast } = useToast();

  // ─── Data State ───────────────────────────────────────────────────────
  const [summaryData, setSummaryData] = useState(loaderData.summary || {});
  const [scanSummary, setScanSummary] = useState(loaderData.scanSummary || {});
  const [groups, setGroups] = useState(loaderData.groups || []);

  useEffect(() => {
    setSummaryData(loaderData.summary || {});
    setScanSummary(loaderData.scanSummary || {});
    setGroups(loaderData.groups || []);
  }, [loaderData]);

  // ─── Filter & Search State ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("severity");

  // ─── Modal States ─────────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [selectedResolveGroup, setSelectedResolveGroup] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // ─── Filter & Sort Logic ──────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    let result = groups.filter((g) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = (g.title || "").toLowerCase().includes(query);
        const matchTag = (g.groupTag || "").toLowerCase().includes(query);
        const matchSku = (g.exampleSku || "").toLowerCase().includes(query);
        const matchType = (g.duplicateType || "").toLowerCase().includes(query);

        if (!matchTitle && !matchTag && !matchSku && !matchType) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === "affected") {
      result.sort((a, b) => (b.records?.length || 0) - (a.records?.length || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [groups, searchQuery, sortBy]);

  // ─── Action Handlers ──────────────────────────────────────────────────
  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/duplicate-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "scan" }),
      });
      const resJson = await res.json();
      setIsScanning(false);

      if (resJson.success) {
        revalidator.revalidate();
      } else {
        showToast(resJson.error || "Failed to scan catalog", "warning");
      }
    } catch (err) {
      setIsScanning(false);
      console.warn("Scan failed:", err.message);
    }
  };

  const handleResolveConfirm = async (groupId, method, manualSku = "", selectedKeepId = "") => {
    try {
      setSelectedResolveGroup(null);

      const res = await fetch("/api/duplicate-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "resolve",
          groupId,
          method,
          manualSku,
          selectedKeepId,
        }),
      });

      const resJson = await res.json();

      if (resJson.success) {
        showToast("Duplicate group successfully resolved!", "success");
        revalidator.revalidate();
      } else {
        showToast(resJson.error || "Failed to resolve group", "error");
      }
    } catch (err) {
      console.warn("Failed to resolve group:", err.message);
    }
  };

  const handleIgnoreGroup = async (group) => {
    try {
      const res = await fetch("/api/duplicate-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "ignore",
          groupId: group.id,
        }),
      });

      if (res.ok) {
        showToast(`Group "${group.title}" marked as ignored.`, "info");
        revalidator.revalidate();
      }
    } catch (err) {
      console.warn("Failed to ignore group:", err.message);
    }
  };

  const handleExportConfirm = (format) => {
    setIsExportOpen(false);
    showToast(`Duplicate SKU report exported as ${format.toUpperCase()}!`, "success");
  };

  return (
    <div className="dup-page-root">
      <div className="dup-page-inner">
        {/* ── Header ───────────────────────────────────────────────── */}
        <DuplicateSkuHeader
          onStartScan={handleStartScan}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />

        {/* ── Main 2-Column Section ────────────────────────────────── */}
        <div className="dup-main-grid">
          {/* Left Column: Summary Cards, Scan Banner, Duplicate Table */}
          <div className="dup-left-section">
            <DuplicateSummary summaryData={summaryData} />

            <ScanStoreCard
              onStartScan={handleStartScan}
              lastScanText={`Last scan: ${summaryData.lastScanDate} ${summaryData.lastScanTime}`}
            />

            <DuplicateTable
              groups={filteredGroups}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onViewDetails={(grp) => setSelectedResolveGroup(grp)}
              onResolveDuplicate={(grp) => setSelectedResolveGroup(grp)}
              onIgnoreGroup={handleIgnoreGroup}
            />
          </div>

          {/* Right Column: Detection Guides & Scan Summary Sidebar */}
          <DetectionSidebar
            scanSummary={scanSummary}
            onContactSupport={() => showToast("Connecting to Shopify SKU Support...", "info")}
          />
        </div>
      </div>

      {/* ── Modals & Scanning Overlays ─────────────────────────────── */}
      <ScanProgressModal
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanComplete={() => {}}
      />

      <ResolveDuplicateModal
        group={selectedResolveGroup}
        onClose={() => setSelectedResolveGroup(null)}
        onResolveConfirm={handleResolveConfirm}
      />

      <ScanHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <ExportDuplicateModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportConfirm={handleExportConfirm}
      />
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
