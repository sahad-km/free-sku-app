import React from "react";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getDashboardData } from "../services/dashboard.server";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import StatCard from "../components/Dashboard/StatCard";
import GenerationTrend from "../components/Dashboard/GenerationTrend";
import QuickActions from "../components/Dashboard/QuickActions";
import RecentActivity from "../components/Dashboard/RecentActivity";
import RecommendationCard from "../components/Dashboard/RecommendationCard";
import {
  quickActionsData,
  recommendationsData,
} from "../components/Dashboard/mockData";
import "../styles/app._index.css";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const data = await getDashboardData({ admin, session });
  return data;
};

export default function DashboardPage() {
  const loaderData = useLoaderData() || {};
  const {
    kpiData = [],
    chartData = [],
    recentActivityData = [],
  } = loaderData;

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