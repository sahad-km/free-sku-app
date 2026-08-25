import React, { useState } from "react";
import { CloseIcon, ZapIcon, SparkleIcon, ShirtIcon, DocumentIcon, TagIcon, ClockIcon } from "./Icons";
import { triggerOptions, scopeOptions } from "./mockData";
import { showGlobalToast } from "../Common/Toast";
import SkuLayoutSection from "../GenerateSKU/SkuLayoutSection";
import ExtraComponentsSection from "../GenerateSKU/ExtraComponentsSection";

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
  const [randomDigits, setRandomDigits] = useState(
    initialRule && initialRule.config ? initialRule.config.randomDigits ?? 4 : 4
  );

  // SKU Components & Character Length States for Extra Components
  const [skuComponents, setSkuComponents] = useState(
    initialRule && initialRule.config && Array.isArray(initialRule.config.skuComponents)
      ? initialRule.config.skuComponents
      : [{ id: "body_1", type: "body", label: "Body", name: "Body", value: "0001" }]
  );

  const [productNameChar, setProductNameChar] = useState(
    initialRule && initialRule.config ? initialRule.config.productNameChar ?? "" : ""
  );
  const [variantNameChar, setVariantNameChar] = useState(
    initialRule && initialRule.config ? initialRule.config.variantNameChar ?? "" : ""
  );
  const [productTypeChar, setProductTypeChar] = useState(
    initialRule && initialRule.config ? initialRule.config.productTypeChar ?? "" : ""
  );
  const [vendorChar, setVendorChar] = useState(
    initialRule && initialRule.config ? initialRule.config.vendorChar ?? "" : ""
  );
  const [variantOption1Char, setVariantOption1Char] = useState(
    initialRule && initialRule.config ? initialRule.config.variantOption1Char ?? "" : ""
  );
  const [variantOption2Char, setVariantOption2Char] = useState(
    initialRule && initialRule.config ? initialRule.config.variantOption2Char ?? "" : ""
  );
  const [variantOption3Char, setVariantOption3Char] = useState(
    initialRule && initialRule.config ? initialRule.config.variantOption3Char ?? "" : ""
  );

  // Target Scope Value (for Collections, Vendors, or Tags)
  const [scopeTargetValue, setScopeTargetValue] = useState(
    initialRule && initialRule.config ? initialRule.config.scopeTargetValue ?? "" : ""
  );

  // Schedule Timeframe Options (For Scheduled trigger)
  const [scheduleFrequency, setScheduleFrequency] = useState(
    initialRule && initialRule.config ? initialRule.config.scheduleFrequency ?? "Weekly" : "Weekly"
  );
  const [scheduleDay, setScheduleDay] = useState(
    initialRule && initialRule.config ? initialRule.config.scheduleDay ?? "Friday" : "Friday"
  );
  const [scheduleTime, setScheduleTime] = useState(
    initialRule && initialRule.config ? initialRule.config.scheduleTime ?? "06:00 PM" : "06:00 PM"
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleExtraComponentCharChange = (compType, label, val, setCharState) => {
    setCharState(val);

    setSkuComponents((prevComponents) => {
      const existingIndex = prevComponents.findIndex(
        (c) => c.type === compType || (compType === "productVendor" && c.type === "vendor")
      );

      if (!val) {
        return prevComponents.filter(
          (c) => c.type !== compType && !(compType === "productVendor" && c.type === "vendor")
        );
      }

      const sampleValues = {
        productTitle: "Snowboard",
        variantTitle: "Black/L",
        productType: "Snowboard",
        productVendor: "Burton",
        variantOption1: "Large",
        variantOption2: "Black",
        variantOption3: "Pro",
      };

      const sampleVal = sampleValues[compType] || "VAL";

      if (existingIndex >= 0) {
        const updated = [...prevComponents];
        updated[existingIndex] = {
          ...updated[existingIndex],
          charLength: val,
        };
        return updated;
      } else {
        const newComp = {
          id: `${compType}_${Date.now()}`,
          type: compType,
          label: label,
          name: label,
          value: sampleVal,
          charLength: val,
        };

        return [...prevComponents, newComp];
      }
    });
  };

  const handleRemoveComponentFromLayout = (compType, compId) => {
    if (compType === "body") {
      showGlobalToast("Body component is required in the SKU layout.", "warning");
      return;
    }
    setSkuComponents((prev) => prev.filter((c) => c.id !== compId));

    if (compType === "productTitle" || compType === "productName") setProductNameChar("");
    if (compType === "variantTitle" || compType === "variantName") setVariantNameChar("");
    if (compType === "productType" || compType === "type") setProductTypeChar("");
    if (compType === "productVendor" || compType === "vendor") setVendorChar("");
    if (compType === "variantOption1" || compType === "option1") setVariantOption1Char("");
    if (compType === "variantOption2" || compType === "option2") setVariantOption2Char("");
    if (compType === "variantOption3" || compType === "option3") setVariantOption3Char("");
  };

  // Dynamic Live SKU Format Calculation
  const computePreviewSku = () => {
    let sep = separator;
    if (separator === "none") sep = "";
    else if (separator === "custom") sep = customSeparator || "";

    const parts = [];

    if (prefix && prefix.trim()) parts.push(prefix.trim());

    (skuComponents || []).forEach((comp) => {
      let val = "";
      if (comp.type === "body") {
        if (bodyNumberType === "disabled") val = "";
        else if (bodyNumberType === "random") val = "9A2F";
        else if (bodyNumberType === "productId") val = "7890";
        else if (bodyNumberType === "variantId") val = "4567";
        else if (bodyNumberType === "continue") val = String((parseInt(startNumber, 10) || 1) + 10).padStart(parseInt(numberPadding, 10) || 4, "0");
        else val = String(startNumber).padStart(parseInt(numberPadding, 10) || 4, "0");
      } else if (comp.type === "productTitle" || comp.type === "productName") {
        val = "Snowboard";
      } else if (comp.type === "variantTitle" || comp.type === "variantName") {
        val = "Black/L";
      } else if (comp.type === "productType" || comp.type === "type") {
        val = "Snowboard";
      } else if (comp.type === "productVendor" || comp.type === "vendor") {
        val = "Burton";
      } else if (comp.type === "variantOption1" || comp.type === "option1") {
        val = "Large";
      } else if (comp.type === "variantOption2" || comp.type === "option2") {
        val = "Black";
      } else if (comp.type === "variantOption3" || comp.type === "option3") {
        val = "Pro";
      } else {
        val = comp.value || "";
      }

      if (val) {
        const charLen = comp.charLength;
        if (charLen && charLen !== "full") {
          const num = parseInt(charLen, 10);
          if (!isNaN(num) && num > 0) val = val.substring(0, num);
        }
        parts.push(val);
      }
    });

    if (suffix && suffix.trim()) parts.push(suffix.trim());

    let rawSku = parts.join(sep);
    if (removeSpaces) rawSku = rawSku.replace(/\s+/g, "");
    if (capitalizeAll) rawSku = rawSku.toUpperCase();
    return rawSku || "NO-SKU-FORMAT";
  };

  const previewSku = computePreviewSku();

  const handleNext = async () => {
    if (currentStep === 1 && !ruleName.trim()) {
      showGlobalToast("Rule name is required.", "warning");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const formattedTrigger = selectedTrigger.includes("Scheduled")
          ? `Scheduled (${scheduleFrequency === "Weekly" ? `Every ${scheduleDay.slice(0, 3)}` : scheduleFrequency} ${scheduleTime})`
          : selectedTrigger;

        const subtext = selectedScope === "All products"
          ? "All collections"
          : scopeTargetValue
          ? scopeTargetValue
          : "Selected scope";

        // Final Save with complete configuration payload
        const success = await onSaveRule({
          id: initialRule ? initialRule.id : `auto-${Date.now()}`,
          name: ruleName.trim(),
          description: ruleDescription.trim() || "Automatically generate SKU for matching products.",
          scope: selectedScope,
          scopeSubtext: subtext,
          status: "Active",
          trigger: formattedTrigger,
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
            randomDigits: parseInt(randomDigits, 10) || 4,
            productNameChar,
            variantNameChar,
            productTypeChar,
            vendorChar,
            variantOption1Char,
            variantOption2Char,
            variantOption3Char,
            skuComponents,
            scheduleFrequency,
            scheduleDay,
            scheduleTime,
            scopeTargetValue,
            overwriteExisting,
            individualVariantNumbering,
            removeSpaces,
            capitalizeAll,
          },
        });

        if (success !== false) {
          onClose();
        }
      } catch (err) {
        console.warn("Error saving rule:", err.message);
      } finally {
        setIsSubmitting(false);
      }
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

              <div className="field-group mb-16">
                <label className="field-label">Select Trigger</label>
                <div className="triggers-selection-grid">
                  {triggerOptions.map((trig) => (
                    <div
                      key={trig.id}
                      className={`trigger-option-card ${
                        selectedTrigger === trig.title || selectedTrigger.startsWith(trig.title) ? "card-selected" : ""
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

              {/* Schedule Timeframe Options (If Scheduled Trigger is Selected) */}
              {selectedTrigger.includes("Scheduled") && (
                <div
                  className="form-section-card mb-16"
                  style={{
                    backgroundColor: "#F9FAFB",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <ClockIcon size={16} color="#4F46E5" />
                    Schedule Timeframe & Recurrence
                  </h5>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: scheduleFrequency === "Weekly" ? "1fr 1fr 1fr" : "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="field-group">
                      <label className="field-label">Frequency</label>
                      <select
                        className="select-input"
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value)}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    {scheduleFrequency === "Weekly" && (
                      <div className="field-group">
                        <label className="field-label">Day of Week</label>
                        <select
                          className="select-input"
                          value={scheduleDay}
                          onChange={(e) => setScheduleDay(e.target.value)}
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                    )}

                    <div className="field-group">
                      <label className="field-label">Time of Day</label>
                      <select
                        className="select-input"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      >
                        <option value="12:00 AM">12:00 AM (Midnight)</option>
                        <option value="01:00 AM">01:00 AM</option>
                        <option value="02:00 AM">02:00 AM</option>
                        <option value="03:00 AM">03:00 AM</option>
                        <option value="04:00 AM">04:00 AM</option>
                        <option value="05:00 AM">05:00 AM</option>
                        <option value="06:00 AM">06:00 AM</option>
                        <option value="07:00 AM">07:00 AM</option>
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM (Noon)</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                        <option value="10:00 PM">10:00 PM</option>
                        <option value="11:00 PM">11:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Target Products (Applies To) */}
          {currentStep === 2 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">2. Which Products Should This Rule Apply To?</h4>
              <p className="wizard-step-desc">
                Select which products in your store catalog will automatically receive SKUs when this rule runs.
              </p>

              <div className="scope-selection-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* 1. All products */}
                <div
                  className={`scope-option-card ${selectedScope === "All products" ? "card-selected" : ""}`}
                  onClick={() => setSelectedScope("All products")}
                  style={{ padding: "16px", cursor: "pointer" }}
                >
                  <div className="scope-card-radio" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div className={`custom-radio ${selectedScope === "All products" ? "radio-checked" : ""}`}>
                      {selectedScope === "All products" && <div className="radio-inner-dot" />}
                    </div>
                    <ShirtIcon size={16} color="#7C3AED" />
                    <span className="scope-card-label" style={{ fontWeight: 700, fontSize: "14px" }}>All Products in Store</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                    Applies automatically to every single product and variant in your entire store catalog.
                  </p>
                </div>

                {/* 2. Specific collections */}
                <div
                  className={`scope-option-card ${selectedScope === "Specific collections" ? "card-selected" : ""}`}
                  onClick={() => setSelectedScope("Specific collections")}
                  style={{ padding: "16px", cursor: "pointer" }}
                >
                  <div className="scope-card-radio" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div className={`custom-radio ${selectedScope === "Specific collections" ? "radio-checked" : ""}`}>
                      {selectedScope === "Specific collections" && <div className="radio-inner-dot" />}
                    </div>
                    <DocumentIcon size={16} color="#2563EB" />
                    <span className="scope-card-label" style={{ fontWeight: 700, fontSize: "14px" }}>Products in Specific Collections</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                    Applies only to products that belong to selected Shopify collections.
                  </p>
                </div>

                {/* 3. Specific vendors */}
                <div
                  className={`scope-option-card ${selectedScope === "Specific vendors" ? "card-selected" : ""}`}
                  onClick={() => setSelectedScope("Specific vendors")}
                  style={{ padding: "16px", cursor: "pointer" }}
                >
                  <div className="scope-card-radio" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div className={`custom-radio ${selectedScope === "Specific vendors" ? "radio-checked" : ""}`}>
                      {selectedScope === "Specific vendors" && <div className="radio-inner-dot" />}
                    </div>
                    <ShirtIcon size={16} color="#059669" />
                    <span className="scope-card-label" style={{ fontWeight: 700, fontSize: "14px" }}>Products from Specific Vendors</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                    Applies only to products matching specific vendor or brand names.
                  </p>
                </div>

                {/* 4. Product tags */}
                <div
                  className={`scope-option-card ${selectedScope === "Product tags" || selectedScope === "Products with tag" ? "card-selected" : ""}`}
                  onClick={() => setSelectedScope("Product tags")}
                  style={{ padding: "16px", cursor: "pointer" }}
                >
                  <div className="scope-card-radio" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div className={`custom-radio ${selectedScope === "Product tags" || selectedScope === "Products with tag" ? "radio-checked" : ""}`}>
                      {(selectedScope === "Product tags" || selectedScope === "Products with tag") && <div className="radio-inner-dot" />}
                    </div>
                    <TagIcon size={16} color="#D97706" />
                    <span className="scope-card-label" style={{ fontWeight: 700, fontSize: "14px" }}>Products with Specific Tags</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                    Applies only to products tagged with a specific product tag in Shopify.
                  </p>
                </div>
              </div>

              {/* Helper Inputs for Selected Option */}
              {selectedScope === "Specific collections" && (
                <div className="field-group mt-16" style={{ backgroundColor: "#F9FAFB", padding: "14px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                  <label className="field-label" style={{ fontWeight: 600 }}>Enter Target Collection Names (comma-separated)</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g. Snowboards, Accessories, Summer Sale"
                    value={scopeTargetValue}
                    onChange={(e) => setScopeTargetValue(e.target.value)}
                  />
                  <span style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px", display: "block" }}>
                    Only products inside these collections will automatically get SKUs.
                  </span>
                </div>
              )}

              {selectedScope === "Specific vendors" && (
                <div className="field-group mt-16" style={{ backgroundColor: "#F9FAFB", padding: "14px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                  <label className="field-label" style={{ fontWeight: 600 }}>Enter Target Vendor Names (comma-separated)</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g. Burton, Nike, Adidas"
                    value={scopeTargetValue}
                    onChange={(e) => setScopeTargetValue(e.target.value)}
                  />
                  <span style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px", display: "block" }}>
                    Only products from these vendors/brands will automatically get SKUs.
                  </span>
                </div>
              )}

              {(selectedScope === "Product tags" || selectedScope === "Products with tag") && (
                <div className="field-group mt-16" style={{ backgroundColor: "#F9FAFB", padding: "14px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                  <label className="field-label" style={{ fontWeight: 600 }}>Enter Target Product Tag</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g. VIP, new-arrival, summer-2025"
                    value={scopeTargetValue}
                    onChange={(e) => setScopeTargetValue(e.target.value)}
                  />
                  <span style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px", display: "block" }}>
                    Only products with this exact tag assigned in Shopify will automatically get SKUs.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: SKU Rule Configuration (Full Generate SKU Page Options) */}
          {currentStep === 3 && (
            <div className="wizard-step-container">
              <h4 className="wizard-step-title">3. Configure SKU Rule Structure</h4>
              <p className="wizard-step-desc">
                Customize prefix, sequence numbering, separator, SKU layout, and extra components for generated SKUs.
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
                    <option value="continue">Continue Previous Store Sequence</option>
                    <option value="disabled">Disabled (No Number Component)</option>
                    <option value="productId">Product ID Based</option>
                    <option value="variantId">Variant ID Based</option>
                    <option value="random">Random Alphanumeric Code (9A2F)</option>
                  </select>
                </div>

                {(bodyNumberType === "sequential" || bodyNumberType === "continue") && (
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

                {bodyNumberType === "disabled" && (
                  <div style={{ backgroundColor: "#F9FAFB", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", marginTop: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#374151" }}>
                      Body number is disabled. SKUs will be generated using only Prefix, Suffix, Layout, and Extra components without a body number.
                    </span>
                  </div>
                )}

                {(bodyNumberType === "productId" || bodyNumberType === "variantId") && (
                  <div style={{ backgroundColor: "#F9FAFB", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", marginTop: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#374151" }}>
                      Only the numeric digits of the Shopify {bodyNumberType === "productId" ? "Product ID" : "Variant ID"} will be used as the body number.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. SKU Layout Section */}
              <div className="mb-16">
                <SkuLayoutSection
                  skuComponents={skuComponents}
                  setSkuComponents={setSkuComponents}
                  onRemoveComponent={handleRemoveComponentFromLayout}
                />
              </div>

              {/* 4. Extra Components Section */}
              <div className="mb-16">
                <ExtraComponentsSection
                  productNameChar={productNameChar}
                  onProductNameCharChange={(val) => handleExtraComponentCharChange("productTitle", "Product Name", val, setProductNameChar)}
                  variantNameChar={variantNameChar}
                  onVariantNameCharChange={(val) => handleExtraComponentCharChange("variantTitle", "Variant Name", val, setVariantNameChar)}
                  productTypeChar={productTypeChar}
                  onProductTypeCharChange={(val) => handleExtraComponentCharChange("productType", "Product Type", val, setProductTypeChar)}
                  vendorChar={vendorChar}
                  onVendorCharChange={(val) => handleExtraComponentCharChange("productVendor", "Vendor", val, setVendorChar)}
                  variantOption1Char={variantOption1Char}
                  onVariantOption1CharChange={(val) => handleExtraComponentCharChange("variantOption1", "Variant Option 1", val, setVariantOption1Char)}
                  variantOption2Char={variantOption2Char}
                  onVariantOption2CharChange={(val) => handleExtraComponentCharChange("variantOption2", "Variant Option 2", val, setVariantOption2Char)}
                  variantOption3Char={variantOption3Char}
                  onVariantOption3CharChange={(val) => handleExtraComponentCharChange("variantOption3", "Variant Option 3", val, setVariantOption3Char)}
                />
              </div>

              {/* 5. Formatting & Processing Toggles */}
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
                      : bodyNumberType === "disabled"
                      ? "Disabled (No body number)"
                      : bodyNumberType === "variantId"
                      ? "Variant ID Based"
                      : bodyNumberType === "productId"
                      ? "Product ID Based"
                      : bodyNumberType === "random"
                      ? "Random Alphanumeric"
                      : "Continue Store Sequence"}
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
          <button className="btn-modal-submit" onClick={handleNext} disabled={isSubmitting} type="button">
            {isSubmitting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span className="btn-spinner" /> Saving...
              </span>
            ) : currentStep === 4 ? (
              initialRule ? "Save Changes" : "Save Automation"
            ) : (
              "Next →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
