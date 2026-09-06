import React, { useState, useEffect } from "react";

const SHOPIFY_APP_STORE_URL = "https://apps.shopify.com/sku-bulk-generator#modal-show=WriteReviewModal";
const SUPPORT_EMAIL = "catalystcreationapps@gmail.com";

// ── Clean Professional SVG Icons (No Emojis) ─────────────────────────────────
function StarIcon({ size = 16, color = "#F59E0B" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MailIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 13, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CloseIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Reusable Review & Feedback Banner Card
 */
export default function ReviewBanner({
  variant = "card", // "card" | "compact" | "celebration" | "footer"
  title,
  description,
  dismissible = true,
  storageKey = "sku_review_banner_dismissed",
}) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!dismissible) {
      setIsDismissed(false);
      return;
    }
    try {
      const dismissed = localStorage.getItem(storageKey);
      setIsDismissed(dismissed === "true");
    } catch {
      setIsDismissed(false);
    }
  }, [dismissible, storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Ignore storage errors
    }
  };

  if (isDismissed) return null;

  // ── 1. Celebration Variant (Used after successful SKU generation) ─────────
  if (variant === "celebration") {
    return (
      <div
        style={{
          marginTop: "16px",
          padding: "16px",
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          textAlign: "left",
          position: "relative",
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <StarIcon size={20} color="#D97706" />
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {title || "Saved you time? Help us keep this app free!"}
            </h4>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "12.5px",
                color: "#4B5563",
                lineHeight: "1.4",
              }}
            >
              {description ||
                "A quick 5-star review on the Shopify App Store makes a huge difference for our team."}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href={SHOPIFY_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  backgroundColor: "#5B3DF5",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  textDecoration: "none",
                  boxShadow: "0 1px 2px rgba(91, 61, 245, 0.2)",
                }}
              >
                <StarIcon size={13} color="#FFFFFF" />
                <span>Rate on Shopify</span>
                <ExternalLinkIcon size={11} color="#FFFFFF" />
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=SKU%20Bulk%20Generator%20Feedback`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 10px",
                  backgroundColor: "#FFFFFF",
                  color: "#4B5563",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "6px",
                  border: "1px solid #D1D5DB",
                  textDecoration: "none",
                }}
              >
                <MailIcon size={12} color="#6B7280" />
                <span>Suggestions / Issue?</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Main Dashboard & Page Card Variant ─────────────────────────────────
  return (
    <div
      style={{
        // marginTop: "12px",
        // marginBottom: "16px",
        padding: "16px 20px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", maxWidth: "720px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            backgroundColor: "#FEF3C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <StarIcon size={20} color="#D97706" />
        </div>
        <div>
          <h4
            style={{
              margin: "0 0 2px 0",
              fontSize: "14.5px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {title || "Enjoying Free SKU Generator?"}
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#6B7280",
              lineHeight: "1.4",
            }}
          >
            {description ||
              "If our app helps manage your inventory, please consider rating us on Shopify. Have questions or ideas? Email our support team anytime."}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <a
          href={SHOPIFY_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 14px",
            backgroundColor: "#5B3DF5",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "7px",
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(91, 61, 245, 0.15)",
          }}
        >
          <StarIcon size={14} color="#FFFFFF" />
          <span>Rate on Shopify</span>
          <ExternalLinkIcon size={12} color="#FFFFFF" />
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=SKU%20Bulk%20Generator%20Feedback`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 12px",
            backgroundColor: "#FFFFFF",
            color: "#374151",
            fontSize: "13px",
            fontWeight: 500,
            borderRadius: "7px",
            border: "1px solid #D1D5DB",
            textDecoration: "none",
          }}
        >
          <MailIcon size={14} color="#6B7280" />
          <span>Support & Ideas</span>
        </a>

        {dismissible && (
          <button
            onClick={handleDismiss}
            style={{
              background: "transparent",
              border: "none",
              color: "#9CA3AF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "4px",
            }}
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <CloseIcon size={15} color="#9CA3AF" />
          </button>
        )}
      </div>
    </div>
  );
}
