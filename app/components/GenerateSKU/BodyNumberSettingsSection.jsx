import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon, InfoIcon } from "./Icons";

export default function BodyNumberSettingsSection({
  bodyNumberType,
  setBodyNumberType,
  startNumber,
  setStartNumber,
  numberPadding,
  setNumberPadding,
  incrementStep,
  setIncrementStep,
  prefix,
  suffix,
  separator,
  customSeparator,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const options = [
    {
      id: "sequential",
      title: "Sequential number",
      description: "Generate SKUs with sequential numbers like 1, 2, 3, 4, etc.",
    },
    {
      id: "continue",
      title: "Continue from last",
      badge: "Paid",
      description: "Resume numbering from the last generated SKU in the previous batch.",
    },
    {
      id: "disabled",
      title: "Disable body number",
      description: "SKUs will not include a numeric component in the body.",
    },
    {
      id: "productId",
      title: "Product ID as number",
      description: "Use the product's unique identifier as the numeric body.",
    },
    {
      id: "variantId",
      title: "Variant ID as number",
      description: "Use the variant's unique identifier as the numeric body.",
    },
    {
      id: "random",
      title: "Random number",
      description: "Generate a random number for each SKU.",
    },
  ];

  // Helper to compute sample previews for the sequential sub-box
  const getSepChar = () => {
    if (separator === "dash" || separator === "-") return "-";
    if (separator === "underscore" || separator === "_") return "_";
    if (separator === "pipe" || separator === "|") return "|";
    if (separator === "slash" || separator === "/") return "/";
    if (separator === "dot" || separator === ".") return ".";
    if (separator === "custom") return customSeparator || "";
    return "";
  };

  const sep = getSepChar();
  const pad = Math.max(0, parseInt(numberPadding, 10) || 0);
  const start = parseInt(startNumber, 10) || 1;
  const pFix = prefix ? `${prefix}${sep}` : "";
  const sFix = suffix ? `${sep}${suffix}` : "";

  const prev1 = `${pFix}${start.toString().padStart(pad, "0")}${sFix}`;
  const prev2 = `${pFix}${(start + 1).toString().padStart(pad, "0")}${sFix}`;
  const prev3 = `${pFix}${(start + 2).toString().padStart(pad, "0")}${sFix}`;

  return (
    <div className="card section-card">
      <div
        className="section-card-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="section-header-left">
          <div className="section-step-number">2</div>
          <div>
            <h2 className="section-title">Body number settings</h2>
            <p className="section-subtitle">
              Choose how the body number should be generated.
            </p>
          </div>
        </div>
        <button className="accordion-toggle-btn" type="button">
          {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="section-card-body">
          {/* Options Grid */}
          <div className="body-number-options-grid">
            {options.map((opt) => {
              const isSelected = bodyNumberType === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`body-option-card ${
                    isSelected ? "body-option-selected" : ""
                  }`}
                  onClick={() => setBodyNumberType(opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="body-option-radio-row">
                    <div
                      className={`custom-radio ${
                        isSelected ? "radio-checked" : ""
                      }`}
                    >
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>
                    <span className="body-option-title">{opt.title}</span>
                    {opt.badge && (
                      <span className="paid-pill-badge">{opt.badge}</span>
                    )}
                  </div>
                  <p className="body-option-desc">{opt.description}</p>
                </div>
              );
            })}
          </div>

          {/* Sequential Controls Sub-box */}
          {(bodyNumberType === "sequential" || bodyNumberType === "continue") && (
            <div className="sequential-controls-box">
              <div className="sequential-fields-row">
                <div className="field-group">
                  <label className="field-label">Start number</label>
                  <input
                    type="number"
                    className="text-input"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Number padding</label>
                  <div className="input-with-suffix">
                    <input
                      type="number"
                      className="text-input"
                      value={numberPadding}
                      onChange={(e) => setNumberPadding(e.target.value)}
                      min="0"
                      max="12"
                    />
                    <span className="input-suffix-tag">digits</span>
                  </div>
                </div>

                <div className="field-group flex-1">
                  <label className="field-label">Preview</label>
                  <div className="preview-pills-row">
                    <span className="sku-pill-tag">{prev1}</span>
                    <span className="sku-pill-tag">{prev2}</span>
                    <span className="sku-pill-tag">{prev3}</span>
                    <span className="sku-pill-tag text-muted-tag">...</span>
                  </div>
                </div>
              </div>

              <div className="tip-info-row">
                <InfoIcon size={14} color="#5B3DF5" />
                <span>
                  Tip: With padding "{numberPadding}", numbers will be formatted as{" "}
                  {start.toString().padStart(pad, "0")},{" "}
                  {(start + 1).toString().padStart(pad, "0")},{" "}
                  {(start + 2).toString().padStart(pad, "0")}...
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
