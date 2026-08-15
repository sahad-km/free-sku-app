import React from "react";
import { DocumentIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon } from "./Icons";

export default function HistorySummary({ summaryData }) {
  const {
    totalExecuted = 24,
    successful = 21,
    successRate = "87.5%",
    failed = 3,
    failureRate = "12.5%",
    lastExecutionDate = "May 20, 2025",
    lastExecutionTime = "10:30 AM",
  } = summaryData || {};

  const cards = [
    {
      title: "Total rules executed",
      value: totalExecuted,
      subtext: "All time",
      icon: <DocumentIcon size={18} color="#5B3DF5" />,
      iconBg: "bg-purple-light",
    },
    {
      title: "Successful",
      value: successful,
      subtext: `${successRate} success rate`,
      subtextClass: "text-green-success",
      icon: <CheckCircleIcon size={18} color="#16A34A" />,
      iconBg: "bg-green-light",
    },
    {
      title: "Failed",
      value: failed,
      subtext: `${failureRate} failure rate`,
      subtextClass: "text-orange-warning",
      icon: <AlertTriangleIcon size={18} color="#D97706" />,
      iconBg: "bg-orange-light",
    },
    {
      title: "Last execution",
      value: lastExecutionDate,
      subtext: lastExecutionTime,
      icon: <ClockIcon size={18} color="#2563EB" />,
      iconBg: "bg-blue-light",
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="card summary-card">
          <div className="summary-card-header">
            <div className={`summary-icon-box ${card.iconBg}`}>{card.icon}</div>
            <span className="summary-title">{card.title}</span>
          </div>
          <div className="summary-value">{card.value}</div>
          <div className={`summary-subtext ${card.subtextClass || ""}`}>
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
