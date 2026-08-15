import React from "react";
import { ArrowRightIcon } from "./Icons";

export default function StepIndicator({ activeStep = 1 }) {
  const steps = [
    {
      number: 1,
      title: "Build rule",
      subtitle: "Design your SKU structure",
    },
    {
      number: 2,
      title: "Select scope",
      subtitle: "Choose products & variants",
    },
    {
      number: 3,
      title: "Review & generate",
      subtitle: "Preview and confirm",
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
