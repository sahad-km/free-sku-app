import React from "react";
import { BotIcon, CheckCircleIcon, DocumentIcon, ClockIcon } from "./Icons";

export default function AutomationSummary({ summaryData }) {
  const {
    activeRules = 0,
    totalRules = 0,
    productsAutomatedThisMonth = 0,
    skusGeneratedThisMonth = 0,
    lastRunDate = "Never",
    lastRunTime = "--",
  } = summaryData || {};

  const cards = [
    {
      title: "Active rules",
      value: activeRules,
      subtext: `of ${totalRules} total rules`,
      icon: <BotIcon size={18} color="#5B3DF5" />,
      iconBg: "bg-purple-light",
    },
    {
      title: "Products automated",
      value: Number(productsAutomatedThisMonth).toLocaleString(),
      subtext: "This month",
      icon: <CheckCircleIcon size={18} color="#16A34A" />,
      iconBg: "bg-green-light",
    },
    {
      title: "SKUs generated",
      value: Number(skusGeneratedThisMonth).toLocaleString(),
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
