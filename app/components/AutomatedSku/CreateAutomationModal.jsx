import React, { useState } from "react";
import { CloseIcon, ZapIcon, SparkleIcon } from "./Icons";
import { triggerOptions, scopeOptions } from "./mockData";

export default function CreateAutomationModal({
  isOpen,
  onClose,
  onSaveRule,
  initialRule,
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State - Details & Trigger
  const [ruleName, setRuleName] = useState(initialRule ? initialRule.name : "");
  const [ruleDescription, setRuleDescription] = useState(
    initialRule ? initialRule.description : ""
  );
  const [selectedTrigger, setSelectedTrigger] = useState(
    initialRule ? initialRule.trigger : "New product added"
  );
  const [selectedScope, setSelectedScope] = useState(
    initialRule ? initialRule.scope : "All products"
  );

  // Form State - SKU Structure (Matching Generate SKU Page)
  const [prefix, setPrefix] = useState(
    initialRule && initialRule.config ? initialRule.config.prefix ?? "AUTO" : "AUTO"
  );
  const [suffix, setSuffix] = useState(
    initialRule && initialRule.config ? initialRule.config.suffix ?? "RULE" : "RULE"
  );
  const [separator, setSeparator] = useState(
    initialRule && initialRule.config ? initialRule.config.separator ?? "-" : "-"
  );
  const [customSeparator, setCustomSeparator] = useState(
    initialRule && initialRule.config ? initialRule.config.customSeparator ?? "" : ""
  );

  // Sequence Numbering & Body Options
  const [bodyNumberType, setBodyNumberType] = useState(
    initialRule && initialRule.config ? initialRule.config.bodyNumberType ?? "sequential" : "sequential"
  );
  const [startNumber, setStartNumber] = useState(
    initialRule && initialRule.config ? initialRule.config.startNumber ?? 1 : 1
  );
  const [numberPadding, setNumberPadding] = useState(
    initialRule && initialRule.config ? initialRule.config.numberPadding ?? 4 : 4
  );
  const [incrementStep, setIncrementStep] = useState(
    initialRule && initialRule.config ? initialRule.config.incrementStep ?? 1 : 1
  );

  // Formatting & Overwrite Options
  const [overwriteExisting, setOverwriteExisting] = useState(
    initialRule && initialRule.config ? initialRule.config.overwriteExisting ?? true : true
  );
  const [individualVariantNumbering, setIndividualVariantNumbering] = useState(
    initialRule && initialRule.config ? initialRule.config.individualVariantNumbering ?? true : true
  );
  const [removeSpaces, setRemoveSpaces] = useState(
    initialRule && initialRule.config ? initialRule.config.removeSpaces ?? false : false
  );
  const [capitalizeAll, setCapitalizeAll] = useState(
    initialRule && initialRule.config ? initialRule.config.capitalizeAll ?? true : true
  );

  if (!isOpen) return null;

  // Dynamic Live SKU Format Calculation
  const computePreviewSku = () => {
    let sep = separator;
    if (separator === "none") sep = "";
    else if (separator === "custom") sep = customSeparator || "";

    let bodyStr = String(startNumber).padStart(parseInt(numberPadding, 10) || 4, "0");
    if (bodyNumberType === "random") bodyStr = "9A2F";
    else if (bodyNumberType === "productId") bodyStr = "7890";
    else if (bodyNumberType === "continue") bodyStr = String((parseInt(startNumber, 10) || 1) + 10).padStart(parseInt(numberPadding, 10) || 4, "0");

    const parts = [];
    if (prefix.trim()) parts.push(prefix.trim());
    parts.push(bodyStr);
    if (suffix.trim()) parts.push(suffix.trim());

    let rawSku = parts.join(sep);
    if (removeSpaces) rawSku = rawSku.replace(/\s+/g, "");
    if (capitalizeAll) rawSku = rawSku.toUpperCase();
    return rawSku;
  };

  const previewSku = computePreviewSku();

  const handleNext = () => {
    if (currentStep === 1 && !ruleName.trim()) {
      alert("Rule name is required.");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Save with complete configuration payload
      onSaveRule({
        id: initialRule ? initialRule.id : `auto-${Date.now()}`,
        name: ruleName.trim(),
        description: ruleDescription.trim() || "Automatically generate SKU for matching products.",
        scope: selectedScope,
        scopeSubtext: selectedScope === "All products" ? "All collections" : "Selected scope",
        status: "Active",
        trigger: selectedTrigger,
        lastRunDate: "Just created",
        lastRunTime: "Now",
        lastRunStatus: "none",
        skusGenerated: 0,
        skusGeneratedSubtext: "Today",
        iconType: "shirt",
        iconBg: "bg-purple-light",
        iconColor: "#7C3AED",
        config: {
          prefix,
          suffix,
          separator,
          customSeparator,
          bodyNumberType,
          startNumber: parseInt(startNumber, 10) || 1,
          numberPadding: parseInt(numberPadding, 10) || 4,
          incrementStep: parseInt(incrementStep, 10) || 1,
          overwriteExisting,
          individualVariantNumbering,
          removeSpaces,
          capitalizeAll,
        },
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {initialRule ? "Edit Automation Rule" : "Create New Automation Rule"}
            </h3>
            <p className="modal-subtitle-id">Step {currentStep} of 4</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body overflow-y-auto max-h-500">
          {/* Wizard Progress bar */}
          <div className="wizard-progress-bar mb-16">
            <div
              className="wizard-progress-fill"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Step 1: Name & Trigger */}
          {currentStep === 1 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">1. Automation Details & Trigger</h4>
              
              <div className="field-group mb-14">
                <label className="field-label">Rule Name *</label>
                <input
                  type="text"
                  className="text-input"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. New products daily"
                />
              </div>

              <div className="field-group mb-16">
                <label className="field-label">Description (optional)</label>
                <input
                  type="text"
                  className="text-input"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="e.g. Automatically generate SKU for new products added daily."
                />
              </div>

              <div className="field-group">
                <label className="field-label">Select Trigger</label>
                <div className="triggers-selection-grid">
                  {triggerOptions.map((trig) => (
                    <div
                      key={trig.id}
                      className={`trigger-option-card ${
                        selectedTrigger === trig.title ? "card-selected" : ""
                      }`}
                      onClick={() => setSelectedTrigger(trig.title)}
                    >
                      <div className="trigger-card-header">
                        <ZapIcon size={16} color="#5B3DF5" />
                        <span className="trigger-card-title">{trig.title}</span>
                      </div>
                      <p className="trigger-card-desc">{trig.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Scope */}
          {currentStep === 2 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">2. Choose Target Scope</h4>
              <p className="wizard-step-desc">
                Specify which products, collections, or vendors will be affected by this automation rule.
              </p>

              <div className="scope-selection-grid">
                {scopeOptions.map((sc) => (
                  <div
                    key={sc.id}
                    className={`scope-option-card ${
                      selectedScope === sc.label ? "card-selected" : ""
                    }`}
                    onClick={() => setSelectedScope(sc.label)}
                  >
                    <div className="scope-card-radio">
                      <div
                        className={`custom-radio ${
                          selectedScope === sc.label ? "radio-checked" : ""
                        }`}
                      >
                        {selectedScope === sc.label && <div className="radio-inner-dot" />}
                      </div>
                      <span className="scope-card-label">{sc.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: SKU Rule Configuration (Full Generate SKU Page Options) */}
          {currentStep === 3 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">3. Configure SKU Rule Structure</h4>
              <p className="wizard-step-desc">
                Customize prefix, sequence numbering, separator, and formatting options for generated SKUs.
              </p>

              {/* 1. Basic Structure: Prefix, Suffix, Separator */}
              <div className="form-section-card mb-16">
                <h5 className="form-section-title">Prefix, Suffix & Separator</h5>
                <div className="basic-structure-row">
                  <div className="field-group flex-1">
                    <label className="field-label">Prefix</label>
                    <input
                      type="text"
                      className="text-input"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="e.g. AUTO"
                    />
                  </div>

                  <div className="field-group flex-1">
                    <label className="field-label">Suffix</label>
                    <input
                      type="text"
                      className="text-input"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      placeholder="e.g. RULE"
                    />
                  </div>

                  <div className="field-group flex-1">
                    <label className="field-label">Separator</label>
                    <select
                      className="select-input"
                      value={separator}
                      onChange={(e) => setSeparator(e.target.value)}
                    >
                      <option value="-">Dash (-)</option>
                      <option value="_">Underscore (_)</option>
                      <option value="|">Pipe (|)</option>
                      <option value=".">Dot (.)</option>
                      <option value="none">None</option>
                      <option value="custom">Custom...</option>
                    </select>
                  </div>
                </div>

                {separator === "custom" && (
                  <div className="field-group mt-12">
                    <label className="field-label">Custom Separator</label>
                    <input
                      type="text"
                      className="text-input"
                      value={customSeparator}
                      onChange={(e) => setCustomSeparator(e.target.value)}
                      placeholder="e.g. /"
                    />
                  </div>
                )}
              </div>

              {/* 2. Body / Sequence Number Settings */}
              <div className="form-section-card mb-16">
                <h5 className="form-section-title">Body / Sequence Numbering</h5>
                
                <div className="field-group mb-14">
                  <label className="field-label">Number Generation Mode</label>
                  <select
                    className="select-input"
                    value={bodyNumberType}
                    onChange={(e) => setBodyNumberType(e.target.value)}
                  >
                    <option value="sequential">Sequential Numbering (0001, 0002...)</option>
                    <option value="random">Random Alphanumeric Code (9A2F)</option>
                    <option value="productId">Product ID Based</option>
                    <option value="continue">Continue Previous Store Sequence</option>
                  </select>
                </div>

                {bodyNumberType !== "random" && bodyNumberType !== "productId" && (
                  <div className="number-settings-row">
                    <div className="field-group flex-1">
                      <label className="field-label">Start Number</label>
                      <input
                        type="number"
                        className="text-input"
                        min="1"
                        value={startNumber}
                        onChange={(e) => setStartNumber(e.target.value)}
                      />
                    </div>

                    <div className="field-group flex-1">
                      <label className="field-label">Digit Padding</label>
                      <select
                        className="select-input"
                        value={numberPadding}
                        onChange={(e) => setNumberPadding(e.target.value)}
                      >
                        <option value="2">2 Digits (01)</option>
                        <option value="3">3 Digits (001)</option>
                        <option value="4">4 Digits (0001)</option>
                        <option value="5">5 Digits (00001)</option>
                        <option value="6">6 Digits (000001)</option>
                      </select>
                    </div>

                    <div className="field-group flex-1">
                      <label className="field-label">Increment Step</label>
                      <input
                        type="number"
                        className="text-input"
                        min="1"
                        value={incrementStep}
                        onChange={(e) => setIncrementStep(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Formatting & Processing Toggles */}
              <div className="form-section-card mb-16">
                <h5 className="form-section-title">Processing & Formatting Options</h5>
                
                <div className="toggles-grid">
                  <label className="toggle-option-card">
                    <input
                      type="checkbox"
                      checked={overwriteExisting}
                      onChange={(e) => setOverwriteExisting(e.target.checked)}
                    />
                    <div>
                      <span className="toggle-option-title">Overwrite Existing SKUs</span>
                      <p className="toggle-option-desc">Replace SKUs if product already has an assigned SKU</p>
                    </div>
                  </label>

                  <label className="toggle-option-card">
                    <input
                      type="checkbox"
                      checked={individualVariantNumbering}
                      onChange={(e) => setIndividualVariantNumbering(e.target.checked)}
                    />
                    <div>
                      <span className="toggle-option-title">Individual Variant Sequence</span>
                      <p className="toggle-option-desc">Increment sequence number for each variant</p>
                    </div>
                  </label>

                  <label className="toggle-option-card">
                    <input
                      type="checkbox"
                      checked={removeSpaces}
                      onChange={(e) => setRemoveSpaces(e.target.checked)}
                    />
                    <div>
                      <span className="toggle-option-title">Remove Spaces</span>
                      <p className="toggle-option-desc">Strip whitespace from final SKU string</p>
                    </div>
                  </label>

                  <label className="toggle-option-card">
                    <input
                      type="checkbox"
                      checked={capitalizeAll}
                      onChange={(e) => setCapitalizeAll(e.target.checked)}
                    />
                    <div>
                      <span className="toggle-option-title">Capitalize All (UPPERCASE)</span>
                      <p className="toggle-option-desc">Convert all characters in final SKU to uppercase</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Live Preview Result Box */}
              <div className="live-preview-box">
                <span className="preview-box-label">Live SKU Format Preview:</span>
                <span className="sku-pill-tag purple-sku">{previewSku}</span>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">4. Review Automation Rule</h4>
              
              <div className="review-summary-card">
                <div className="review-row">
                  <span className="review-label">Rule Name:</span>
                  <span className="review-val">{ruleName}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Trigger:</span>
                  <span className="review-val">{selectedTrigger}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Scope:</span>
                  <span className="review-val">{selectedScope}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Numbering Mode:</span>
                  <span className="review-val">
                    {bodyNumberType === "sequential"
                      ? `Sequential (Start: ${startNumber}, Padding: ${numberPadding} digits)`
                      : bodyNumberType === "random"
                      ? "Random Alphanumeric"
                      : "Product ID Based"}
                  </span>
                </div>
                <div className="review-row">
                  <span className="review-label">Overwrite Existing:</span>
                  <span className="review-val">{overwriteExisting ? "Yes" : "No (Skip existing)"}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Generated SKU Format:</span>
                  <span className="sku-pill-tag purple-sku">{previewSku}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Initial Status:</span>
                  <span className="auto-status-badge status-active">• Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          {currentStep > 1 && (
            <button className="btn-modal-cancel" onClick={handleBack} type="button">
              Back
            </button>
          )}
          <button className="btn-modal-cancel" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-modal-submit" onClick={handleNext} type="button">
            {currentStep === 4 ? (initialRule ? "Save Changes" : "Save Automation") : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
