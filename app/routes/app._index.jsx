import { useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/app._index.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

/* ─── Data ──────────────────────────────────────────────────────────── */

const activityData = [
  { date: "May 14", skus: 35 },
  { date: "May 15", skus: 48 },
  { date: "May 16", skus: 130 },
  { date: "May 17", skus: 90 },
  { date: "May 18", skus: 100 },
  { date: "May 19", skus: 158 },
  { date: "May 20", skus: 145 },
];

const recentActivity = [
  { rule: "Daily new products", status: "Completed", products: 12, variants: 18, generated: 30, date: "May 20, 2025 10:30 AM" },
  { rule: "Collection based rule", status: "Completed", products: 8, variants: 24, generated: 32, date: "May 19, 2025 09:15 AM" },
  { rule: "Vendor rule", status: "Completed", products: 15, variants: 27, generated: 42, date: "May 18, 2025 02:46 PM" },
  { rule: "Manual run", status: "Failed", products: 5, variants: 8, generated: "—", date: "May 17, 2025 11:20 AM" },
  // { rule: "Gift cards update", status: "Completed", products: 3, variants: 3, generated: 6, date: "May 16, 2025 08:10 AM" },
];

/* ─── Icons ─────────────────────────────────────────────────────────── */

const WandIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" />
  </svg>
);
const HistoryIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </svg>
);
const BoxIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const HexIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
  </svg>
);
const ClipboardIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
const AutoIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const DuplicateIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const RulesIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const SortDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><polyline points="5 12 12 19 19 12" />
  </svg>
);

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function Index() {
  const [timeRange] = useState("Last 7 days");

  return (
    <div className="dashboard-root">
      <div className="dashboard-inner">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Overview of your SKU generation performance</p>
          </div>
          <button className="btn-generate">
            <WandIcon size={15} /> Generate SKUs
          </button>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="stat-grid">
          {[
            {
              label: "Credits used",
              icon: <ClipboardIcon />,
              iconClass: "icon-purple",
              valueNode: (
                <>
                  <span className="stat-value">40</span>
                  <span className="stat-value-suffix">/ 100</span>
                </>
              ),
              sub: "Resets on May 20, 2025",
            },
            {
              label: "Total products",
              icon: <BoxIcon />,
              iconClass: "icon-green",
              valueNode: <span className="stat-value">78</span>,
              sub: "In your store",
            },
            {
              label: "Total variants",
              icon: <HexIcon />,
              iconClass: "icon-orange",
              valueNode: <span className="stat-value">93</span>,
              sub: "Across all products",
            },
            {
              label: "SKUs generated",
              icon: <ClipboardIcon />,
              iconClass: "icon-purple",
              valueNode: <span className="stat-value">1,245</span>,
              sub: "All time",
            },
          ].map(({ label, icon, iconClass, valueNode, sub }) => (
            <div key={label} className="card stat-card">
              <div className="stat-card-header">
                <span className="stat-label">{label}</span>
                <div className={`stat-icon ${iconClass}`}>{icon}</div>
              </div>
              <div className="stat-value-row">{valueNode}</div>
              <div className="stat-label">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Middle Row ─────────────────────────────────────────── */}
        <div className="middle-grid">

          {/* Chart */}
          <div className="card chart-card">
            <div className="chart-header">
              <span className="section-title">Generation trend</span>
              <button className="btn-time-range">
                {timeRange} <ChevronDown />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={activityData} margin={{ top: 5, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7b6ef6" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#7b6ef6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke="#f0f0f7" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11.5, fill: "#c0c0cc" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11.5, fill: "#c0c0cc" }} axisLine={false} tickLine={false} ticks={[0, 50, 100, 150, 200]} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", fontSize: 12.5 }}
                  formatter={(v) => [v, "SKUs"]}
                  cursor={{ stroke: "#e0dff8", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="skus" stroke="#7b6ef6" strokeWidth={2.5}
                  fill="url(#g1)" dot={false} activeDot={{ r: 5, fill: "#7b6ef6", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="card quick-actions-card">
            <div className="section-title" style={{ marginBottom: 6 }}>Quick actions</div>
            {[
              { icon: <WandIcon size={20} />, iconClass: "icon-purple", title: "Generate SKUs", desc: "Create new SKU rules" },
              { icon: <HistoryIcon size={20} />, iconClass: "icon-purple", title: "View history", desc: "Track all generated SKUs" },
              { icon: <AutoIcon size={20} />, iconClass: "icon-purple", title: "Automations", desc: "Manage automated rules" },
              { icon: <DuplicateIcon size={20} />, iconClass: "icon-purple", title: "Duplicate SKUs", desc: "Find and resolve duplicates" },
            ].map(({ icon, iconClass, title, desc }, i, arr) => (
              <div
                key={title}
                className={`quick-action-item${i < arr.length - 1 ? " border-bottom-light" : ""}`}
              >
                <div className={`action-icon ${iconClass}`}>{icon}</div>
                <div>
                  <div className="action-title">{title}</div>
                  <div className="action-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Row ─────────────────────────────────────────── */}
        <div className="bottom-grid">

          {/* Recent Activity */}
          <div className="card activity-card">
            <div className="section-title" style={{ marginBottom: 16 }}>Recent activity</div>
            <table className="activity-table">
              <thead className="activity-thead">
                <tr>
                  {[
                    { label: "Rule name" },
                    { label: "Status" },
                    { label: "Products" },
                    { label: "Variants" },
                    { label: "Generated" },
                    { label: "Date" },
                  ].map(({ label }) => (
                    <th key={label}>
                      <span className="th-inner">{label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row, i) => (
                  <tr key={i}>
                    <td className="td-rule">{row.rule}</td>
                    <td>
                      <span className={`status-badge ${row.status === "Completed" ? "status-completed" : "status-failed"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="td-number">{row.products}</td>
                    <td className="td-number">{row.variants}</td>
                    <td className="td-number">{row.generated}</td>
                    <td className="td-date">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href="#" className="link-view-all">
              View all history <ArrowRight />
            </a>
          </div>

          {/* Recommended */}
          <div className="card recommended-card">
            <div className="section-title" style={{ marginBottom: 6 }}>Recommended for you</div>
            {[
              { icon: <AutoIcon size={20} />, iconClass: "icon-purple", title: "Automated SKU", desc: "Auto generate SKUs for new products", cta: "Set up" },
              { icon: <DuplicateIcon size={20} />, iconClass: "icon-purple", title: "Duplicate scanner", desc: "Find and fix duplicate SKUs", cta: "Scan now" },
              { icon: <RulesIcon size={20} />, iconClass: "icon-green", title: "Custom rules", desc: "Create advanced rules", cta: "Explore" },
            ].map(({ icon, iconClass, title, desc, cta }, i, arr) => (
              <div
                key={title}
                className={`recommended-item${i < arr.length - 1 ? " border-bottom-light" : ""}`}
              >
                <div className={`action-icon ${iconClass}`}>{icon}</div>
                <div>
                  <div className="recommended-title">{title}</div>
                  <div className="recommended-desc">{desc}</div>
                  <a href="#" className="link-cta">{cta} <ArrowRight /></a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};