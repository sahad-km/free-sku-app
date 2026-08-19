import React, { useState } from "react";
import { CloseIcon, PlusIcon } from "./Icons";
import { initialProducts, generatePreviewSku } from "./skuUtils";

export function MetafieldFormModal({ isOpen, onClose, onAddMetafield, defaultLevel = "product" }) {
  const [level, setLevel] = useState(defaultLevel);
  const [namespace, setNamespace] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namespace.trim() || !key.trim()) {
      setError("Both Namespace and Key are required.");
      return;
    }
    setError("");
    onAddMetafield({
      id: `${level}_${namespace}_${key}_${Date.now()}`,
      type: level === "product" ? "productMetafield" : "variantMetafield",
      label: `${level === "product" ? "Product" : "Variant"} metafield`,
      name: `${level === "product" ? "Product" : "Variant"} metafield`,
      value: `${namespace.trim()}.${key.trim()}`,
      key: key.trim(),
      namespace: namespace.trim(),
    });
    setNamespace("");
    setKey("");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Add custom metafield</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field-group mb-12">
            <label className="field-label">Level</label>
            <div className="radio-group-inline">
              <label className="radio-inline-label">
                <input
                  type="radio"
                  name="metaLevel"
                  checked={level === "product"}
                  onChange={() => setLevel("product")}
                />
                <span>Product metafield</span>
              </label>
              <label className="radio-inline-label">
                <input
                  type="radio"
                  name="metaLevel"
                  checked={level === "variant"}
                  onChange={() => setLevel("variant")}
                />
                <span>Variant metafield</span>
              </label>
            </div>
          </div>

          <div className="field-group mb-12">
            <label className="field-label">Namespace</label>
            <input
              type="text"
              className="text-input"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              placeholder="e.g. custom"
            />
          </div>

          <div className="field-group mb-16">
            <label className="field-label">Key</label>
            <input
              type="text"
              className="text-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. material"
            />
          </div>

          {error && <p className="form-error-msg">{error}</p>}

          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="btn-modal-submit" type="submit">
              Add metafield
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddComponentModal({ isOpen, onClose, onSelectComponent }) {
  if (!isOpen) return null;

  const options = [
    { type: "prefix", label: "Prefix", desc: "Custom prefix string", value: "STRT" },
    { type: "body", label: "Body", desc: "Main numeric/string body", value: "0001" },
    { type: "suffix", label: "Suffix", desc: "Custom suffix string", value: "END" },
    {
      type: "productMetafield",
      label: "Product metafield",
      desc: "Metafield attached to product",
      value: "custom.material",
    },
    {
      type: "variantMetafield",
      label: "Variant metafield",
      desc: "Metafield attached to variant",
      value: "custom.color",
    },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Add SKU component</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="add-comp-options-list">
            {options.map((opt) => (
              <div
                key={opt.type}
                className="add-comp-option-item"
                onClick={() => {
                  onSelectComponent({
                    id: `${opt.type}_${Date.now()}`,
                    type: opt.type,
                    label: opt.label,
                    value: opt.value,
                  });
                  onClose();
                }}
              >
                <div className="comp-option-icon">
                  <PlusIcon size={16} color="#5B3DF5" />
                </div>
                <div>
                  <div className="comp-option-title">{opt.label}</div>
                  <div className="comp-option-desc">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RuleSummaryModal({ isOpen, onClose, config = {} }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Configured SKU Rule Summary</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#374151" }}>
            <div><strong>Prefix:</strong> {config.prefix || "—"}</div>
            <div><strong>Body Numbering:</strong> {config.bodyNumberType || "sequential"} (Start: {config.startNumber || 1}, Padding: {config.numberPadding || 4})</div>
            <div><strong>Suffix:</strong> {config.suffix || "—"}</div>
            <div><strong>Separator:</strong> {config.separator || "none"}</div>
            <div>
              <strong>Options:</strong> Overwrite ({config.overwriteExisting ? "Yes" : "No"}), Capitalize ({config.capitalizeAll ? "Yes" : "No"}), Remove Spaces ({config.removeSpaces ? "Yes" : "No"})
            </div>
            <div>
              <strong>Layout Components:</strong> {(config.skuComponents || []).map((c) => c.label || c.type).join(" → ")}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScopeSelectorModal({ isOpen, onClose, selection, onApplySelection }) {
  const [mode, setMode] = useState(selection?.type || "ALL_PRODUCTS");
  const [tagValue, setTagValue] = useState(selection?.tag || "");

  if (!isOpen) return null;

  const handlePickShopifyResource = async (type) => {
    if (typeof window !== "undefined" && window.shopify && window.shopify.resourcePicker) {
      try {
        const pickerType = type === "COLLECTIONS" ? "collection" : type === "PRODUCTS" ? "product" : "variant";
        const selectionResult = await window.shopify.resourcePicker({
          type: pickerType,
          multiple: true,
        });

        if (selectionResult && selectionResult.length > 0) {
          const selectedGids = selectionResult.map((item) => item.id);
          if (type === "COLLECTIONS") {
            onApplySelection({ type: "COLLECTIONS", collectionIds: selectedGids });
          } else if (type === "PRODUCTS") {
            onApplySelection({ type: "PRODUCTS", productIds: selectedGids });
          } else if (type === "VARIANTS") {
            onApplySelection({ type: "VARIANTS", variantIds: selectedGids });
          }
          onClose();
        }
      } catch (err) {
        console.warn("Resource Picker dismissed or error:", err.message);
      }
    } else {
      // Fallback for dev mode without active App Bridge window
      alert(`Shopify Resource Picker for ${type} is enabled. (GIDs will be selected in active store session)`);
      if (type === "COLLECTIONS") {
        onApplySelection({ type: "COLLECTIONS", collectionIds: ["gid://shopify/Collection/123"] });
      } else if (type === "PRODUCTS") {
        onApplySelection({ type: "PRODUCTS", productIds: ["gid://shopify/Product/123"] });
      } else if (type === "VARIANTS") {
        onApplySelection({ type: "VARIANTS", variantIds: ["gid://shopify/ProductVariant/123"] });
      }
      onClose();
    }
  };

  const handleSave = () => {
    if (mode === "ALL_PRODUCTS") {
      onApplySelection({ type: "ALL_PRODUCTS" });
    } else if (mode === "TAG") {
      if (!tagValue.trim()) {
        alert("Please enter a valid product tag.");
        return;
      }
      onApplySelection({ type: "TAG", tag: tagValue.trim() });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Select product scope</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="radio-options-vertical" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="scopeMode"
                checked={mode === "ALL_PRODUCTS"}
                onChange={() => setMode("ALL_PRODUCTS")}
              />
              <span style={{ fontWeight: 500 }}>All Products (Entire store catalog)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="scopeMode"
                checked={mode === "COLLECTIONS"}
                onChange={() => {
                  setMode("COLLECTIONS");
                  handlePickShopifyResource("COLLECTIONS");
                }}
              />
              <span style={{ fontWeight: 500 }}>Collections (Pick Shopify Collections)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="scopeMode"
                checked={mode === "PRODUCTS"}
                onChange={() => {
                  setMode("PRODUCTS");
                  handlePickShopifyResource("PRODUCTS");
                }}
              />
              <span style={{ fontWeight: 500 }}>Choose Products (Pick Shopify Products)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="scopeMode"
                checked={mode === "VARIANTS"}
                onChange={() => {
                  setMode("VARIANTS");
                  handlePickShopifyResource("VARIANTS");
                }}
              />
              <span style={{ fontWeight: 500 }}>Choose Variants (Pick individual Variants)</span>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  name="scopeMode"
                  checked={mode === "TAG"}
                  onChange={() => setMode("TAG")}
                />
                <span style={{ fontWeight: 500 }}>Choose Tags (Target products by tag)</span>
              </div>
              {mode === "TAG" && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter product tag (e.g. summer)"
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  style={{ marginLeft: "24px", marginTop: "4px" }}
                />
              )}
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-modal-submit" onClick={handleSave} type="button">
            Apply Scope
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  totalVariants = 0,
  estimatedCredits = 0,
  creditsAvailable = 100,
  overwriteExisting = true,
  isGenerating = false,
}) {
  if (!isOpen) return null;

  const hasEnoughCredits = creditsAvailable >= estimatedCredits;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Confirm SKU Generation</h3>
          <button className="modal-close-btn" onClick={onClose} type="button" disabled={isGenerating}>
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: "12px", color: "#374151" }}>
            You are about to generate SKUs for <strong>{totalVariants} variant(s)</strong>.
          </p>

          {overwriteExisting ? (
            <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <span style={{ fontWeight: 600, color: "#991B1B" }}>⚠️ Overwrite Warning:</span>
              <p style={{ fontSize: "13px", color: "#7F1D1D", marginTop: "4px", margin: 0 }}>
                Overwrite existing SKUs is enabled. Existing SKU values will be overwritten with new generated SKUs.
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #86EFAC", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <span style={{ fontWeight: 600, color: "#166534" }}>ℹ️ Safe Mode:</span>
              <p style={{ fontSize: "13px", color: "#14532D", marginTop: "4px", margin: 0 }}>
                Variants that already have an existing SKU will be preserved and skipped.
              </p>
            </div>
          )}

          <div style={{ backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
              <span>Credits required:</span>
              <strong>{estimatedCredits} credits</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span>Credits available:</span>
              <strong>{creditsAvailable} credits</strong>
            </div>
          </div>

          {!hasEnoughCredits && (
            <p style={{ color: "#DC2626", fontSize: "13px", fontWeight: 600, marginTop: "12px" }}>
              ❌ Insufficient credits. Please upgrade your plan to continue generation.
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button" disabled={isGenerating}>
            Cancel
          </button>
          <button
            className="btn-modal-submit"
            onClick={onConfirm}
            type="button"
            disabled={!hasEnoughCredits || isGenerating}
            style={{ backgroundColor: !hasEnoughCredits ? "#9CA3AF" : "#5B3DF5" }}
          >
            {isGenerating ? "Generating SKUs..." : "Confirm & Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FullPreviewModal({ isOpen, onClose, config }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">Full SKU Preview</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body overflow-y-auto max-h-400">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant ID</th>
                <th>Generated SKU</th>
              </tr>
            </thead>
            <tbody>
              {initialProducts.map((p, idx) => {
                const sku = generatePreviewSku({ product: p, index: idx, ...config });
                return (
                  <tr key={p.id}>
                    <td className="td-rule-name">{p.title}</td>
                    <td className="td-number">{p.variantId}</td>
                    <td>
                      <span className="sku-pill-tag purple-sku">{sku}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
