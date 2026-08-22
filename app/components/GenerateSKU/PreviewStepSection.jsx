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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive preview rows dynamically from real Shopify store products/variants matching selected scope
  const rawItems = (previewProducts || []).flatMap((item, pIdx) => {
    if (item.variant && item.product) {
      return [{
        product: item.product,
        variant: item.variant,
        currentSku: item.currentSku && item.currentSku !== "—" ? item.currentSku : null,
        rawVariant: item.rawVariant || item.variant,
        rawProduct: item.rawProduct || item.product,
        index: pIdx,
      }];
    }
    const p = item;
    const variants = p.variants || [{ id: `var_${p.id}`, title: "Default Variant", currentSku: null }];
    return variants.map((v, vIdx) => ({
      product: { id: p.id || `gid://shopify/Product/${pIdx}`, title: p.title || "Product", image: p.featuredImage?.url || p.image },
      variant: { id: v.id || `gid://shopify/ProductVariant/${vIdx}`, title: v.title || "Default" },
      currentSku: v.sku || v.currentSku || null,
      rawVariant: v,
      rawProduct: p,
      index: pIdx * 10 + vIdx,
    }));
  });

  // Apply preview SKU calculations using canonical SKU generator engine
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

  const totalRowsCount = tableRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRowsCount / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRows = tableRows.slice(startIndex, startIndex + itemsPerPage);

  const totalVariantCount = scopeCounts.totalVariants || totalRowsCount;
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
        {/* Table Title Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
              Preview (Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalRowsCount)} of {totalRowsCount} variants)
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px", margin: 0 }}>
              Review the current SKUs and the new SKUs that will be applied.
            </p>
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
              {pageRows.map((row, idx) => (
                <tr
                  key={row.variant.id || idx}
                  style={{
                    borderBottom: idx < pageRows.length - 1 ? "1px solid #F3F4F6" : "none",
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

        {/* Working Interactive Table Pagination Bar */}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalRowsCount)} of {totalRowsCount} variants
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "4px 10px",
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                color: currentPage === 1 ? "#9CA3AF" : "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              &lt; Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  border: pageNum === currentPage ? "none" : "1px solid #E5E7EB",
                  backgroundColor: pageNum === currentPage ? "#5B3DF5" : "#FFFFFF",
                  color: pageNum === currentPage ? "#FFFFFF" : "#374151",
                  fontSize: "13px",
                  fontWeight: pageNum === currentPage ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "4px 10px",
                height: "30px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                color: currentPage === totalPages ? "#9CA3AF" : "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next &gt;
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
          className="btn-next-step"
          type="button"
          onClick={onConfirmGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="btn-spinner" />
              <span>Generating SKUs...</span>
            </>
          ) : (
            <>
              <span>Next: Generate SKUs</span>
              <ArrowRightIcon size={14} color="#FFFFFF" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
