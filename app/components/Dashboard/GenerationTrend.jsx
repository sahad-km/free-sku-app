import React, { useState } from "react";
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

export default function GenerationTrend({ data }) {
  const [period, setPeriod] = useState("Last 7 days");

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
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
          </select>
          <ChevronDownIcon size={14} color="#6B7280" />
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
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
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 400 }}
              ticks={[0, 50, 100, 150, 200]}
              domain={[0, 200]}
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
