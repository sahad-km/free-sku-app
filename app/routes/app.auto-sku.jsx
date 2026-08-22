import React, { useState, useMemo, useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getAutomationRules } from "../services/sku/automatedSkuService.server";
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
import { useToast } from "../components/Common/Toast";
import "../styles/app.auto-sku.css";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  try {
    const data = await getAutomationRules({ shopDomain });
    return {
      rules: data.rules || [],
      summary: data.summary || {
        activeRules: 0,
        totalRules: 0,
        totalGenerated: 0,
        lastRunDate: "Never",
        lastRunTime: "--",
      },
    };
  } catch (err) {
    console.warn("Loader Automated SKU warning:", err.message);
    return {
      rules: [],
      summary: {
        activeRules: 0,
        totalRules: 0,
        totalGenerated: 0,
        lastRunDate: "Never",
        lastRunTime: "--",
      },
    };
  }
};

export default function AutoSkuPage() {
  const loaderData = useLoaderData() || {};
  const revalidator = useRevalidator();
  const { showToast } = useToast();

  // ─── Data State ───────────────────────────────────────────────────────
  const [rules, setRules] = useState(loaderData.rules || []);
  const [summaryData, setSummaryData] = useState(loaderData.summary || {});

  useEffect(() => {
    setRules(loaderData.rules || []);
    setSummaryData(loaderData.summary || {});
  }, [loaderData]);

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
      if (activeTab === "Active" && r.status !== "Active") return false;
      if (activeTab === "Paused" && r.status !== "Paused") return false;
      if (activeTab === "Drafts" && r.status !== "Draft") return false;

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
  const handleToggleStatus = async (rule) => {
    try {
      const res = await fetch("/api/automated-sku", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "toggle-status",
          ruleId: rule.id,
        }),
      });

      if (res.ok) {
        revalidator.revalidate();
      }
    } catch (err) {
      console.warn("Failed to toggle rule status:", err.message);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setIsCreateModalOpen(true);
  };

  const handleSaveRule = async (savedRule) => {
    try {
      const isEdit = Boolean(editingRule && editingRule.id);
      const method = isEdit ? "PATCH" : "POST";

      const payload = isEdit
        ? {
            ruleId: editingRule.id,
            updateData: {
              name: savedRule.name,
              description: savedRule.description,
              trigger: savedRule.trigger,
              scope: savedRule.scope,
              skuConfiguration: savedRule.config,
            },
          }
        : {
            name: savedRule.name,
            description: savedRule.description,
            trigger: savedRule.trigger,
            scope: savedRule.scope,
            skuConfiguration: savedRule.config,
          };

      const res = await fetch("/api/automated-sku", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        revalidator.revalidate();
      }
    } catch (err) {
      console.warn("Failed to save automation rule:", err.message);
    }
  };

  const handleRunNowConfirm = async (rule) => {
    try {
      setSelectedRunNowRule(null);
      const res = await fetch("/api/automated-sku", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "run-now",
          ruleId: rule.id,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        showToast(`Automation "${rule.name}" executed! Generated ${resJson.totalGenerated || 0} SKUs.`, "success");
        revalidator.revalidate();
      } else {
        showToast(resJson.error || "Failed to trigger rule", "warning");
      }
    } catch (err) {
      console.warn("Failed to trigger rule now:", err.message);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      setSelectedDeleteRule(null);
      const res = await fetch("/api/automated-sku", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId: id }),
      });

      if (res.ok) {
        revalidator.revalidate();
      }
    } catch (err) {
      console.warn("Failed to delete automation rule:", err.message);
    }
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
              onDuplicateRule={(r) => handleOpenEditModal({ ...r, id: null, name: `${r.name} Copy` })}
              onRunNow={(r) => setSelectedRunNowRule(r)}
              onViewHistory={(r) => setSelectedHistoryRule(r)}
              onDeleteRule={(r) => setSelectedDeleteRule(r)}
            />
          </div>

          {/* Right Column: How it works & Tips Sidebar */}
          <HowItWorksSidebar onCreateNewRule={handleOpenCreateModal} />
        </div>
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
