import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon, PlusIcon } from "./Icons";

export default function ExtraComponentsSection({
  productMetafield,
  setProductMetafield,
  variantMetafield,
  setVariantMetafield,
  productVendor,
  setProductVendor,
  variantOption1,
  setVariantOption1,
  productType,
  setProductType,
  variantOption2,
  setVariantOption2,
  onAddMetafieldCustom,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handleSelectChange = (val, type) => {
    if (val === "__ADD_NEW__") {
      onAddMetafieldCustom(type);
      return;
    }
    if (type === "productMetafield") setProductMetafield(val);
    if (type === "variantMetafield") setVariantMetafield(val);
    if (type === "productVendor") setProductVendor(val);
    if (type === "variantOption1") setVariantOption1(val);
    if (type === "productType") setProductType(val);
    if (type === "variantOption2") setVariantOption2(val);
  };

  return (
    <div className="card section-card">
      <div
        className="section-card-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="section-header-left">
          <div className="section-step-number">5</div>
          <div>
            <div className="section-title-row">
              <h2 className="section-title">Extra components</h2>
              <span className="paid-pill-badge">Paid</span>
            </div>
            <p className="section-subtitle">
              Add product or variant metafields to enrich your SKU.
            </p>
          </div>
        </div>
        <button className="accordion-toggle-btn" type="button">
          {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="section-card-body">
          <div className="extra-components-grid">
            {/* Left Column: Product level */}
            <div className="extra-col">
              <div className="field-group">
                <label className="field-label">Product metafield</label>
                <select
                  className="select-input"
                  value={productMetafield}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "productMetafield")
                  }
                >
                  <option value="">Select metafield</option>
                  <option value="custom.material">custom.material</option>
                  <option value="custom.season">custom.season</option>
                  <option value="custom.brand">custom.brand</option>
                  <option value="__ADD_NEW__">+ Add new (Namespace + Key)...</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Product vendor</label>
                <select
                  className="select-input"
                  value={productVendor}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "productVendor")
                  }
                >
                  <option value="">Select metafield</option>
                  <option value="vendor.name">Vendor name</option>
                  <option value="vendor.code">Vendor code</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Product type</label>
                <select
                  className="select-input"
                  value={productType}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "productType")
                  }
                >
                  <option value="">Select metafield</option>
                  <option value="type.category">Category type</option>
                  <option value="type.code">Type code</option>
                </select>
              </div>
            </div>

            {/* Right Column: Variant level */}
            <div className="extra-col">
              <div className="field-group">
                <label className="field-label">Variant metafield</label>
                <select
                  className="select-input"
                  value={variantMetafield}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "variantMetafield")
                  }
                >
                  <option value="">Select metafield</option>
                  <option value="custom.color">custom.color</option>
                  <option value="custom.size">custom.size</option>
                  <option value="custom.style">custom.style</option>
                  <option value="__ADD_NEW__">+ Add new (Namespace + Key)...</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Variant option 1</label>
                <select
                  className="select-input"
                  value={variantOption1}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "variantOption1")
                  }
                >
                  <option value="">Select metafield</option>
                  <option value="option.size">Size (Option 1)</option>
                  <option value="option.color">Color (Option 1)</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Variant option 2</label>
                <select
                  className="select-input"
                  value={variantOption2}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, "variantOption2")
                  }
                >
                  <option value="">Select metafield</option>
                  <option value="option.style">Style (Option 2)</option>
                  <option value="option.material">Material (Option 2)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
