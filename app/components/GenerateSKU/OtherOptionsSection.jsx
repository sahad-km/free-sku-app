import React from "react";
import { CheckIcon } from "./Icons";

export default function OtherOptionsSection({
  overwriteExisting,
  setOverwriteExisting,
  individualVariantNumbering,
  setIndividualVariantNumbering,
  removeSpaces,
  setRemoveSpaces,
  capitalizeAll,
  setCapitalizeAll,
}) {
  const options = [
    {
      id: "overwrite",
      label: "Overwrite existing SKUs",
      description: "Replace SKUs if they already exist.",
      checked: overwriteExisting,
      onChange: (val) => setOverwriteExisting(val),
    },
    {
      id: "individualVariant",
      label: "Individual variant numbering",
      description: "Keep variant numbering independent.",
      checked: individualVariantNumbering,
      onChange: (val) => setIndividualVariantNumbering(val),
    },
    {
      id: "removeSpaces",
      label: "Remove spaces",
      description: "Remove spaces from generated SKUs.",
      checked: removeSpaces,
      onChange: (val) => setRemoveSpaces(val),
    },
    {
      id: "capitalizeAll",
      label: "Capitalize all letters",
      description: "Convert all letters to uppercase.",
      checked: capitalizeAll,
      onChange: (val) => setCapitalizeAll(val),
    },
  ];

  return (
    <div className="card section-card">
      <div className="section-card-header">
        <div className="section-header-left">
          <div className="section-step-number">3</div>
          <div>
            <h2 className="section-title">Other options</h2>
            <p className="section-subtitle">
              Fine-tune how SKUs are generated.
            </p>
          </div>
        </div>
      </div>

      <div className="section-card-body">
        <div className="other-options-grid">
          {options.map((opt) => (
            <label key={opt.id} className="custom-checkbox-row">
              <div className="checkbox-input-wrapper">
                <input
                  type="checkbox"
                  className="hidden-checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.onChange(e.target.checked)}
                />
                <div
                  className={`custom-checkbox-box ${
                    opt.checked ? "checkbox-checked" : ""
                  }`}
                >
                  {opt.checked && <CheckIcon size={12} color="#FFFFFF" />}
                </div>
              </div>
              <div className="checkbox-text-content">
                <span className="checkbox-label-text">{opt.label}</span>
                <p className="checkbox-desc-text">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
