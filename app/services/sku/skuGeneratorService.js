/**
 * Canonical SKU Generator Service
 * ONE deterministic SKU engine shared by Live Preview, Full Preview, and Production Generation.
 */

/**
 * Format body numeric string based on bodyNumberType
 */
export function calculateBodyValue({
  product = {},
  variant = {},
  bodyNumberType = "sequential",
  startNumber = 1,
  numberPadding = 4,
  incrementStep = 1,
  index = 0,
  body = "",
  sequenceNumber = null,
  randomDigits = 4,
}) {
  if (bodyNumberType === "disabled") {
    return "";
  }

  if (bodyNumberType === "productId") {
    // Extract ONLY numeric digits from product ID
    const rawId = (product.id || product.productId || "").toString();
    const digitsOnly = rawId.replace(/\D/g, "");
    return digitsOnly || "0";
  }

  if (bodyNumberType === "variantId") {
    // Extract ONLY numeric digits from variant ID
    const rawId = (variant.id || variant.variantId || "").toString();
    const digitsOnly = rawId.replace(/\D/g, "");
    return digitsOnly || "0";
  }

  if (bodyNumberType === "random") {
    const digits = Math.max(1, Math.min(10, parseInt(randomDigits, 10) || 4));
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const rand = Math.floor(min + Math.random() * (max - min + 1));
    return rand.toString().padStart(digits, "0");
  }

  // Sequential or Continue from last
  const startNum = parseInt(startNumber, 10) || 1;
  const stepNum = parseInt(incrementStep, 10) || 1;
  const padNum = Math.max(0, parseInt(numberPadding, 10) || 0);

  const numVal = sequenceNumber !== null && sequenceNumber !== undefined
    ? sequenceNumber
    : startNum + index * stepNum;

  return numVal.toString().padStart(padNum, "0");
}

/**
 * Helper to fetch a metafield value from product or variant
 */
export function getMetafieldValue(ownerObj, namespace, key) {
  if (!ownerObj || !namespace || !key) return "";

  // 1. If ownerObj.metafields is a Map or Object: ownerObj.metafields[`${namespace}.${key}`]
  if (ownerObj.metafields) {
    if (typeof ownerObj.metafields === "object" && !Array.isArray(ownerObj.metafields)) {
      const directKey = `${namespace}.${key}`;
      if (ownerObj.metafields[directKey] !== undefined) {
        return ownerObj.metafields[directKey]?.value ?? ownerObj.metafields[directKey] ?? "";
      }
    }

    // 2. If ownerObj.metafields is an array of { namespace, key, value }
    if (Array.isArray(ownerObj.metafields)) {
      const found = ownerObj.metafields.find(
        (m) => m && m.namespace === namespace && m.key === key
      );
      if (found) return found.value || "";
    }
  }

  return "";
}

/**
 * Clean up text for SKU parts according to rules
 */
export function cleanPartText(text, options = {}) {
  if (text === null || text === undefined) return "";
  let str = String(text).trim();

  if (options.removeSpaces) {
    str = str.replace(/\s+/g, "");
  }

  return str;
}

/**
 * Canonical SKU Generator Function
 */
export function generateSkuForVariant({
  product = {},
  variant = {},
  config = {},
  index = 0,
  sequenceNumber = null,
}) {
  const {
    prefix = "",
    body = "",
    suffix = "",
    bodyNumberType = "sequential",
    startNumber = 1,
    numberPadding = 4,
    incrementStep = 1,
    randomDigits = 4,
    skuComponents = [],
    separator = "none",
    customSeparator = "",
    removeSpaces = false,
    capitalizeAll = false,
    overwriteExisting = true,
  } = config;

  const currentSku = variant.sku || variant.currentSku || "";

  // If overwriteExisting is disabled and variant already has SKU, skip!
  if (!overwriteExisting && currentSku && currentSku.trim().length > 0) {
    return {
      sku: currentSku,
      status: "SKIPPED_EXISTING_SKU",
      isSkipped: true,
      reason: "Variant already has an existing SKU and overwrite is disabled.",
    };
  }

  // Determine separator string
  let sep = "";
  if (separator === "dash" || separator === "-") sep = "-";
  else if (separator === "underscore" || separator === "_") sep = "_";
  else if (separator === "pipe" || separator === "|") sep = "|";
  else if (separator === "slash" || separator === "/") sep = "/";
  else if (separator === "dot" || separator === ".") sep = ".";
  else if (separator === "custom") sep = customSeparator || "";
  else if (separator === "none") sep = "";

  const numericBodyVal = calculateBodyValue({
    product,
    variant,
    bodyNumberType,
    startNumber,
    numberPadding,
    incrementStep,
    index,
    body,
    sequenceNumber,
    randomDigits,
  });

  // Evaluate middle components in the user's configured drag-and-drop layout order
  const middleComponentsToUse = (Array.isArray(skuComponents) ? skuComponents : []).filter(
    (comp) => comp.type !== "prefix" && comp.type !== "suffix"
  );

  const middleParts = middleComponentsToUse.map((comp) => {
    const compType = comp.type;

    if (compType === "body") {
      if (bodyNumberType === "disabled") return "";
      return numericBodyVal;
    }
    if (compType === "productTitle" || compType === "productName") {
      const raw = product.title || "";
      const setting = comp.charLength || config.productNameChar;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "productVendor" || compType === "vendor") {
      const raw = product.vendor || "";
      const setting = comp.charLength || config.vendorChar;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "productType" || compType === "type") {
      const raw = product.productType || product.type || "";
      const setting = comp.charLength || config.productTypeChar;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "variantTitle" || compType === "variantName") {
      const raw = variant.title || "";
      const setting = comp.charLength || config.variantNameChar;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "variantOption1" || compType === "option1") {
      const raw = variant.option1 || (variant.selectedOptions && variant.selectedOptions[0]?.value) || "";
      const setting = comp.charLength || config.variantOption1Char;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "variantOption2" || compType === "option2") {
      const raw = variant.option2 || (variant.selectedOptions && variant.selectedOptions[1]?.value) || "";
      const setting = comp.charLength || config.variantOption2Char;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "variantOption3" || compType === "option3") {
      const raw = variant.option3 || (variant.selectedOptions && variant.selectedOptions[2]?.value) || "";
      const setting = comp.charLength || config.variantOption3Char;
      if (!setting || setting === "full") return raw;
      const len = parseInt(setting, 10);
      return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
    }
    if (compType === "oldSku" || compType === "currentSku") {
      return currentSku;
    }

    return comp.value || "";
  });

  // Assemble full SKU: Fixed Prefix -> Draggable Middle Parts -> Fixed Suffix
  const activeParts = [];
  if (prefix && String(prefix).trim()) {
    activeParts.push(cleanPartText(prefix, { removeSpaces }));
  }

  middleParts.forEach((p) => {
    const cleaned = cleanPartText(p, { removeSpaces });
    if (cleaned !== null && cleaned !== undefined && cleaned !== "") {
      activeParts.push(cleaned);
    }
  });

  if (suffix && String(suffix).trim()) {
    activeParts.push(cleanPartText(suffix, { removeSpaces }));
  }

  // Join parts with separator
  let finalSku = activeParts.join(sep);

  if (capitalizeAll) {
    finalSku = finalSku.toUpperCase();
  }

  // Fallback if final generated SKU is empty
  if (!finalSku) {
    finalSku = `SKU-${numericBodyVal || "0001"}`;
  }

  return {
    sku: finalSku,
    status: "READY",
    isSkipped: false,
  };
}
