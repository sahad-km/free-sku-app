import React from "react";
import { ArrowRightIcon } from "./Icons";

export default function StepIndicator({ activeStep = 1, onStepClick }) {
  const steps = [
    {
      number: 1,
      title: "1. Configure Rule",
      subtitle: "Design SKU structure",
    },
    {
      number: 2,
      title: "2. Select Scope",
      subtitle: "Choose target products & variants",
    },
    {
      number: 3,
      title: "3. Preview & Confirm",
      subtitle: "Review SKUs and confirm run",
    },
  ];

  return (
    <div className="card step-indicator-card">
      <div className="step-indicator-row">
        {steps.map((step, idx) => {
          const isActive = step.number === activeStep;
          const isCompleted = step.number < activeStep;

          return (
            <React.Fragment key={step.number}>
              <div
                className={`step-item ${isActive ? "step-active" : ""} ${
                  isCompleted ? "step-completed" : ""
                }`}
                onClick={() => onStepClick && onStepClick(step.number)}
                style={{ cursor: onStepClick ? "pointer" : "default" }}
              >
                <div className={`step-badge ${isActive ? "badge-active" : ""}`}>
                  {step.number}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-subtitle">{step.subtitle}</div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="step-arrow">
                  <ArrowRightIcon size={14} color="#D1D5DB" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
