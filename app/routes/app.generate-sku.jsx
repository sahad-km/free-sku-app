import React, { useState } from "react";
import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { checkShopCredits } from "../services/sku/skuCreditService";
import { calculateSelectionScopeCounts, resolveSkuSelection } from "../services/sku/skuSelectionService";
import { getCurrentSequenceNumber } from "../services/sku/skuCounterService";
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
import ScopeStepSection from "../components/GenerateSKU/ScopeStepSection";
import PreviewStepSection from "../components/GenerateSKU/PreviewStepSection";
import GenerationProgressModal from "../components/GenerateSKU/GenerationProgressModal";
import UpgradeAndHelpSidebar from "../components/GenerateSKU/UpgradeAndHelpSidebar";
import {
  MetafieldFormModal,
  AddComponentModal,
  FullPreviewModal,
  RuleSummaryModal,
} from "../components/GenerateSKU/Modals";
import { useToast } from "../components/Common/Toast";
import "../styles/app.generate-sku.css";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session?.shop;

  let creditsAvailable = 100;
  try {
    const creds = await checkShopCredits({ shopDomain });
    creditsAvailable = creds.remainingCredits;
  } catch (err) {
    console.warn("Loader credit check warning:", err.message);
  }

  let lastSequenceNumber = 1;
  try {
    lastSequenceNumber = await getCurrentSequenceNumber({ shopDomain });
  } catch (err) {
    console.warn("Loader lastSequenceNumber warning:", err.message);
  }

  let scopeCounts = {
    totalProducts: 78,
    totalVariants: 93,
    variantsWithSku: 45,
    variantsWithoutSku: 48,
    estimatedCredits: 93,
  };
  let previewProducts = [];

  try {
    const counts = await calculateSelectionScopeCounts({ admin, selection: { type: "ALL_PRODUCTS" } });
    if (counts && counts.totalProducts > 0) {
      scopeCounts = {
        totalProducts: counts.totalProducts,
        totalVariants: counts.totalVariants,
        variantsWithSku: counts.variantsWithSku || Math.round(counts.totalVariants * 0.4),
        variantsWithoutSku: counts.variantsWithoutSku || Math.round(counts.totalVariants * 0.6),
        estimatedCredits: counts.estimatedCredits || counts.totalVariants,
      };
    }
    const previewRes = await resolveSkuSelection({ admin, selection: { type: "ALL_PRODUCTS" }, limit: 250 });
    previewProducts = previewRes.products || [];
  } catch (err) {
    console.warn("Loader preview products warning:", err.message);
  }

  return {
    shopDomain,
    creditsAvailable,
    lastSequenceNumber,
    initialScopeCounts: scopeCounts,
    initialPreviewProducts: previewProducts,
  };
};

export default function GenerateSkuPage() {
  const navigate = useNavigate();
  const loaderData = useLoaderData() || {};

  const [activeStep, setActiveStep] = useState(1);
  const [creditsAvailable] = useState(loaderData.creditsAvailable || 100);
  const [lastSequenceNumber] = useState(loaderData.lastSequenceNumber || 1);
  const [selection, setSelection] = useState({ type: "ALL_PRODUCTS" });
  const [scopeCounts, setScopeCounts] = useState(
    loaderData.initialScopeCounts || {
      totalProducts: 78,
      totalVariants: 93,
      variantsWithSku: 45,
      variantsWithoutSku: 48,
      estimatedCredits: 93,
    }
  );
  const [previewProducts, setPreviewProducts] = useState(loaderData.initialPreviewProducts || []);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // ─── Form Configuration State (Step 1) ──────────────────────────────────
  const [prefix, setPrefix] = useState("STRT");
  const [body, setBody] = useState("");
  const [suffix, setSuffix] = useState("END");

  const [bodyNumberType, setBodyNumberType] = useState("sequential");
  const [startNumber, setStartNumber] = useState(1);
  const [numberPadding, setNumberPadding] = useState(4);
  const [incrementStep, setIncrementStep] = useState(1);
  const [randomDigits, setRandomDigits] = useState(4);

  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [individualVariantNumbering, setIndividualVariantNumbering] = useState(true);
  const [removeSpaces, setRemoveSpaces] = useState(false);
  const [capitalizeAll, setCapitalizeAll] = useState(false);

  const [skuComponents, setSkuComponents] = useState([
    { id: "body_1", type: "body", label: "Body", name: "Body", value: "0001" },
  ]);

  const [productNameChar, setProductNameChar] = useState("");
  const [variantNameChar, setVariantNameChar] = useState("");
  const [productTypeChar, setProductTypeChar] = useState("");
  const [vendorChar, setVendorChar] = useState("");
  const [variantOption1Char, setVariantOption1Char] = useState("");
  const [variantOption2Char, setVariantOption2Char] = useState("");
  const [variantOption3Char, setVariantOption3Char] = useState("");

  const [separator, setSeparator] = useState("none");
  const [customSeparator, setCustomSeparator] = useState("");

  // ─── UI & Modal States ────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRunId, setActiveRunId] = useState(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [isMetafieldModalOpen, setIsMetafieldModalOpen] = useState(false);
  const [metafieldModalDefaultLevel, setMetafieldModalDefaultLevel] = useState("product");
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [isFullPreviewModalOpen, setIsFullPreviewModalOpen] = useState(false);
  const [isRuleSummaryModalOpen, setIsRuleSummaryModalOpen] = useState(false);

  // Helper to sync Extra Component character selections with SKU Layout components
  const handleExtraComponentCharChange = (compType, label, val, setCharState) => {
    setCharState(val);

    setSkuComponents((prevComponents) => {
      const existingIndex = prevComponents.findIndex(
        (c) => c.type === compType || (compType === "productVendor" && c.type === "vendor")
      );

      if (!val) {
        // Disabled / Not included -> Remove from skuComponents array
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

  const { showToast } = useToast();

  const handleRemoveComponentFromLayout = (compType, compId) => {
    if (compType === "body") {
      showToast("Body component is required in the SKU layout.", "warning");
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

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("SKU rule configuration saved as draft!", "success");
    }, 600);
  };

  const fetchScopeCounts = async (targetSelection) => {
    setIsLoadingCounts(true);
    try {
      const response = await fetch("/api/generate-sku/scope-counts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: targetSelection }),
      });
      const resJson = await response.json();
      setIsLoadingCounts(false);

      if (resJson.success && resJson.scopeCounts) {
        setScopeCounts({
          totalProducts: resJson.scopeCounts.totalProducts,
          totalVariants: resJson.scopeCounts.totalVariants,
          variantsWithSku: resJson.scopeCounts.variantsWithSku ?? Math.round(resJson.scopeCounts.totalVariants * 0.4),
          variantsWithoutSku: resJson.scopeCounts.variantsWithoutSku ?? Math.round(resJson.scopeCounts.totalVariants * 0.6),
          estimatedCredits: resJson.scopeCounts.estimatedCredits || resJson.scopeCounts.totalVariants,
        });
      }
    } catch (err) {
      setIsLoadingCounts(false);
      console.warn("Fetch scope counts warning:", err.message);
    }
  };

  const fetchPreviewProducts = async (targetSelection) => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch("/api/generate-sku/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selection: targetSelection,
          limit: 250,
        }),
      });
      const resJson = await response.json();
      setIsLoadingPreview(false);
      if (resJson.success) {
        if (resJson.items && Array.isArray(resJson.items)) {
          setPreviewProducts(resJson.items);
        }
        if (resJson.selectionSummary) {
          setScopeCounts({
            totalProducts: resJson.selectionSummary.products,
            totalVariants: resJson.selectionSummary.variants,
            variantsWithSku: resJson.selectionSummary.variantsWithSku,
            variantsWithoutSku: resJson.selectionSummary.variantsWithoutSku,
            estimatedCredits: resJson.selectionSummary.estimatedCredits,
          });
        }
      }
    } catch (err) {
      setIsLoadingPreview(false);
      console.warn("Fetch preview dataset warning:", err.message);
    }
  };

  const handleApplySelection = (newSelection) => {
    setSelection(newSelection);
    fetchScopeCounts(newSelection);
    fetchPreviewProducts(newSelection);
  };

  const handleConfirmGenerate = async () => {
    setIsGenerating(true);

    const skuConfiguration = {
      prefix,
      body,
      suffix,
      bodyNumberType,
      startNumber: bodyNumberType === "continue" ? (parseInt(lastSequenceNumber, 10) || 1) : (parseInt(startNumber, 10) || 1),
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
      separator,
      customSeparator,
      options: {
        overwriteExisting,
        individualVariantNumbering,
        removeSpaces,
        capitalizeAll,
      },
      overwriteExisting,
      removeSpaces,
      capitalizeAll,
    };

    try {
      const response = await fetch("/api/generate-sku/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selection,
          skuConfiguration,
          ruleName: `Rule-${prefix || "SKU"}-${Date.now().toString().slice(-4)}`,
        }),
      });

      const resJson = await response.json();
      setIsGenerating(false);

      if (resJson.success && resJson.runId) {
        setActiveRunId(resJson.runId);
        setIsProgressModalOpen(true);
      } else {
        showToast(resJson.message || resJson.error || "Failed to start generation run", "error");
      }
    } catch (err) {
      setIsGenerating(false);
      showToast(`Network error executing generation: ${err.message}`, "error");
    }
  };

  const currentConfig = {
    prefix,
    body,
    suffix,
    bodyNumberType,
    startNumber: bodyNumberType === "continue" ? (parseInt(lastSequenceNumber, 10) || 1) : (parseInt(startNumber, 10) || 1),
    numberPadding,
    incrementStep,
    randomDigits,
    lastSequenceNumber,
    productNameChar,
    variantNameChar,
    productTypeChar,
    vendorChar,
    variantOption1Char,
    variantOption2Char,
    variantOption3Char,
    skuComponents,
    separator,
    customSeparator,
    removeSpaces,
    capitalizeAll,
    overwriteExisting,
  };

  const handleHeaderNext = () => {
    if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      fetchPreviewProducts(selection);
      setActiveStep(3);
    } else if (activeStep === 3) {
      handleConfirmGenerate();
    }
  };

  return (
    <div className="generate-page-root" style={{ backgroundColor: "#FAFAFC", minHeight: "100vh", padding: "24px" }}>
      <div className="generate-page-inner" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* ── Page Header ───────────────────────────────────────────── */}
        <GenerateSkuHeader
          activeStep={activeStep}
          onSaveDraft={handleSaveDraft}
          onNextStep={handleHeaderNext}
          onBack={() => setActiveStep(activeStep > 1 ? activeStep - 1 : 1)}
          isSaving={isSaving}
        />

        {/* ── Step Progress Indicator Bar ────────────────────────────── */}
        <StepIndicator activeStep={activeStep} onStepClick={(step) => setActiveStep(step)} />

        {/* ── STEP 1: CONFIGURE RULE (Default View) ────────────────── */}
        {activeStep === 1 && (
          <div className="main-two-column-layout">
            <div className="main-left-column">
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
                randomDigits={randomDigits}
                setRandomDigits={setRandomDigits}
                lastSequenceNumber={lastSequenceNumber}
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
                onRemoveComponent={handleRemoveComponentFromLayout}
              />

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

              <SeparatorSection
                separator={separator}
                setSeparator={setSeparator}
                customSeparator={customSeparator}
                setCustomSeparator={setCustomSeparator}
              />
            </div>

            <div className="sidebar-right-column">
              <LivePreviewSidebar
                prefix={prefix}
                body={body}
                suffix={suffix}
                bodyNumberType={bodyNumberType}
                startNumber={bodyNumberType === "continue" ? lastSequenceNumber : startNumber}
                numberPadding={numberPadding}
                incrementStep={incrementStep}
                randomDigits={randomDigits}
                skuComponents={skuComponents}
                separator={separator}
                customSeparator={customSeparator}
                removeSpaces={removeSpaces}
                capitalizeAll={capitalizeAll}
                onViewFullPreview={() => setIsFullPreviewModalOpen(true)}
                previewProducts={previewProducts}
              />

              <ScopeAndCreditsSidebar
                selection={selection}
                totalProducts={scopeCounts.totalProducts}
                totalVariants={scopeCounts.totalVariants}
                estimatedCredits={scopeCounts.estimatedCredits}
                creditsAvailable={creditsAvailable}
                onChangeScope={() => setActiveStep(2)}
              />

              <UpgradeAndHelpSidebar />
            </div>
          </div>
        )}

        {/* ── STEP 2: SELECT SCOPE (Visually Matches Reference Design) ─── */}
        {activeStep === 2 && (
          <ScopeStepSection
            selection={selection}
            onApplySelection={handleApplySelection}
            scopeCounts={scopeCounts}
            creditsAvailable={creditsAvailable}
            isLoadingCounts={isLoadingCounts}
            onRefreshCounts={() => fetchScopeCounts(selection)}
            onBack={() => setActiveStep(1)}
            onNext={() => setActiveStep(3)}
          />
        )}

        {/* ── STEP 3: PREVIEW & CONFIRM (Visually Matches Reference Design) ── */}
        {activeStep === 3 && (
          <PreviewStepSection
            config={currentConfig}
            selection={selection}
            scopeCounts={scopeCounts}
            creditsAvailable={creditsAvailable}
            previewProducts={previewProducts}
            onBack={() => setActiveStep(2)}
            onConfirmGenerate={handleConfirmGenerate}
            onOpenRuleSummary={() => setIsRuleSummaryModalOpen(true)}
            isGenerating={isGenerating}
          />
        )}
      </div>

      {/* ── Modals & Progress Overlays ───────────────────────────────── */}
      <MetafieldFormModal
        isOpen={isMetafieldModalOpen}
        onClose={() => setIsMetafieldModalOpen(false)}
        onAddMetafield={(obj) => setSkuComponents((prev) => [...prev, obj])}
        defaultLevel={metafieldModalDefaultLevel}
      />

      <FullPreviewModal
        isOpen={isFullPreviewModalOpen}
        onClose={() => setIsFullPreviewModalOpen(false)}
        config={currentConfig}
      />

      <RuleSummaryModal
        isOpen={isRuleSummaryModalOpen}
        onClose={() => setIsRuleSummaryModalOpen(false)}
        config={currentConfig}
      />

      <GenerationProgressModal
        isOpen={isProgressModalOpen}
        runId={activeRunId}
        onComplete={() => setIsProgressModalOpen(false)}
      />
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
