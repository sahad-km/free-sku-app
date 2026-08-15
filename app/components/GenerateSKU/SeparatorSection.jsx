import React from "react";
import { SlashCircleIcon } from "./Icons";

export default function SeparatorSection({
  separator,
  setSeparator,
  customSeparator,
  setCustomSeparator,
}) {
  const options = [
    { id: "none", label: "No separator", icon: <SlashCircleIcon size={18} /> },
    { id: "dash", label: "Dash", char: "-" },
    { id: "underscore", label: "Underscore", char: "_" },
    { id: "pipe", label: "Pipe", char: "|" },
    { id: "slash", label: "Slash", char: "/" },
    { id: "dot", label: "Dot", char: "." },
    { id: "custom", label: "Define custom", char: "⚙" },
  ];

  return (
    <div className="card section-card">
      <div className="section-card-header">
        <div className="section-header-left">
          <div className="section-step-number">6</div>
          <div>
            <h2 className="section-title">Separator (optional)</h2>
            <p className="section-subtitle">
              Choose a separator to place between components.
            </p>
          </div>
        </div>
      </div>

      <div className="section-card-body">
        <div className="separator-options-grid">
          {options.map((opt) => {
            const isSelected = separator === opt.id;
            return (
              <button
                key={opt.id}
                className={`separator-card-btn ${
                  isSelected ? "separator-selected" : ""
                }`}
                onClick={() => setSeparator(opt.id)}
                type="button"
              >
                <div className="separator-icon-symbol">
                  {opt.icon ? opt.icon : opt.char}
                </div>
                <span className="separator-label">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {separator === "custom" && (
          <div className="custom-separator-input-box">
            <label className="field-label">Custom separator</label>
            <input
              type="text"
              className="text-input"
              value={customSeparator}
              onChange={(e) => setCustomSeparator(e.target.value)}
              placeholder="Enter custom separator (e.g. :: or ~)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
