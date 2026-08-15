import React from "react";
import { ChatBubbleIcon, ArrowRightIcon, BriefcaseIcon, ExternalLinkIcon } from "./Icons";

export default function SupportSidebarCards({ onContactSupport, onContactSales }) {
  return (
    <div className="pricing-support-sidebar">
      {/* Card 1: Not sure which plan? */}
      <div className="card pricing-support-card">
        <div className="support-card-header">
          <div className="support-icon-circle bg-purple-light">
            <ChatBubbleIcon size={20} color="#5B3DF5" />
          </div>
          <div>
            <h4 className="support-card-title">Not sure which plan is right for you?</h4>
            <p className="support-card-desc">
              Our team is here to help you choose the best plan for your store.
            </p>
          </div>
        </div>

        <button
          className="btn-support-action"
          onClick={onContactSupport}
          type="button"
        >
          <span>Contact support</span>
          <ArrowRightIcon size={14} color="#5B3DF5" />
        </button>
      </div>

      {/* Card 2: Need a custom solution? */}
      <div className="card pricing-support-card custom-solution-card">
        <div className="custom-solution-flex">
          <div className="custom-text-content">
            <h4 className="support-card-title">Need a custom solution?</h4>
            <p className="support-card-desc">
              We offer tailored solutions for large enterprises with unique requirements.
            </p>

            <button
              className="btn-support-action"
              onClick={onContactSales}
              type="button"
            >
              <span>Contact sales</span>
              <ExternalLinkIcon size={14} color="#5B3DF5" />
            </button>
          </div>

          <div className="briefcase-illustration-box">
            <div className="briefcase-icon-bg">
              <BriefcaseIcon size={28} color="#FFFFFF" />
            </div>
            <span className="sparkle-decoration">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
