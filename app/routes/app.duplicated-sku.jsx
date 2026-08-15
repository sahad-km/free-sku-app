import React, { useState, useMemo } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
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
import {
  initialDuplicateSummary,
  initialScanSummary,
  initialDuplicateGroups,
} from "../components/DuplicateSku/mockData";
import "../styles/app.duplicated-sku.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function DuplicatedSkuPage() {
  // ─── Data State ───────────────────────────────────────────────────────
  const [summaryData, setSummaryData] = useState(initialDuplicateSummary);
  const [scanSummary, setScanSummary] = useState(initialScanSummary);
  const [groups, setGroups] = useState(initialDuplicateGroups);

  // ─── Filter & Search State ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("severity");

  // ─── Modal States ─────────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [selectedResolveGroup, setSelectedResolveGroup] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    let result = groups.filter((g) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = g.title.toLowerCase().includes(query);
        const matchTag = g.groupTag.toLowerCase().includes(query);
        const matchSku = g.exampleSku.toLowerCase().includes(query);
        const matchType = g.duplicateType.toLowerCase().includes(query);

        if (!matchTitle && !matchTag && !matchSku && !matchType) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === "affected") {
      result.sort((a, b) => b.records.length - a.records.length);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [groups, searchQuery, sortBy]);

  // ─── Action Handlers ──────────────────────────────────────────────────
  const handleStartScan = () => {
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    // Update last scan timestamp
    const nowStr = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setSummaryData((prev) => ({
      ...prev,
      lastScanDate: "Today",
      lastScanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setScanSummary((prev) => ({
      ...prev,
      startTime: nowStr,
    }));
    alert("Store scan completed! All duplicate SKU groups are updated.");
  };

  const handleResolveConfirm = (groupId, method) => {
    const updated = groups.filter((g) => g.id !== groupId);
    setGroups(updated);

    // Update summary count
    setSummaryData((prev) => ({
      ...prev,
      duplicateGroups: Math.max(0, prev.duplicateGroups - 1),
    }));

    setSelectedResolveGroup(null);
    alert(`Duplicate group successfully resolved using "${method}" method!`);
  };

  const handleIgnoreGroup = (group) => {
    const updated = groups.filter((g) => g.id !== group.id);
    setGroups(updated);
    alert(`Group "${group.title}" marked as ignored.`);
  };

  const handleExportConfirm = (format) => {
    setIsExportOpen(false);
    alert(`Duplicate SKU report exported as ${format.toUpperCase()}!`);
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
          {/* Left Column (~70%): Summary Cards, Scan Banner, Duplicate Table */}
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

          {/* Right Column (~30%): Detection Guides & Scan Summary Sidebar */}
          <DetectionSidebar
            scanSummary={scanSummary}
            onContactSupport={() => alert("Connecting to Shopify SKU Support...")}
          />
        </div>
      </div>

      {/* ── Modals & Scanning Overlays ─────────────────────────────── */}
      <ScanProgressModal
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanComplete={handleScanComplete}
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
