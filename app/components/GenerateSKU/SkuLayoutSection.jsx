import React, { useState } from "react";
import {
  DragHandleIcon,
  CloseIcon,
  PlusIcon,
  InfoIcon,
} from "./Icons";

export default function SkuLayoutSection({
  skuComponents,
  setSkuComponents,
  onOpenAddComponent,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newComponents = [...skuComponents];
    const draggedItem = newComponents[draggedIndex];
    newComponents.splice(draggedIndex, 1);
    newComponents.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setSkuComponents(newComponents);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveComponent = (id, type) => {
    if (type === "body") {
      alert("Body component is required in the SKU layout.");
      return;
    }
    setSkuComponents(skuComponents.filter((comp) => comp.id !== id));
  };

  const getThemeClass = (type) => {
    switch (type) {
      case "prefix":
        return "comp-purple";
      case "body":
        return "comp-blue";
      case "suffix":
        return "comp-green";
      case "productMetafield":
      case "product_vendor":
      case "product_type":
        return "comp-orange";
      case "variantMetafield":
      case "variant_option1":
      case "variant_option2":
        return "comp-magenta";
      default:
        return "comp-purple";
    }
  };

  return (
    <div className="card section-card">
      <div className="section-card-header">
        <div className="section-header-left">
          <div className="section-step-number">4</div>
          <div>
            <h2 className="section-title">SKU layout</h2>
            <p className="section-subtitle">
              Drag and drop components to build your SKU format.
            </p>
          </div>
        </div>
      </div>

      <div className="section-card-body">
        <div className="sku-layout-row">
          {skuComponents.map((comp, idx) => (
            <div
              key={comp.id || idx}
              className={`sku-component-card ${getThemeClass(
                comp.type
              )} ${draggedIndex === idx ? "is-dragging" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <div className="comp-card-header">
                <div className="comp-drag-handle" title="Drag to reorder">
                  <DragHandleIcon size={14} />
                </div>
                <span className="comp-name">{comp.label || comp.name}</span>
                {comp.type !== "body" && (
                  <button
                    className="comp-remove-btn"
                    onClick={() => handleRemoveComponent(comp.id, comp.type)}
                    type="button"
                    title="Remove component"
                  >
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <div className="comp-value-badge">{comp.value || "STRT"}</div>
            </div>
          ))}

          {/* Add Component Card Button */}
          <button
            className="add-component-card-btn"
            onClick={onOpenAddComponent}
            type="button"
          >
            <PlusIcon size={16} color="#6B7280" />
            <span>Add component</span>
          </button>
        </div>

        <div className="reorder-tip-footer">
          <span>Drag components to reorder them</span>
          <InfoIcon size={14} color="#9CA3AF" />
        </div>
      </div>
    </div>
  );
}
