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

  // Form State
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
  const [prefix, setPrefix] = useState(
    initialRule && initialRule.config ? initialRule.config.prefix : "AUTO"
  );
  const [bodyType, setBodyType] = useState(
    initialRule && initialRule.config ? initialRule.config.bodyType : "Sequential"
  );
  const [suffix, setSuffix] = useState(
    initialRule && initialRule.config ? initialRule.config.suffix : "RULE"
  );
  const [separator, setSeparator] = useState(
    initialRule && initialRule.config ? initialRule.config.separator : "-"
  );

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1 && !ruleName.trim()) {
      alert("Rule name is required.");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Save
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
          bodyType,
          suffix,
          separator,
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

  // Live SKU computed sample
  const previewSku = `${prefix}${separator}0001${separator}${suffix}`;

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

          {/* Step 3: SKU Rule Configuration */}
          {currentStep === 3 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">3. Configure SKU Rule Structure</h4>

              <div className="basic-structure-row mb-16">
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

                <span className="field-separator">-</span>

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
                  </select>
                </div>
              </div>

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
