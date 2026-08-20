import React from "react";
import { ChatBubbleIcon, ArrowRightIcon, ExternalLinkIcon } from "./Icons";

export default function SupportSidebarCards({ onContactSupport, onContactSales }) {
  return (
    <div className="pricing-support-sidebar">
      {/* Card 1: Not sure which plan is right for you? */}
      <div className="card pricing-support-card">
        <div className="support-card-header">
          <div className="support-icon-circle">
            <ChatBubbleIcon size={22} color="#5B3DF5" />
          </div>
          <div className="support-header-text">
            <h4 className="support-card-title-purple">Not sure which plan is right for you?</h4>
            <p className="support-card-desc">
              Our team is here to help you choose the best plan for your store.
            </p>
          </div>
        </div>

        <div className="support-btn-wrapper">
          <button
            className="btn-support-action"
            onClick={onContactSupport}
            type="button"
          >
            <span>Contact support</span>
            <ArrowRightIcon size={14} color="#5B3DF5" />
          </button>
        </div>
      </div>

      {/* Card 2: Need a custom solution? */}
      <div className="card pricing-support-card custom-solution-card">
        <div className="custom-solution-flex">
          <div className="custom-text-content">
            <h4 className="custom-card-title">Need a custom solution?</h4>
            <p className="custom-card-desc">
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

          <div className="briefcase-illustration-wrapper">
            <div className="briefcase-bg-circle">
              <svg width="68" height="68" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="20" width="48" height="34" rx="8" fill="url(#briefcaseGrad)" />
                <path d="M22 20V14C22 11.7909 23.7909 10 26 10H38C40.2091 10 42 11.7909 42 14V20" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
                <rect x="26" y="30" width="12" height="8" rx="2" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="briefcaseGrad" x1="8" y1="20" x2="56" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#6D28D9" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="sparkle-top-right">✦</span>
              <span className="sparkle-bottom-right">✧</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
