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
  body = "0",
  sequenceNumber = null,
}) {
  if (bodyNumberType === "disabled") {
    return body || "";
  }

  if (bodyNumberType === "productId") {
    // Extract raw numeric ID from GID if present
    const rawId = (product.id || product.productId || "").toString().replace(/^gid:\/\/shopify\/Product\//, "");
    return rawId || "0";
  }

  if (bodyNumberType === "variantId") {
    const rawId = (variant.id || variant.variantId || "").toString().replace(/^gid:\/\/shopify\/ProductVariant\//, "");
    return rawId || "0";
  }

  if (bodyNumberType === "random") {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return rand.toString();
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
  });

  // If no skuComponents array was provided or it's empty, use standard Prefix-Body-Suffix
  let componentsToUse = skuComponents;
  if (!Array.isArray(componentsToUse) || componentsToUse.length === 0) {
    componentsToUse = [
      { type: "prefix", value: prefix },
      { type: "body", value: numericBodyVal },
      { type: "suffix", value: suffix },
    ];
  }

  // Build component values
  const parts = componentsToUse.map((comp) => {
    const compType = comp.type;

    if (compType === "prefix") {
      return prefix || comp.value || "";
    }
    if (compType === "body") {
      return numericBodyVal || body || comp.value || "";
    }
    if (compType === "suffix") {
      return suffix || comp.value || "";
    }
    if (compType === "productTitle" || compType === "productName") {
      return product.title || "";
    }
    if (compType === "productVendor" || compType === "vendor") {
      return product.vendor || "";
    }
    if (compType === "productType" || compType === "type") {
      return product.productType || product.type || "";
    }
    if (compType === "variantTitle" || compType === "variantName") {
      return variant.title || "";
    }
    if (compType === "variantOption1" || compType === "option1") {
      return variant.option1 || (variant.selectedOptions && variant.selectedOptions[0]?.value) || "";
    }
    if (compType === "variantOption2" || compType === "option2") {
      return variant.option2 || (variant.selectedOptions && variant.selectedOptions[1]?.value) || "";
    }
    if (compType === "variantOption3" || compType === "option3") {
      return variant.option3 || (variant.selectedOptions && variant.selectedOptions[2]?.value) || "";
    }
    if (compType === "oldSku" || compType === "currentSku") {
      return currentSku;
    }
    if (compType === "productMetafield") {
      const ns = comp.namespace || (comp.value && comp.value.split(".")[0]);
      const k = comp.key || (comp.value && comp.value.split(".")[1]);
      return getMetafieldValue(product, ns, k) || comp.fallback || "";
    }
    if (compType === "variantMetafield") {
      const ns = comp.namespace || (comp.value && comp.value.split(".")[0]);
      const k = comp.key || (comp.value && comp.value.split(".")[1]);
      return getMetafieldValue(variant, ns, k) || comp.fallback || "";
    }

    return comp.value || "";
  });

  // Apply removeSpaces to individual parts
  const cleanedParts = parts
    .map((p) => cleanPartText(p, { removeSpaces }))
    .filter((p) => p !== null && p !== undefined && p !== "");

  // Join parts with separator
  let finalSku = cleanedParts.join(sep);

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
