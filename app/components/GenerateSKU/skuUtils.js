// Utility functions for live SKU preview generation

export const initialProducts = [
  {
    id: 1,
    title: "The Minimal Snowboard",
    vendor: "Burton",
    type: "Snowboard",
    material: "Carbon",
    color: "Black",
    variantId: "84291-01",
    productId: "84291",
    thumbnailBg: "bg-teal",
  },
  {
    id: 2,
    title: "The Videographer Snowboard",
    vendor: "Salomon",
    type: "Snowboard",
    material: "Wood",
    color: "Purple",
    variantId: "84291-02",
    productId: "84292",
    thumbnailBg: "bg-purple",
  },
  {
    id: 3,
    title: "The Draft Snowboard",
    vendor: "K2",
    type: "Snowboard",
    material: "Fiberglass",
    color: "Cyan",
    variantId: "84291-03",
    productId: "84293",
    thumbnailBg: "bg-cyan",
  },
  {
    id: 4,
    title: "Gift Card - $10",
    vendor: "Store",
    type: "Gift Card",
    material: "Digital",
    color: "Orange",
    variantId: "84291-04",
    productId: "84294",
    thumbnailBg: "bg-orange",
  },
  {
    id: 5,
    title: "Gift Card - $25",
    vendor: "Store",
    type: "Gift Card",
    material: "Digital",
    color: "Gold",
    variantId: "84291-05",
    productId: "84295",
    thumbnailBg: "bg-gold",
  },
];

export function generatePreviewSku({
  product = {},
  variant = {},
  index = 0,
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
}) {
  const pObj = product?.rawProduct || product?.product || product || {};
  const vObj = variant || product?.rawVariant || product?.variant || pObj.variants?.[0] || pObj;

  // Determine separator string
  let sep = "";
  if (separator === "dash" || separator === "-") sep = "-";
  else if (separator === "underscore" || separator === "_") sep = "_";
  else if (separator === "pipe" || separator === "|") sep = "|";
  else if (separator === "slash" || separator === "/") sep = "/";
  else if (separator === "dot" || separator === ".") sep = ".";
  else if (separator === "custom") sep = customSeparator || "";
  else if (separator === "none") sep = "";

  // Compute body numeric value based on bodyNumberType
  let numericBodyVal = "";
  const startNum = parseInt(startNumber, 10) || 1;
  const stepNum = parseInt(incrementStep, 10) || 1;
  const padNum = Math.max(0, parseInt(numberPadding, 10) || 0);

  if (bodyNumberType === "sequential" || bodyNumberType === "continue") {
    const currentNum = startNum + index * stepNum;
    numericBodyVal = currentNum.toString().padStart(padNum, "0");
  } else if (bodyNumberType === "disabled") {
    numericBodyVal = "";
  } else if (bodyNumberType === "productId") {
    const rawId = (pObj.productId || pObj.id || "").toString();
    numericBodyVal = rawId.replace(/\D/g, "");
  } else if (bodyNumberType === "variantId") {
    const rawId = (vObj.variantId || vObj.id || pObj.variantId || "").toString();
    numericBodyVal = rawId.replace(/\D/g, "");
  } else if (bodyNumberType === "random") {
    const digits = Math.max(1, Math.min(10, parseInt(randomDigits, 10) || 4));
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const rand = Math.floor(min + Math.random() * (max - min + 1));
    numericBodyVal = rand.toString().padStart(digits, "0");
  }

  const helperTruncate = (raw, charSetting) => {
    if (!raw) return "";
    if (!charSetting || charSetting === "full") return raw;
    const len = parseInt(charSetting, 10);
    return !isNaN(len) && len > 0 ? raw.substring(0, len) : raw;
  };

  // Evaluate middle components in the user's configured drag-and-drop order
  const middleParts = skuComponents
    .filter((comp) => comp.type !== "prefix" && comp.type !== "suffix")
    .map((comp) => {
      if (comp.type === "body") {
        if (bodyNumberType === "disabled") return "";
        return numericBodyVal;
      }
      if (comp.type === "productTitle" || comp.type === "productName") {
        return helperTruncate(pObj.title || "", comp.charLength);
      }
      if (comp.type === "productVendor" || comp.type === "vendor" || comp.type === "product_vendor") {
        return helperTruncate(pObj.vendor || "", comp.charLength);
      }
      if (comp.type === "productType" || comp.type === "type" || comp.type === "product_type") {
        return helperTruncate(pObj.productType || pObj.type || "", comp.charLength);
      }
      if (comp.type === "variantTitle" || comp.type === "variantName") {
        return helperTruncate(vObj.title || "", comp.charLength);
      }
      if (comp.type === "variantOption1" || comp.type === "option1" || comp.type === "variant_option1") {
        const val = vObj.option1 || vObj.selectedOptions?.[0]?.value || vObj.color || "";
        return helperTruncate(val, comp.charLength);
      }
      if (comp.type === "variantOption2" || comp.type === "option2" || comp.type === "variant_option2") {
        const val = vObj.option2 || vObj.selectedOptions?.[1]?.value || vObj.material || "";
        return helperTruncate(val, comp.charLength);
      }
      if (comp.type === "variantOption3" || comp.type === "option3" || comp.type === "variant_option3") {
        const val = vObj.option3 || vObj.selectedOptions?.[2]?.value || "";
        return helperTruncate(val, comp.charLength);
      }
      return comp.value || "";
    });

  // Assemble full SKU: Fixed Prefix -> Draggable Middle Components -> Fixed Suffix
  const activeParts = [];
  if (prefix && String(prefix).trim()) {
    activeParts.push(String(prefix).trim());
  }
  middleParts.forEach((p) => {
    if (p !== undefined && p !== null && p !== "") {
      activeParts.push(String(p).trim());
    }
  });
  if (suffix && String(suffix).trim()) {
    activeParts.push(String(suffix).trim());
  }

  // Join with separator
  let finalSku = activeParts.join(sep);

  // Apply string options
  if (removeSpaces) {
    finalSku = finalSku.replace(/\s+/g, "");
  }
  if (capitalizeAll) {
    finalSku = finalSku.toUpperCase();
  }

  return finalSku || "STRT-0001-END";
}
