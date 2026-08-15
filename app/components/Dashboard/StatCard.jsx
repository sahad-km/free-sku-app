import React from "react";
import { WalletIcon, BagIcon, LayersIcon, SparkleIcon } from "./Icons";

export default function StatCard({ item }) {
  const { title, value, suffix, subtext, iconType, progress } = item;

  const renderIcon = () => {
    switch (iconType) {
      case "wallet":
        return <WalletIcon size={20} color="#5B3DF5" />;
      case "bag":
        return <BagIcon size={20} color="#16A34A" />;
      case "layers":
        return <LayersIcon size={20} color="#EA580C" />;
      case "sparkle":
      default:
        return <SparkleIcon size={20} color="#5B3DF5" />;
    }
  };

  const getIconBgClass = () => {
    switch (iconType) {
      case "bag":
        return "icon-box-green";
      case "layers":
        return "icon-box-orange";
      case "wallet":
      case "sparkle":
      default:
        return "icon-box-purple";
    }
  };

  return (
    <div className="card stat-card">
      <div className="stat-card-main-content">
        <div className={`stat-card-icon-box ${getIconBgClass()}`}>
          {renderIcon()}
        </div>

        <div className="stat-card-text-column">
          <span className="stat-card-title">{title}</span>

          <div className="stat-card-value-row">
            <span className={`stat-card-value ${iconType === "wallet" ? "text-purple-val" : ""}`}>
              {value}
            </span>
            {suffix && <span className="stat-card-value-suffix">{suffix}</span>}
          </div>

          <div className="stat-card-subtext">{subtext}</div>
        </div>
      </div>

      {progress !== undefined && (
        <div className="stat-card-progress-track">
          <div
            className="stat-card-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
