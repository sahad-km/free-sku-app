import React, { useState } from "react";
import {
  BoxIcon,
  FolderIcon,
  BagIcon,
  TagIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  StackCoinsIcon,
  RefreshIcon,
  InfoIcon,
  CheckIcon,
  ArrowRightIcon,
} from "./Icons";

export default function ScopeStepSection({
  selection = { type: "ALL_PRODUCTS" },
  onApplySelection,
  scopeCounts = {
    totalProducts: 78,
    totalVariants: 93,
    variantsWithSku: 45,
    variantsWithoutSku: 48,
    estimatedCredits: 93,
  },
  creditsAvailable = 100,
  isLoadingCounts = false,
  onRefreshCounts,
  onNext,
  onBack,
}) {
  const [tagInput, setTagInput] = useState(selection.tag || "");

  const handlePickResource = async (targetType) => {
    if (typeof window !== "undefined" && window.shopify && window.shopify.resourcePicker) {
      try {
        const pickerType =
          targetType === "COLLECTIONS" ? "collection" : targetType === "PRODUCTS" ? "product" : "variant";
        const res = await window.shopify.resourcePicker({ type: pickerType, multiple: true });

        if (res && res.length > 0) {
          const gids = res.map((r) => r.id);
          if (targetType === "COLLECTIONS") onApplySelection({ type: "COLLECTIONS", collectionIds: gids });
          if (targetType === "PRODUCTS") onApplySelection({ type: "PRODUCTS", productIds: gids });
          if (targetType === "VARIANTS") onApplySelection({ type: "VARIANTS", variantIds: gids });
        }
      } catch (err) {
        console.warn("Resource picker dismissed/error:", err.message);
      }
    } else {
      // Development mode fallback simulation
      if (targetType === "COLLECTIONS") {
        onApplySelection({ type: "COLLECTIONS", collectionIds: ["gid://shopify/Collection/123"] });
      } else if (targetType === "PRODUCTS") {
        onApplySelection({ type: "PRODUCTS", productIds: ["gid://shopify/Product/123"] });
      } else if (targetType === "VARIANTS") {
        onApplySelection({ type: "VARIANTS", variantIds: ["gid://shopify/ProductVariant/123"] });
      }
    }
  };

  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    onApplySelection({ type: "TAG", tag: tagInput.trim() });
  };

  const activeMode = selection.type || "ALL_PRODUCTS";

  return (
    <div className="card form-section-card" style={{ padding: "24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
      {/* ── Section Title & Subtitle ────────────────────────────────────────── */}
      <div className="section-header" style={{ marginBottom: "24px" }}>
        <h2 className="section-title" style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
          Step 2: Select Scope
        </h2>
        <p className="section-subtitle" style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px", margin: 0 }}>
          Choose which products and variants this SKU rule will apply to.
        </p>
      </div>

      {/* ── 5 Scope Selection Cards Grid ───────────────────────────────────── */}
      <div
        className="scope-options-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr) 1.25fr",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {/* Card 1: All Products */}
        <div
          onClick={() => onApplySelection({ type: "ALL_PRODUCTS" })}
          style={{
            position: "relative",
            border: activeMode === "ALL_PRODUCTS" ? "2px solid #5B3DF5" : "1px solid #E5E7EB",
            backgroundColor: activeMode === "ALL_PRODUCTS" ? "#F5F3FF" : "#FFFFFF",
            borderRadius: "12px",
            padding: "20px 16px",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: activeMode === "ALL_PRODUCTS" ? "0 4px 12px rgba(91, 61, 245, 0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {activeMode === "ALL_PRODUCTS" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#5B3DF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={12} color="#FFFFFF" />
            </div>
          )}

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#EDE9FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <BoxIcon size={22} color="#5B3DF5" />
          </div>

          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 6px 0" }}>
            All Products
          </h3>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.4" }}>
            Apply this rule to all products and variants in your store.
          </p>
        </div>

        {/* Card 2: Collections */}
        <div
          onClick={() => handlePickResource("COLLECTIONS")}
          style={{
            position: "relative",
            border: activeMode === "COLLECTIONS" ? "2px solid #5B3DF5" : "1px solid #E5E7EB",
            backgroundColor: activeMode === "COLLECTIONS" ? "#F5F3FF" : "#FFFFFF",
            borderRadius: "12px",
            padding: "20px 16px",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: activeMode === "COLLECTIONS" ? "0 4px 12px rgba(91, 61, 245, 0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {activeMode === "COLLECTIONS" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#5B3DF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={12} color="#FFFFFF" />
            </div>
          )}

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <FolderIcon size={22} color="#D97706" />
          </div>

          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 6px 0" }}>
            Collections
          </h3>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.4" }}>
            {activeMode === "COLLECTIONS" && selection.collectionIds?.length > 0
              ? `${selection.collectionIds.length} Collection(s) Selected`
              : "Select one or more Shopify collections using the Resource Picker."}
          </p>
        </div>

        {/* Card 3: Choose Products */}
        <div
          onClick={() => handlePickResource("PRODUCTS")}
          style={{
            position: "relative",
            border: activeMode === "PRODUCTS" ? "2px solid #5B3DF5" : "1px solid #E5E7EB",
            backgroundColor: activeMode === "PRODUCTS" ? "#F5F3FF" : "#FFFFFF",
            borderRadius: "12px",
            padding: "20px 16px",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: activeMode === "PRODUCTS" ? "0 4px 12px rgba(91, 61, 245, 0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {activeMode === "PRODUCTS" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#5B3DF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={12} color="#FFFFFF" />
            </div>
          )}

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#D1FAE5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <BagIcon size={22} color="#059669" />
          </div>

          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 6px 0" }}>
            Choose Products
          </h3>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.4" }}>
            {activeMode === "PRODUCTS" && selection.productIds?.length > 0
              ? `${selection.productIds.length} Product(s) Selected`
              : "Pick specific products to apply SKUs using the Resource Picker."}
          </p>
        </div>

        {/* Card 4: Choose Variants */}
        <div
          onClick={() => handlePickResource("VARIANTS")}
          style={{
            position: "relative",
            border: activeMode === "VARIANTS" ? "2px solid #5B3DF5" : "1px solid #E5E7EB",
            backgroundColor: activeMode === "VARIANTS" ? "#F5F3FF" : "#FFFFFF",
            borderRadius: "12px",
            padding: "20px 16px",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: activeMode === "VARIANTS" ? "0 4px 12px rgba(91, 61, 245, 0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {activeMode === "VARIANTS" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#5B3DF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={12} color="#FFFFFF" />
            </div>
          )}

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#DBEAFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <TagIcon size={22} color="#2563EB" />
          </div>

          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 6px 0" }}>
            Choose Variants
          </h3>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.4" }}>
            {activeMode === "VARIANTS" && selection.variantIds?.length > 0
              ? `${selection.variantIds.length} Variant(s) Selected`
              : "Pick specific variants to target individually."}
          </p>
        </div>

        {/* Card 5: Choose Product Tag (Optional) */}
        <div
          style={{
            position: "relative",
            border: activeMode === "TAG" ? "2px solid #5B3DF5" : "1px solid #E5E7EB",
            backgroundColor: activeMode === "TAG" ? "#F5F3FF" : "#FFFFFF",
            borderRadius: "12px",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: activeMode === "TAG" ? "0 4px 12px rgba(91, 61, 245, 0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {activeMode === "TAG" && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#5B3DF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={12} color="#FFFFFF" />
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#EDE9FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TagIcon size={16} color="#5B3DF5" />
              </div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: 0 }}>
                Choose Product Tag (Optional)
              </h3>
            </div>

            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 12px 0", lineHeight: "1.4" }}>
              Enter a product tag to target products with this tag.
            </p>
          </div>

          <form onSubmit={handleTagSubmit} style={{ marginTop: "8px" }}>
            <input
              type="text"
              className="text-input"
              placeholder="Enter product tag (e.g. summer, new-arrival)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "1px solid #D1D5DB",
                marginBottom: "8px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#5B3DF5",
                  color: "#FFFFFF",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Set Tag
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Scope Summary Section ──────────────────────────────────────────── */}
      <div
        className="scope-summary-container"
        style={{
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        {/* Scope Summary Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
              Scope Summary
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px", margin: 0 }}>
              Live count of products and variants that match your selected scope.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshCounts}
            disabled={isLoadingCounts}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              color: "#5B3DF5",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <RefreshIcon size={14} color="#5B3DF5" />
            <span>{isLoadingCounts ? "Refreshing..." : "Refresh Counts"}</span>
          </button>
        </div>

        {/* 5 Live Metric Cards Grid */}
        <div
          className="metrics-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {/* Metric 1: Products */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#F3E8FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BoxIcon size={18} color="#5B3DF5" />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#6B7280", display: "block" }}>Products</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                {isLoadingCounts ? "..." : scopeCounts.totalProducts}
              </span>
            </div>
          </div>

          {/* Metric 2: Variants */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TagIcon size={18} color="#2563EB" />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#6B7280", display: "block" }}>Variants</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                {isLoadingCounts ? "..." : scopeCounts.totalVariants}
              </span>
            </div>
          </div>

          {/* Metric 3: Variants with SKU */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#D1FAE5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircleIcon size={18} color="#059669" />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#6B7280", display: "block" }}>Variants with SKU</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                {isLoadingCounts ? "..." : scopeCounts.variantsWithSku ?? 45}
              </span>
            </div>
          </div>

          {/* Metric 4: Variants without SKU */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
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
              <MinusCircleIcon size={18} color="#D97706" />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#6B7280", display: "block" }}>Variants without SKU</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                {isLoadingCounts ? "..." : scopeCounts.variantsWithoutSku ?? 48}
              </span>
            </div>
          </div>

          {/* Metric 5: Credits Required */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#EDE9FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <StackCoinsIcon size={18} color="#5B3DF5" />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#6B7280", display: "block" }}>Credits Required</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#111827", lineHeight: "1" }}>
                {isLoadingCounts ? "..." : scopeCounts.estimatedCredits}
              </span>
              <span style={{ fontSize: "10px", color: "#9CA3AF", display: "block", marginTop: "2px" }}>
                1 credit per variant
              </span>
            </div>
          </div>
        </div>

        {/* Live Data Info Banner */}
        <div
          style={{
            backgroundColor: "#F5F3FF",
            border: "1px solid #DDD6FE",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <InfoIcon size={16} color="#5B3DF5" />
          <span style={{ fontSize: "13px", color: "#4C1D95", fontWeight: 500 }}>
            Counts are live and may change if products or variants are updated in your store.
          </span>
        </div>
      </div>

      {/* ── Bottom Action Navigation Bar ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "16px",
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            color: "#374151",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back to Configure Rule
        </button>

        <button
          className="btn-next-step"
          type="button"
          onClick={onNext}
        >
          <span>Next: Preview & Confirm</span>
          <ArrowRightIcon size={14} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}
