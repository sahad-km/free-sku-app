import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "./Icons";

export default function ExtraComponentsSection({
  productNameChar = "",
  onProductNameCharChange,
  variantNameChar = "",
  onVariantNameCharChange,
  productTypeChar = "",
  onProductTypeCharChange,
  vendorChar = "",
  onVendorCharChange,
  variantOption1Char = "",
  onVariantOption1CharChange,
  variantOption2Char = "",
  onVariantOption2CharChange,
  variantOption3Char = "",
  onVariantOption3CharChange,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const charLengthOptions = [
    { value: "", label: "Disabled / Not included" },
    { value: "full", label: "Full characters" },
    { value: "1", label: "First 1 char" },
    { value: "2", label: "First 2 char" },
    { value: "3", label: "First 3 char" },
    { value: "4", label: "First 4 char" },
    { value: "5", label: "First 5 char" },
  ];

  return (
    <div className="card section-card">
      <div
        className="section-card-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="section-header-left">
          <div className="section-step-number">5</div>
          <div>
            <div className="section-title-row">
              <h2 className="section-title">Extra components</h2>
              <span className="paid-pill-badge">Paid</span>
            </div>
            <p className="section-subtitle">
              Configure character length rules for product and variant details to add them to your SKU layout.
            </p>
          </div>
        </div>
        <button className="accordion-toggle-btn" type="button">
          {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="section-card-body">
          <div className="extra-components-grid">
            {/* Left Column: Product Level Components */}
            <div className="extra-col">
              <div className="field-group">
                <label className="field-label">Product name</label>
                <select
                  className="select-input"
                  value={productNameChar}
                  onChange={(e) => onProductNameCharChange && onProductNameCharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Product type</label>
                <select
                  className="select-input"
                  value={productTypeChar}
                  onChange={(e) => onProductTypeCharChange && onProductTypeCharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Variant option 1</label>
                <select
                  className="select-input"
                  value={variantOption1Char}
                  onChange={(e) => onVariantOption1CharChange && onVariantOption1CharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Variant option 3</label>
                <select
                  className="select-input"
                  value={variantOption3Char}
                  onChange={(e) => onVariantOption3CharChange && onVariantOption3CharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column: Variant Level Components */}
            <div className="extra-col">
              <div className="field-group">
                <label className="field-label">Variant name</label>
                <select
                  className="select-input"
                  value={variantNameChar}
                  onChange={(e) => onVariantNameCharChange && onVariantNameCharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Vendor</label>
                <select
                  className="select-input"
                  value={vendorChar}
                  onChange={(e) => onVendorCharChange && onVendorCharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Variant option 2</label>
                <select
                  className="select-input"
                  value={variantOption2Char}
                  onChange={(e) => onVariantOption2CharChange && onVariantOption2CharChange(e.target.value)}
                >
                  {charLengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
