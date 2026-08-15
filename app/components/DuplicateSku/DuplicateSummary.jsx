import React from "react";
import { TagIcon, AlertTriangleIcon, ClusterIcon, ShieldCheckIcon } from "./Icons";

export default function DuplicateSummary({ summaryData }) {
  const {
    totalSkusScanned = "1,842",
    lastScanDate = "May 20, 2025",
    duplicateGroups = 18,
    affectingSkusTotal = 96,
    exactDuplicates = 42,
    affectingExactSkus = 42,
    potentialDuplicates = 54,
    affectingPotentialSkus = 54,
  } = summaryData || {};

  const cards = [
    {
      title: "Total SKUs scanned",
      value: totalSkusScanned,
      subtext: `Last scan: ${lastScanDate}`,
      icon: <TagIcon size={18} color="#5B3DF5" />,
      iconBg: "bg-purple-light",
    },
    {
      title: "Duplicate groups",
      value: duplicateGroups,
      subtext: `Affecting ${affectingSkusTotal} SKUs`,
      subtextClass: "text-orange-warning",
      icon: <AlertTriangleIcon size={18} color="#D97706" />,
      iconBg: "bg-orange-light",
    },
    {
      title: "Exact duplicates",
      value: exactDuplicates,
      subtext: `Affecting ${affectingExactSkus} SKUs`,
      subtextClass: "text-red-error",
      icon: <ClusterIcon size={18} color="#DC2626" />,
      iconBg: "bg-red-light",
    },
    {
      title: "Potential duplicates",
      value: potentialDuplicates,
      subtext: `Affecting ${affectingPotentialSkus} SKUs`,
      subtextClass: "text-green-success",
      icon: <ShieldCheckIcon size={18} color="#16A34A" />,
      iconBg: "bg-green-light",
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
