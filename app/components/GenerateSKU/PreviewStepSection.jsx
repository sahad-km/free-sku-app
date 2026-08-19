import React, { useState } from "react";
import {
  BoxIcon,
  TagIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  StackCoinsIcon,
  InfoIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "./Icons";
import { generateSkuForVariant } from "../../services/sku/skuGeneratorService";

export default function PreviewStepSection({
  config = {},
  selection = { type: "ALL_PRODUCTS" },
  scopeCounts = {
    totalProducts: 78,
    totalVariants: 93,
    variantsWithSku: 45,
    variantsWithoutSku: 48,
    estimatedCredits: 93,
  },
  creditsAvailable = 100,
  previewProducts = [],
  onBack,
  onConfirmGenerate,
  onOpenRuleSummary,
  isGenerating = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("TITLE_ASC");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock / Sample dataset derived from previewProducts or high-quality default fallback matching design image
  const defaultItems = [
    {
      product: { id: "gid://shopify/Product/1111111", title: "Classic Hoodie", image: "https://cdn.shopify.com/s/files/1/0000/0000/products/hoodie.jpg" },
      variant: { id: "gid://shopify/ProductVariant/2222222", title: "Black / Medium" },
      currentSku: "HOOD-BLK-M",
      rawVariant: { title: "Black / Medium", options: [{ name: "Color", value: "Black" }, { name: "Size", value: "Medium" }] },
      rawProduct: { title: "Classic Hoodie", vendor: "StoreVendor", productType: "Apparel" },
    },
    {
      product: { id: "gid://shopify/Product/1111112", title: "Premium T-Shirt", image: "https://cdn.shopify.com/s/files/1/0000/0000/products/tshirt.jpg" },
      variant: { id: "gid://shopify/ProductVariant/2222223", title: "White / Large" },
      currentSku: "TSH-WHT-L",
      rawVariant: { title: "White / Large", options: [{ name: "Color", value: "White" }, { name: "Size", value: "Large" }] },
      rawProduct: { title: "Premium T-Shirt", vendor: "StoreVendor", productType: "Apparel" },
    },
    {
      product: { id: "gid://shopify/Product/1111113", title: "Denim Jacket", image: "https://cdn.shopify.com/s/files/1/0000/0000/products/jacket.jpg" },
      variant: { id: "gid://shopify/ProductVariant/2222224", title: "Blue / Small" },
      currentSku: "DEN-BLU-S",
      rawVariant: { title: "Blue / Small", options: [{ name: "Color", value: "Blue" }, { name: "Size", value: "Small" }] },
      rawProduct: { title: "Denim Jacket", vendor: "StoreVendor", productType: "Apparel" },
    },
    {
      product: { id: "gid://shopify/Product/1111114", title: "Sneaker Collection", image: "https://cdn.shopify.com/s/files/1/0000/0000/products/sneaker.jpg" },
      variant: { id: "gid://shopify/ProductVariant/2222225", title: "Red / 42" },
      currentSku: null,
      rawVariant: { title: "Red / 42", options: [{ name: "Color", value: "Red" }, { name: "Size", value: "42" }] },
      rawProduct: { title: "Sneaker Collection", vendor: "FootwearVendor", productType: "Shoes" },
    },
    {
      product: { id: "gid://shopify/Product/1111115", title: "Canvas Backpack", image: "https://cdn.shopify.com/s/files/1/0000/0000/products/backpack.jpg" },
      variant: { id: "gid://shopify/ProductVariant/2222226", title: "Black" },
      currentSku: "BAG-BLK",
      rawVariant: { title: "Black", options: [{ name: "Color", value: "Black" }] },
      rawProduct: { title: "Canvas Backpack", vendor: "AccessoryVendor", productType: "Bags" },
    },
  ];

  // Derive preview rows dynamically using canonical generateSkuForVariant
  const rawItems = previewProducts.length > 0
    ? previewProducts.flatMap((p, pIdx) =>
        (p.variants || [{ id: `var_${p.id}`, title: "Default Variant", currentSku: null }]).map((v, vIdx) => ({
          product: { id: p.id || `gid://shopify/Product/100${pIdx}`, title: p.title || "Product", image: p.featuredImage?.url || p.image },
          variant: { id: v.id || `gid://shopify/ProductVariant/200${vIdx}`, title: v.title || "Default" },
          currentSku: v.sku || v.currentSku || null,
          rawVariant: v,
          rawProduct: p,
          index: pIdx * 10 + vIdx,
        }))
      )
    : defaultItems.map((item, index) => ({ ...item, index }));

  // Apply preview SKU calculations securely extracting string sku property
  const tableRows = rawItems.map((item, idx) => {
    const skuResult = generateSkuForVariant({
      product: item.rawProduct,
      variant: item.rawVariant,
      config: config,
      index: idx,
    });

    let previewSkuStr = typeof skuResult === "string" ? skuResult : (skuResult?.sku || "");
    let status = skuResult?.isSkipped ? "Skipped" : "New";

    if (!previewSkuStr || previewSkuStr === "—") {
      const prefixStr = config.prefix || "SKU";
      const numStr = String((config.startNumber || 1) + idx).padStart(config.numberPadding || 4, "0");
      previewSkuStr = `${prefixStr}-${numStr}`;
    }

    if (config.overwriteExisting === false && item.currentSku) {
      status = "Skipped";
    }

    return {
      ...item,
      previewSku: previewSkuStr,
      status,
    };
  });

  // Filter rows by search
  const filteredRows = tableRows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const skuStr = typeof r.previewSku === "string" ? r.previewSku : "";
    return (
      r.product.title.toLowerCase().includes(q) ||
      r.variant.title.toLowerCase().includes(q) ||
      (r.currentSku && r.currentSku.toLowerCase().includes(q)) ||
      skuStr.toLowerCase().includes(q)
    );
  });

  const totalVariantCount = scopeCounts.totalVariants || 93;
  const totalProductCount = scopeCounts.totalProducts || 78;

  return (
    <div className="card form-section-card" style={{ padding: "24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
      {/* ── Section Title & Subtitle + View Rule Summary Button ────────────── */}
      <div
        className="section-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 className="section-title" style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Step 3: Preview & Confirm
          </h2>
          <p className="section-subtitle" style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px", margin: 0 }}>
            Review how SKUs will be generated for your selected products and variants.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRuleSummary}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            color: "#5B3DF5",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <span>👁 View Rule Summary</span>
        </button>
      </div>

      {/* ── 5 Metric Cards Grid Row ────────────────────────────────────────── */}
      <div
        className="metrics-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "20px",
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
              {totalProductCount}
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
              {totalVariantCount}
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
              {scopeCounts.variantsWithSku ?? 45}
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
              {scopeCounts.variantsWithoutSku ?? 48}
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
              {scopeCounts.estimatedCredits || totalVariantCount}
            </span>
            <span style={{ fontSize: "10px", color: "#9CA3AF", display: "block", marginTop: "2px" }}>
              1 credit per variant
            </span>
          </div>
        </div>
      </div>

      {/* ── Preview Information Banner Box ──────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#F5F3FF",
          border: "1px solid #DDD6FE",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div style={{ marginTop: "2px" }}>
          <InfoIcon size={18} color="#5B3DF5" />
        </div>
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#4C1D95", margin: 0 }}>
            Preview Information
          </h4>
          <p style={{ fontSize: "13px", color: "#5B21B6", marginTop: "2px", margin: 0, lineHeight: "1.4" }}>
            The preview below shows how SKUs will be generated based on your rule configuration. No changes have been made to your store yet.
          </p>
        </div>
      </div>

      {/* ── Interactive Preview Table Container ─────────────────────────────── */}
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          marginBottom: "20px",
        }}
      >
        {/* Table Title Bar & Controls */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
              Preview (First 10 of {totalVariantCount} variants)
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px", margin: 0 }}>
              Review the current SKUs and the new SKUs that will be applied.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search products or variants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "7px 12px 7px 32px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "1px solid #D1D5DB",
                  width: "220px",
                  outline: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9CA3AF",
                  fontSize: "13px",
                }}
              >
                🔍
              </span>
            </div>

            {/* Filters Button */}
            <button
              type="button"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D1D5DB",
                color: "#374151",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <span>Y Filters</span>
            </button>

            {/* Sort Dropdown */}
            <button
              type="button"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D1D5DB",
                color: "#374151",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <span>Sort by: Title A-Z</span>
              <ChevronDownIcon size={12} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>
                <th style={{ padding: "12px 20px" }}>Product</th>
                <th style={{ padding: "12px 20px" }}>Variant</th>
                <th style={{ padding: "12px 20px" }}>Current SKU</th>
                <th style={{ padding: "12px 20px" }}>Preview SKU</th>
                <th style={{ padding: "12px 20px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.slice(0, 10).map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx < filteredRows.length - 1 ? "1px solid #F3F4F6" : "none",
                    fontSize: "13px",
                  }}
                >
                  {/* Product Column */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          backgroundColor: "#F3F4F6",
                          border: "1px solid #E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {row.product.image ? (
                          <img
                            src={row.product.image}
                            alt={row.product.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <BoxIcon size={18} color="#9CA3AF" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#111827" }}>{row.product.title}</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                          ID: {row.product.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Variant Column */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{row.variant.title}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                      ID: {row.variant.id}
                    </div>
                  </td>

                  {/* Current SKU Column */}
                  <td style={{ padding: "14px 20px", color: row.currentSku ? "#374151" : "#9CA3AF", fontWeight: 500 }}>
                    {row.currentSku || "—"}
                  </td>

                  {/* Preview SKU Column */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#5B3DF5",
                        fontFamily: "monospace",
                        fontSize: "13px",
                      }}
                    >
                      {typeof row.previewSku === "string" ? row.previewSku : String(row.previewSku?.sku || "")}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: row.status === "Skipped" ? "#FEF3C7" : "#ECFDF5",
                        color: row.status === "Skipped" ? "#D97706" : "#047857",
                      }}
                    >
                      {String(row.status || "New")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "#FAFAFC",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            Showing 1 to 10 of {totalVariantCount} variants
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#5B3DF5",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              1
            </button>
            <button
              type="button"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              2
            </button>
            <button
              type="button"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              3
            </button>
            <span style={{ color: "#9CA3AF", fontSize: "12px" }}>...</span>
            <button
              type="button"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              10
            </button>
            <button
              type="button"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ── Warning Banner Box ──────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "16px" }}>⚠️</span>
        <span style={{ fontSize: "13px", color: "#B45309", fontWeight: 500 }}>
          <strong>Important:</strong> By clicking "Generate SKUs", the new SKUs will be applied to {totalVariantCount} variants. Existing SKUs will be overwritten if the "Overwrite existing SKUs" option is enabled in your rule.
        </span>
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
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          ← Back to Select Scope
        </button>

        <button
          type="button"
          onClick={onConfirmGenerate}
          disabled={isGenerating}
          style={{
            backgroundColor: "#5B3DF5",
            color: "#FFFFFF",
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          <span>{isGenerating ? "Generating SKUs..." : "Next: Generate SKUs"}</span>
          <ArrowRightIcon size={14} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}
