import React from "react";
import { BotIcon, CheckCircleIcon, DocumentIcon, ClockIcon } from "./Icons";

export default function AutomationSummary({ summaryData }) {
  const {
    activeRules = 5,
    totalRulesLimit = 8,
    productsAutomatedThisMonth = "1,248",
    skusGeneratedThisMonth = "2,396",
    lastRunDate = "May 20, 2025",
    lastRunTime = "10:30 AM",
  } = summaryData || {};

  const cards = [
    {
      title: "Active rules",
      value: activeRules,
      subtext: `of ${totalRulesLimit} total rules`,
      icon: <BotIcon size={18} color="#5B3DF5" />,
      iconBg: "bg-purple-light",
    },
    {
      title: "Products automated",
      value: productsAutomatedThisMonth,
      subtext: "This month",
      icon: <CheckCircleIcon size={18} color="#16A34A" />,
      iconBg: "bg-green-light",
    },
    {
      title: "SKUs generated",
      value: skusGeneratedThisMonth,
      subtext: "This month",
      icon: <DocumentIcon size={18} color="#2563EB" />,
      iconBg: "bg-blue-light",
    },
    {
      title: "Last run",
      value: lastRunDate,
      subtext: lastRunTime,
      icon: <ClockIcon size={18} color="#EA580C" />,
      iconBg: "bg-orange-light",
    },
  ];

  return (
    <div className="auto-summary-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="card auto-summary-card">
          <div className="auto-summary-top">
            <div className={`auto-summary-icon ${card.iconBg}`}>
              {card.icon}
            </div>
            <div className="auto-summary-title">{card.title}</div>
          </div>
          <div className="auto-summary-val">{card.value}</div>
          <div className="auto-summary-sub">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
