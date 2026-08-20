import React from "react";
import { TagIcon, AlertTriangleIcon, ClusterIcon, ShieldCheckIcon } from "./Icons";

export default function DuplicateSummary({ summaryData }) {
  const {
    duplicateGroups = 0,
    affectedVariants = 0,
    affectedProducts = 0,
    riskLevel = "Low Risk",
    lastScanDate = "Never",
    lastScanTime = "--",
  } = summaryData || {};

  const cards = [
    {
      title: "Duplicate groups",
      value: Number(duplicateGroups).toLocaleString(),
      subtext: `Affecting ${Number(affectedVariants).toLocaleString()} variants`,
      subtextClass: duplicateGroups > 0 ? "text-orange-warning" : "",
      icon: <AlertTriangleIcon size={18} color="#D97706" />,
      iconBg: "bg-orange-light",
    },
    {
      title: "Affected variants",
      value: Number(affectedVariants).toLocaleString(),
      subtext: `${affectedProducts} products affected`,
      subtextClass: affectedVariants > 0 ? "text-red-error" : "",
      icon: <ClusterIcon size={18} color="#DC2626" />,
      iconBg: "bg-red-light",
    },
    {
      title: "Detection status",
      value: riskLevel,
      subtext: duplicateGroups === 0 ? "No duplicates found" : "Action required",
      subtextClass: duplicateGroups === 0 ? "text-green-success" : "text-orange-warning",
      icon: <ShieldCheckIcon size={18} color="#16A34A" />,
      iconBg: "bg-green-light",
    },
    {
      title: "Last scan",
      value: lastScanDate,
      subtext: lastScanTime,
      icon: <TagIcon size={18} color="#5B3DF5" />,
      iconBg: "bg-purple-light",
    },
  ];

  return (
    <div className="dup-summary-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="card dup-summary-card">
          <div className="dup-summary-top">
            <div className={`dup-summary-icon ${card.iconBg}`}>
              {card.icon}
            </div>
            <div className="dup-summary-title">{card.title}</div>
          </div>
          <div className="dup-summary-val">{card.value}</div>
          <div className={`dup-summary-sub ${card.subtextClass || ""}`}>
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
