import React from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import StatCard from "../components/Dashboard/StatCard";
import GenerationTrend from "../components/Dashboard/GenerationTrend";
import QuickActions from "../components/Dashboard/QuickActions";
import RecentActivity from "../components/Dashboard/RecentActivity";
import RecommendationCard from "../components/Dashboard/RecommendationCard";
import {
  kpiData,
  chartData,
  quickActionsData,
  recentActivityData,
  recommendationsData,
} from "../components/Dashboard/mockData";
import "../styles/app._index.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function DashboardPage() {
  return (
    <div className="dashboard-root">
      <div className="dashboard-inner">
        <DashboardHeader />

        {/* ── Section 1: KPI Cards ────────────────────────────────────── */}
        <div className="stat-grid">
          {kpiData.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </div>

        {/* ── Section 2 & 3: Generation Trend + Quick Actions ─────────── */}
        <div className="middle-grid">
          <GenerationTrend data={chartData} />
          <QuickActions items={quickActionsData} />
        </div>

        {/* ── Section 4 & 5: Recent Activity + Recommended For You ───── */}
        <div className="bottom-grid">
          <RecentActivity items={recentActivityData} />
          <RecommendationCard items={recommendationsData} />
        </div>
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};