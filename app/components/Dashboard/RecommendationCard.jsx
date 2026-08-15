import React from "react";
import { useNavigate } from "react-router";
import { BotIcon, ScannerIcon, RulesNodesIcon, ArrowRightIcon } from "./Icons";

export default function RecommendationCard({ items }) {
  const navigate = useNavigate();

  const renderIcon = (type) => {
    switch (type) {
      case "bot":
        return <BotIcon size={20} color="#FFFFFF" />;
      case "scanner":
        return <ScannerIcon size={20} color="#FFFFFF" />;
      case "rules":
        return <RulesNodesIcon size={20} color="#FFFFFF" />;
      default:
        return <BotIcon size={20} color="#FFFFFF" />;
    }
  };

  const getThemeClasses = (theme) => {
    switch (theme) {
      case "blue":
        return {
          containerClass: "recommend-box-blue",
          iconBgClass: "bg-solid-blue",
          badgeClass: "badge-blue",
          actionClass: "action-blue",
          iconColor: "#2563EB",
        };
      case "green":
        return {
          containerClass: "recommend-box-green",
          iconBgClass: "bg-solid-green",
          badgeClass: "badge-green",
          actionClass: "action-green",
          iconColor: "#16A34A",
        };
      case "purple":
      default:
        return {
          containerClass: "recommend-box-purple",
          iconBgClass: "bg-solid-purple",
          badgeClass: "badge-purple",
          actionClass: "action-purple",
          iconColor: "#5B3DF5",
        };
    }
  };

  return (
    <div className="card recommended-section-card">
      <h2 className="card-section-title">Recommended for you</h2>

      <div className="recommendations-list">
        {items.map((item) => {
          const theme = getThemeClasses(item.theme);
          return (
            <div
              key={item.id}
              className={`recommendation-item-card ${theme.containerClass}`}
              onClick={() => navigate(item.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(item.route);
                }
              }}
            >
              <div className="recommend-card-content">
                <div className={`recommend-icon-box ${theme.iconBgClass}`}>
                  {renderIcon(item.iconType)}
                </div>

                <div className="recommend-info">
                  <div className="recommend-title-row">
                    <span className="recommend-title">{item.title}</span>
                    {item.badge && (
                      <span className={`recommend-badge ${theme.badgeClass}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="recommend-desc">{item.description}</p>
                  <div className={`recommend-action ${theme.actionClass}`}>
                    <span>{item.actionText}</span>
                    <ArrowRightIcon size={14} color={theme.iconColor} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
