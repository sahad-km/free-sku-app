import React from "react";
import { LightbulbIcon, CheckCircleIcon, ClockIcon, TagIcon, SettingsGearIcon } from "./Icons";

export default function HowItWorksSidebar({ onCreateNewRule }) {
  return (
    <div className="how-it-works-sidebar">
      {/* Card 1: How automated SKU works */}
      <div className="card sidebar-card how-it-works-card">
        <div className="how-card-header">
          <h3 className="sidebar-card-title">How automated SKU works</h3>
          <div className="how-illustration">
            <SettingsGearIcon size={20} color="#5B3DF5" />
          </div>
        </div>

        <div className="how-steps-list">
          <div className="how-step-item">
            <div className="how-step-num">1</div>
            <div>
              <div className="how-step-title">Create a rule</div>
              <p className="how-step-desc">
                Define how and when SKUs should be generated.
              </p>
            </div>
          </div>

          <div className="how-step-item">
            <div className="how-step-num">2</div>
            <div>
              <div className="how-step-title">Set your scope</div>
              <p className="how-step-desc">
                Choose products, collections, vendors or tags.
              </p>
            </div>
          </div>

          <div className="how-step-item">
            <div className="how-step-num">3</div>
            <div>
              <div className="how-step-title">We handle the rest</div>
              <p className="how-step-desc">
                SKUs are automatically generated for new items.
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn-create-rule-outline"
          onClick={onCreateNewRule}
          type="button"
        >
          Create new rule
        </button>
      </div>

      {/* Card 2: Tips */}
      <div className="card sidebar-card tips-card">
        <div className="tips-header">
          <LightbulbIcon size={18} color="#5B3DF5" />
          <h3 className="sidebar-card-title">Tips</h3>
        </div>

        <div className="tips-list">
          <div className="tip-item">
            <div className="tip-icon-box bg-green-light">
              <CheckCircleIcon size={14} color="#16A34A" />
            </div>
            <div>
              <div className="tip-title">Use collection based rules</div>
              <p className="tip-desc">
                Perfect for managing SKUs for seasonal collections.
              </p>
            </div>
          </div>

          <div className="tip-item">
            <div className="tip-icon-box bg-orange-light">
              <ClockIcon size={14} color="#EA580C" />
            </div>
            <div>
              <div className="tip-title">Schedule rules</div>
              <p className="tip-desc">
                Run rules at specific times to match your workflow.
              </p>
            </div>
          </div>

          <div className="tip-item">
            <div className="tip-icon-box bg-blue-light">
              <TagIcon size={14} color="#2563EB" />
            </div>
            <div>
              <div className="tip-title">Use tags for flexibility</div>
              <p className="tip-desc">
                Tag products and create rules based on those tags.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
