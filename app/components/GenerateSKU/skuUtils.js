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
  product,
  index,
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
}) {
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
    numericBodyVal = body || "";
  } else if (bodyNumberType === "productId") {
    numericBodyVal = product.productId;
  } else if (bodyNumberType === "variantId") {
    numericBodyVal = product.variantId;
  } else if (bodyNumberType === "random") {
    const rand = Math.floor(1000 + Math.random() * 9000);
    numericBodyVal = rand.toString();
  }

  // Build component values in the user's configured component order
  const parts = skuComponents.map((comp) => {
    if (comp.type === "prefix") {
      return prefix || comp.value || "";
    }
    if (comp.type === "body") {
      return numericBodyVal || body || comp.value || "";
    }
    if (comp.type === "suffix") {
      return suffix || comp.value || "";
    }
    if (comp.type === "metafield" || comp.type === "productMetafield" || comp.type === "variantMetafield") {
      if (comp.key === "material") return product.material || "MAT";
      if (comp.key === "vendor") return product.vendor || "VND";
      if (comp.key === "type") return product.type || "TYPE";
      if (comp.key === "color") return product.color || "CLR";
      return comp.value || comp.key || "META";
    }
    return comp.value || "";
  });

  // Filter out empty parts
  const activeParts = parts.filter((p) => p !== undefined && p !== null && p !== "");

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
