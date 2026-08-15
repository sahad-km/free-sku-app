import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "./Icons";

export default function BasicStructureSection({
  prefix,
  setPrefix,
  body,
  setBody,
  suffix,
  setSuffix,
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="card section-card">
      <div
        className="section-card-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="section-header-left">
          <div className="section-step-number">1</div>
          <div>
            <h2 className="section-title">Basic structure</h2>
            <p className="section-subtitle">
              Define the prefix, body and suffix for your SKU.
            </p>
          </div>
        </div>
        <button className="accordion-toggle-btn" type="button">
          {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="section-card-body">
          <div className="basic-structure-row">
            <div className="field-group flex-1">
              <label className="field-label">
                Prefix <span className="label-optional">(optional)</span>
              </label>
              <input
                type="text"
                className="text-input"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. STRT"
              />
            </div>

            <span className="field-separator">-</span>

            <div className="field-group flex-1">
              <label className="field-label">
                Body <span className="label-required">(required)</span>
              </label>
              <input
                type="text"
                className="text-input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. 0"
              />
            </div>

            <span className="field-separator">-</span>

            <div className="field-group flex-1">
              <label className="field-label">
                Suffix <span className="label-optional">(optional)</span>
              </label>
              <input
                type="text"
                className="text-input"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="e.g. END"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
