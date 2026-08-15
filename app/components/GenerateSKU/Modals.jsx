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
