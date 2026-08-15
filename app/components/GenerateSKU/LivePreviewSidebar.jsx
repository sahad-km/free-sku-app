import React from "react";
import { ExternalLinkIcon } from "./Icons";
import { initialProducts, generatePreviewSku } from "./skuUtils";

export default function LivePreviewSidebar({
  prefix,
  body,
  suffix,
  bodyNumberType,
  startNumber,
  numberPadding,
  incrementStep,
  skuComponents,
  separator,
  customSeparator,
  removeSpaces,
  capitalizeAll,
  onViewFullPreview,
}) {
  const renderProductIcon = (prod) => {
    if (prod.type === "Gift Card") {
      return (
        <div className="gift-card-icon-box">
          🎁
        </div>
      );
    }
    // Snowboard icon representation
    return (
      <div className={`snowboard-icon-box ${prod.thumbnailBg || "bg-teal"}`}>
        <span className="snowboard-pill board-left" />
        <span className="snowboard-pill board-right" />
      </div>
    );
  };

  return (
    <div className="card sidebar-card live-preview-card">
      <div className="sidebar-card-header">
        <h3 className="sidebar-title">Live preview</h3>
        <p className="sidebar-subtitle">See how your SKUs will look.</p>
      </div>

      <div className="live-preview-list">
        {initialProducts.map((product, idx) => {
          const skuVal = generatePreviewSku({
            product,
            index: idx,
            prefix,
            body,
            suffix,
            bodyNumberType,
            startNumber,
            numberPadding,
            incrementStep,
            skuComponents,
            separator,
            customSeparator,
            removeSpaces,
            capitalizeAll,
          });

          return (
            <div key={product.id} className="preview-product-item">
              <div className="product-thumb-container">
                {renderProductIcon(product)}
              </div>
              <div className="product-preview-info">
                <span className="product-title">{product.title}</span>
                <span className="product-computed-sku font-mono">{skuVal}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn-view-full-preview"
        onClick={onViewFullPreview}
        type="button"
      >
        <span>View full preview</span>
        <ExternalLinkIcon size={14} color="#374151" />
      </button>
    </div>
  );
}
