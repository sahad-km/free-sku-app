import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDownIcon } from "./Icons";

export default function GenerationTrend({ data, chartData7, chartData30 }) {
  const [period, setPeriod] = useState("7"); // "7" or "30"

  const displayData = useMemo(() => {
    if (period === "30") {
      return chartData30 || data || [];
    }
    return chartData7 || data || [];
  }, [period, chartData7, chartData30, data]);

  // Dynamic max value calculation for user data
  const maxSkus = useMemo(() => {
    if (!displayData || displayData.length === 0) return 0;
    return Math.max(...displayData.map((d) => d.skus || 0), 0);
  }, [displayData]);

  // Compute upper limit with headroom so top Y-axis label is always bigger than user max data
  const yUpper = useMemo(() => {
    if (maxSkus === 0) return 10;
    // Add 25% headroom above highest user data point
    const padded = Math.ceil(maxSkus * 1.25);

    if (padded <= 10) return 10;
    if (padded <= 20) return Math.ceil(padded / 5) * 5;
    if (padded <= 100) return Math.ceil(padded / 10) * 10;
    if (padded <= 500) return Math.ceil(padded / 50) * 50;
    return Math.ceil(padded / 100) * 100;
  }, [maxSkus]);

  // Build 5 evenly spaced ticks on Y-axis
  const yTicks = useMemo(() => {
    const step = yUpper / 4;
    return [
      0,
      Math.round(step),
      Math.round(step * 2),
      Math.round(step * 3),
      yUpper,
    ];
  }, [yUpper]);

  return (
    <div className="card chart-card">
      <div className="chart-card-header">
        <h2 className="card-section-title">Generation trend</h2>
        <div className="period-selector-dropdown">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select-input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <ChevronDownIcon size={14} color="#6B7280" />
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={displayData}
            margin={{ top: 16, right: 16, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="purpleTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B3DF5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#5B3DF5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 400 }}
              dy={8}
              interval={period === "30" ? 4 : 0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 400 }}
              ticks={yTicks}
              domain={[0, yUpper]}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 4px 12px rgba(16, 24, 40, 0.08)",
                fontSize: "13px",
                fontWeight: 600,
                color: "#111827",
                padding: "8px 12px",
              }}
              formatter={(value) => [`${value} SKUs`, "Generated"]}
              cursor={{ stroke: "#DDD6FE", strokeWidth: 1.5, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="skus"
              stroke="#5B3DF5"
              strokeWidth={2.5}
              fill="url(#purpleTrendGradient)"
              dot={{
                r: 4,
                fill: "#5B3DF5",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#5B3DF5",
                stroke: "#FFFFFF",
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
