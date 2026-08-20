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
  randomDigits = 4,
  skuComponents,
  separator,
  customSeparator,
  removeSpaces,
  capitalizeAll,
  onViewFullPreview,
  previewProducts = [],
}) {
  const rawList = previewProducts.length > 0 ? previewProducts : initialProducts;

  const normalizedItems = rawList.flatMap((item, idx) => {
    // Format 1: Flattened item from preview API ({ product, variant, rawProduct, rawVariant })
    if (item.product || item.variant) {
      const pObj = item.product || item.rawProduct || {};
      const vObj = item.variant || item.rawVariant || {};
      const pTitle = pObj.title || "Product";
      const vTitle = vObj.title && vObj.title !== "Default Title" ? ` - ${vObj.title}` : "";
      const displayTitle = `${pTitle}${vTitle}`;
      const imgUrl = vObj.image?.url || vObj.image || pObj.image?.url || pObj.image || pObj.featuredImage?.url || "";

      return [{
        id: vObj.id || pObj.id || `preview_${idx}`,
        title: displayTitle,
        image: imgUrl,
        rawProduct: item.rawProduct || pObj,
        rawVariant: item.rawVariant || vObj,
        index: idx,
      }];
    }

    // Format 2: Raw product object with variants array ({ id, title, image, variants: [...] })
    if (item.variants && item.variants.length > 0) {
      return item.variants.map((v, vIdx) => {
        const pTitle = item.title || "Product";
        const vTitle = v.title && v.title !== "Default Title" ? ` - ${v.title}` : "";
        const displayTitle = `${pTitle}${vTitle}`;
        const imgUrl = v.image?.url || v.image || item.image?.url || item.image || item.featuredImage?.url || "";
        return {
          id: v.id || item.id || `preview_${idx}_${vIdx}`,
          title: displayTitle,
          image: imgUrl,
          rawProduct: item,
          rawVariant: v,
          index: idx * 10 + vIdx,
        };
      });
    }

    // Format 3: Standard product object or mock item
    return [{
      id: item.id || `preview_${idx}`,
      title: item.title || "Product",
      image: item.image?.url || item.image || "",
      rawProduct: item,
      rawVariant: item,
      index: idx,
    }];
  });

  const renderProductIcon = (item) => {
    if (item.image) {
      return (
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
        />
      );
    }
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          backgroundColor: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        📦
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
        {normalizedItems.slice(0, 5).map((item, idx) => {
          const skuVal = generatePreviewSku({
            product: item.rawProduct,
            variant: item.rawVariant,
            index: idx,
            prefix,
            body,
            suffix,
            bodyNumberType,
            startNumber,
            numberPadding,
            incrementStep,
            randomDigits,
            skuComponents,
            separator,
            customSeparator,
            removeSpaces,
            capitalizeAll,
          });

          return (
            <div key={item.id || idx} className="preview-product-item">
              <div className="product-thumb-container">
                {renderProductIcon(item)}
              </div>
              <div className="product-preview-info">
                <span className="product-title">{item.title}</span>
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
