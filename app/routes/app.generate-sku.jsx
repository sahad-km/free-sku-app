import React, { useState } from "react";
import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import GenerateSkuHeader from "../components/GenerateSKU/GenerateSkuHeader";
import StepIndicator from "../components/GenerateSKU/StepIndicator";
import BasicStructureSection from "../components/GenerateSKU/BasicStructureSection";
import BodyNumberSettingsSection from "../components/GenerateSKU/BodyNumberSettingsSection";
import OtherOptionsSection from "../components/GenerateSKU/OtherOptionsSection";
import SkuLayoutSection from "../components/GenerateSKU/SkuLayoutSection";
import ExtraComponentsSection from "../components/GenerateSKU/ExtraComponentsSection";
import SeparatorSection from "../components/GenerateSKU/SeparatorSection";
import LivePreviewSidebar from "../components/GenerateSKU/LivePreviewSidebar";
import ScopeAndCreditsSidebar from "../components/GenerateSKU/ScopeAndCreditsSidebar";
import UpgradeAndHelpSidebar from "../components/GenerateSKU/UpgradeAndHelpSidebar";
import {
  MetafieldFormModal,
  AddComponentModal,
  FullPreviewModal,
} from "../components/GenerateSKU/Modals";
import "../styles/app.generate-sku.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function GenerateSkuPage() {
  const navigate = useNavigate();

  // ─── Form State ───────────────────────────────────────────────────────
  const [prefix, setPrefix] = useState("STRT");
  const [body, setBody] = useState("0");
  const [suffix, setSuffix] = useState("END");

  const [bodyNumberType, setBodyNumberType] = useState("sequential");
  const [startNumber, setStartNumber] = useState(1);
  const [numberPadding, setNumberPadding] = useState(4);
  const [incrementStep, setIncrementStep] = useState(1);

  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [individualVariantNumbering, setIndividualVariantNumbering] = useState(true);
  const [removeSpaces, setRemoveSpaces] = useState(false);
  const [capitalizeAll, setCapitalizeAll] = useState(false);

  const [skuComponents, setSkuComponents] = useState([
    { id: "prefix_1", type: "prefix", label: "Prefix", value: "STRT" },
    { id: "body_1", type: "body", label: "Body", value: "0001" },
    { id: "suffix_1", type: "suffix", label: "Suffix", value: "END" },
  ]);

  const [productMetafield, setProductMetafield] = useState("");
  const [variantMetafield, setVariantMetafield] = useState("");
  const [productVendor, setProductVendor] = useState("");
  const [variantOption1, setVariantOption1] = useState("");
  const [productType, setProductType] = useState("");
  const [variantOption2, setVariantOption2] = useState("");

  const [separator, setSeparator] = useState("none");
  const [customSeparator, setCustomSeparator] = useState("");

  // ─── UI & Modal States ────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isMetafieldModalOpen, setIsMetafieldModalOpen] = useState(false);
  const [metafieldModalDefaultLevel, setMetafieldModalDefaultLevel] = useState("product");
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [isFullPreviewModalOpen, setIsFullPreviewModalOpen] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("SKU rule saved as draft!");
    }, 600);
  };

  const handleNextStep = () => {
    // Validate required fields
    if (bodyNumberType === "sequential" && (!startNumber || parseInt(startNumber, 10) < 0)) {
      alert("Please provide a valid start number.");
      return;
    }
    navigate("/app/generate-history");
  };

  const handleOpenAddMetafieldCustom = (level) => {
    setMetafieldModalDefaultLevel(level === "variantMetafield" ? "variant" : "product");
    setIsMetafieldModalOpen(true);
  };

  const handleAddMetafieldToComponents = (metafieldObj) => {
    setSkuComponents((prev) => [...prev, metafieldObj]);
  };

  const handleAddComponentToLayout = (compObj) => {
    setSkuComponents((prev) => [...prev, compObj]);
  };

  const currentConfig = {
    prefix,
    body,
    suffix,
    bodyNumberType,
    startNumber,
    numberPadding,
    incrementStep,
    skuComponents,
    separator,
    customSeparator,
    removeSpaces,
    capitalizeAll,
  };

  return (
    <div className="generate-page-root">
      <div className="generate-page-inner">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <GenerateSkuHeader
          onSaveDraft={handleSaveDraft}
          onNextStep={handleNextStep}
          isSaving={isSaving}
        />

        {/* ── 2-Column Main Content & Sidebar Layout ────────────────── */}
        <div className="main-two-column-layout">
          {/* Left Column: Form Configuration Sections */}
          <div className="main-left-column">
            {/* ── Step Progress Indicator ────────────────────────────────── */}
            <StepIndicator activeStep={1} />

            <BasicStructureSection
              prefix={prefix}
              setPrefix={setPrefix}
              body={body}
              setBody={setBody}
              suffix={suffix}
              setSuffix={setSuffix}
            />

            <BodyNumberSettingsSection
              bodyNumberType={bodyNumberType}
              setBodyNumberType={setBodyNumberType}
              startNumber={startNumber}
              setStartNumber={setStartNumber}
              numberPadding={numberPadding}
              setNumberPadding={setNumberPadding}
              incrementStep={incrementStep}
              setIncrementStep={setIncrementStep}
              prefix={prefix}
              suffix={suffix}
              separator={separator}
              customSeparator={customSeparator}
            />

            <OtherOptionsSection
              overwriteExisting={overwriteExisting}
              setOverwriteExisting={setOverwriteExisting}
              individualVariantNumbering={individualVariantNumbering}
              setIndividualVariantNumbering={setIndividualVariantNumbering}
              removeSpaces={removeSpaces}
              setRemoveSpaces={setRemoveSpaces}
              capitalizeAll={capitalizeAll}
              setCapitalizeAll={setCapitalizeAll}
            />

            <SkuLayoutSection
              skuComponents={skuComponents}
              setSkuComponents={setSkuComponents}
              onOpenAddComponent={() => setIsAddComponentModalOpen(true)}
            />

            <ExtraComponentsSection
              productMetafield={productMetafield}
              setProductMetafield={setProductMetafield}
              variantMetafield={variantMetafield}
              setVariantMetafield={setVariantMetafield}
              productVendor={productVendor}
              setProductVendor={setProductVendor}
              variantOption1={variantOption1}
              setVariantOption1={setVariantOption1}
              productType={productType}
              setProductType={setProductType}
              variantOption2={variantOption2}
              setVariantOption2={setVariantOption2}
              onAddMetafieldCustom={handleOpenAddMetafieldCustom}
            />

            <SeparatorSection
              separator={separator}
              setSeparator={setSeparator}
              customSeparator={customSeparator}
              setCustomSeparator={setCustomSeparator}
            />
          </div>

          {/* Right Column: Live Preview & Summary Sidebar */}
          <div className="sidebar-right-column">
            <LivePreviewSidebar
              prefix={prefix}
              body={body}
              suffix={suffix}
              bodyNumberType={bodyNumberType}
              startNumber={startNumber}
              numberPadding={numberPadding}
              incrementStep={incrementStep}
              skuComponents={skuComponents}
              separator={separator}
              customSeparator={customSeparator}
              removeSpaces={removeSpaces}
              capitalizeAll={capitalizeAll}
              onViewFullPreview={() => setIsFullPreviewModalOpen(true)}
            />

            <ScopeAndCreditsSidebar
              onChangeScope={() => alert("Scope selector modal: All products selected")}
            />

            <UpgradeAndHelpSidebar />
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <MetafieldFormModal
        isOpen={isMetafieldModalOpen}
        onClose={() => setIsMetafieldModalOpen(false)}
        onAddMetafield={handleAddMetafieldToComponents}
        defaultLevel={metafieldModalDefaultLevel}
      />

      <AddComponentModal
        isOpen={isAddComponentModalOpen}
        onClose={() => setIsAddComponentModalOpen(false)}
        onSelectComponent={handleAddComponentToLayout}
      />

      <FullPreviewModal
        isOpen={isFullPreviewModalOpen}
        onClose={() => setIsFullPreviewModalOpen(false)}
        config={currentConfig}
      />
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
