import React from "react";
import { useNavigate } from "react-router";
import {
  GenerateSkuIcon,
  HistoryClockIcon,
  AutomationsIcon,
  DuplicateIcon,
  ChevronRightIcon,
} from "./Icons";

export default function QuickActions({ items }) {
  const navigate = useNavigate();

  const renderIcon = (type) => {
    switch (type) {
      case "userWand":
      case "generate":
        return <GenerateSkuIcon size={18} color="#5B3DF5" />;
      case "history":
        return <HistoryClockIcon size={18} color="#5B3DF5" />;
      case "automations":
        return <AutomationsIcon size={18} color="#5B3DF5" />;
      case "duplicate":
        return <DuplicateIcon size={18} color="#5B3DF5" />;
      default:
        return <GenerateSkuIcon size={18} color="#5B3DF5" />;
    }
  };

  return (
    <div className="card quick-actions-card">
      <h2 className="card-section-title">Quick actions</h2>

      <div className="quick-actions-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="quick-action-row"
            onClick={() => navigate(item.route)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(item.route);
              }
            }}
          >
            <div className="quick-action-icon-box">
              {renderIcon(item.iconType)}
            </div>

            <div className="quick-action-content">
              <div className="quick-action-title-row">
                <span className="quick-action-title">{item.title}</span>
                {item.badge && (
                  <span className="pro-pill-badge">{item.badge}</span>
                )}
              </div>
              <p className="quick-action-desc">{item.description}</p>
            </div>

            <div className="quick-action-arrow">
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
