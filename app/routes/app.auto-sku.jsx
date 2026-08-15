import React, { useState, useMemo } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import AutomatedSkuHeader from "../components/AutomatedSku/AutomatedSkuHeader";
import AutomationSummary from "../components/AutomatedSku/AutomationSummary";
import HowItWorksSidebar from "../components/AutomatedSku/HowItWorksSidebar";
import AutomationTable from "../components/AutomatedSku/AutomationTable";
import UpgradeBanner from "../components/AutomatedSku/UpgradeBanner";
import CreateAutomationModal from "../components/AutomatedSku/CreateAutomationModal";
import {
  RunNowModal,
  RuleHistoryModal,
  DeleteAutomationModal,
} from "../components/AutomatedSku/AutomationModals";
import { initialAutomationRules, initialAutomationSummary } from "../components/AutomatedSku/mockData";
import "../styles/app.auto-sku.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function AutoSkuPage() {
  // ─── Data State ───────────────────────────────────────────────────────
  const [rules, setRules] = useState(initialAutomationRules);
  const [summaryData, setSummaryData] = useState(initialAutomationSummary);

  // ─── Filter & Search State ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("All rules");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Modal States ─────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [selectedRunNowRule, setSelectedRunNowRule] = useState(null);
  const [selectedHistoryRule, setSelectedHistoryRule] = useState(null);
  const [selectedDeleteRule, setSelectedDeleteRule] = useState(null);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      // Tab filter
      if (activeTab === "Active" && r.status !== "Active") return false;
      if (activeTab === "Paused" && r.status !== "Paused") return false;
      if (activeTab === "Drafts" && r.status !== "Draft") return false;

      // Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchScope = r.scope.toLowerCase().includes(query);
        const matchTrigger = r.trigger.toLowerCase().includes(query);
        if (!matchName && !matchScope && !matchTrigger) return false;
      }

      return true;
    });
  }, [rules, activeTab, searchQuery]);

  // ─── Action Handlers ──────────────────────────────────────────────────
  const handleToggleStatus = (rule) => {
    const updated = rules.map((r) => {
      if (r.id === rule.id) {
        const newStatus = r.status === "Active" ? "Paused" : "Active";
        return { ...r, status: newStatus };
      }
      return r;
    });
    setRules(updated);

    // Update active count in summary
    const newActiveCount = updated.filter((r) => r.status === "Active").length;
    setSummaryData((prev) => ({ ...prev, activeRules: newActiveCount }));
  };

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setIsCreateModalOpen(true);
  };

  const handleSaveRule = (savedRule) => {
    let updated;
    const exists = rules.some((r) => r.id === savedRule.id);
    if (exists) {
      updated = rules.map((r) => (r.id === savedRule.id ? savedRule : r));
    } else {
      updated = [savedRule, ...rules];
    }
    setRules(updated);

    const newActiveCount = updated.filter((r) => r.status === "Active").length;
    setSummaryData((prev) => ({ ...prev, activeRules: newActiveCount }));
  };

  const handleRunNowConfirm = (rule) => {
    setSelectedRunNowRule(null);
    alert(`Automation "${rule.name}" triggered successfully! SKUs are being generated.`);
  };

  const handleDeleteConfirm = (id) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);

    const newActiveCount = updated.filter((r) => r.status === "Active").length;
    setSummaryData((prev) => ({ ...prev, activeRules: newActiveCount }));

    setSelectedDeleteRule(null);
  };

  return (
    <div className="auto-sku-page-root">
      <div className="auto-sku-page-inner">
        {/* ── Header ───────────────────────────────────────────────── */}
        <AutomatedSkuHeader onCreateNewRule={handleOpenCreateModal} />

        {/* ── Main 2-Column Section ────────────────────────────────── */}
        <div className="auto-main-grid">
          {/* Left Column: Summary Cards & Rules Table */}
          <div className="auto-left-section">
            <AutomationSummary summaryData={summaryData} />

            <AutomationTable
              rules={filteredRules}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onToggleStatus={handleToggleStatus}
              onEditRule={handleOpenEditModal}
              onDuplicateRule={(r) => handleOpenEditModal({ ...r, id: `auto-${Date.now()}`, name: `${r.name} Copy` })}
              onRunNow={(r) => setSelectedRunNowRule(r)}
              onViewHistory={(r) => setSelectedHistoryRule(r)}
              onDeleteRule={(r) => setSelectedDeleteRule(r)}
            />
          </div>

          {/* Right Column: How it works & Tips Sidebar */}
          <HowItWorksSidebar onCreateNewRule={handleOpenCreateModal} />
        </div>

        {/* ── Bottom Upgrade Banner ─────────────────────────────────── */}
        <UpgradeBanner />
      </div>

      {/* ── Modals & Wizards ────────────────────────────────────────── */}
      <CreateAutomationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveRule={handleSaveRule}
        initialRule={editingRule}
      />

      <RunNowModal
        rule={selectedRunNowRule}
        onClose={() => setSelectedRunNowRule(null)}
        onConfirmRun={handleRunNowConfirm}
      />

      <RuleHistoryModal
        rule={selectedHistoryRule}
        onClose={() => setSelectedHistoryRule(null)}
      />

      <DeleteAutomationModal
        rule={selectedDeleteRule}
        onClose={() => setSelectedDeleteRule(null)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
