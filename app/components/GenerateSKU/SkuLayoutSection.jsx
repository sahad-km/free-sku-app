import React, { useState } from "react";
import {
  DragHandleIcon,
  CloseIcon,
  PlusIcon,
  InfoIcon,
} from "./Icons";
import { showGlobalToast } from "../Common/Toast";

export default function SkuLayoutSection({
  skuComponents,
  setSkuComponents,
  onRemoveComponent,
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
      showGlobalToast("Body component is required in the SKU layout.", "warning");
      return;
    }
    if (onRemoveComponent) {
      onRemoveComponent(type, id);
    } else {
      setSkuComponents(skuComponents.filter((comp) => comp.id !== id));
    }
  };

  const getDisplayBadgeValue = (comp) => {
    let raw = comp.value;
    if (!raw) {
      if (comp.type === "prefix") raw = "STRT";
      else if (comp.type === "body") raw = "0001";
      else if (comp.type === "suffix") raw = "END";
      else if (comp.type === "productTitle" || comp.type === "productName") raw = "Snowboard";
      else if (comp.type === "variantTitle" || comp.type === "variantName") raw = "Black/L";
      else if (comp.type === "productType" || comp.type === "type") raw = "Snowboard";
      else if (comp.type === "productVendor" || comp.type === "vendor") raw = "Burton";
      else if (comp.type === "variantOption1" || comp.type === "option1") raw = "Large";
      else if (comp.type === "variantOption2" || comp.type === "option2") raw = "Black";
      else if (comp.type === "variantOption3" || comp.type === "option3") raw = "Pro";
      else raw = "VAL";
    }

    const charLen = comp.charLength;
    if (!charLen || charLen === "full") return raw;
    const num = parseInt(charLen, 10);
    return !isNaN(num) && num > 0 ? raw.substring(0, num) : raw;
  };

  const getThemeClass = (type) => {
    switch (type) {
      case "prefix":
        return "comp-purple";
      case "body":
        return "comp-blue";
      case "suffix":
        return "comp-green";
      case "productTitle":
      case "productName":
      case "productVendor":
      case "vendor":
      case "productType":
      case "type":
        return "comp-orange";
      case "variantTitle":
      case "variantName":
      case "variantOption1":
      case "variantOption2":
      case "variantOption3":
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

              <div className="comp-value-badge">{getDisplayBadgeValue(comp)}</div>
            </div>
          ))}
        </div>

        <div className="reorder-tip-footer">
          <span>Drag components to reorder them</span>
          <InfoIcon size={14} color="#9CA3AF" />
        </div>
      </div>
    </div>
  );
}
