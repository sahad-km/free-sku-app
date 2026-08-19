import { generateSkuForVariant } from "./skuGeneratorService";

/**
 * SKU Validation Service
 * Validates request payload schemas, GID formats, and detects SKU collisions.
 */

export function validateSelectionPayload(selection) {
  if (!selection || typeof selection !== "object") {
    return { valid: false, error: "Selection payload must be an object" };
  }

  const validTypes = ["ALL_PRODUCTS", "COLLECTIONS", "PRODUCTS", "VARIANTS", "TAG", "COLLECTION", "PRODUCT", "VARIANT"];
  if (!validTypes.includes(selection.type)) {
    return { valid: false, error: `Invalid selection type: ${selection.type}` };
  }

  if ((selection.type === "COLLECTIONS" || selection.type === "COLLECTION") && (!Array.isArray(selection.collectionIds) || selection.collectionIds.length === 0)) {
    return { valid: false, error: "At least one collectionId GID must be provided when type is COLLECTIONS" };
  }

  if ((selection.type === "PRODUCTS" || selection.type === "PRODUCT") && (!Array.isArray(selection.productIds) || selection.productIds.length === 0)) {
    return { valid: false, error: "At least one productId GID must be provided when type is PRODUCTS" };
  }

  if ((selection.type === "VARIANTS" || selection.type === "VARIANT") && (!Array.isArray(selection.variantIds) || selection.variantIds.length === 0)) {
    return { valid: false, error: "At least one variantId GID must be provided when type is VARIANTS" };
  }

  if (selection.type === "TAG" && (!selection.tag || typeof selection.tag !== "string" || !selection.tag.trim())) {
    return { valid: false, error: "A non-empty tag string is required when type is TAG" };
  }

  return { valid: true };
}

export function validateSkuConfigPayload(config) {
  if (!config || typeof config !== "object") {
    return { valid: false, error: "SKU configuration payload must be an object" };
  }

  const validBodyTypes = ["sequential", "continue", "disabled", "productId", "variantId", "random"];
  if (config.bodyNumberType && !validBodyTypes.includes(config.bodyNumberType)) {
    return { valid: false, error: `Invalid bodyNumberType: ${config.bodyNumberType}` };
  }

  return { valid: true };
}

/**
 * Batch SKU Collision Detection
 * Checks generated SKUs against target variant set and existing SKUs
 */
export function detectSkuCollisions({ items = [], overwriteExisting = true }) {
  const seenSkus = new Set();
  const collisions = [];

  items.forEach((item) => {
    const { variant, previewSku, generatedSku } = item;
    const skuToTest = (generatedSku || previewSku || "").trim();

    if (!skuToTest) return;

    const lowerSku = skuToTest.toLowerCase();

    // 1. Check duplicate within generated batch
    if (seenSkus.has(lowerSku)) {
      collisions.push({
        variantId: variant?.id || item.variantId,
        productTitle: item.product?.title || "",
        variantTitle: variant?.title || "",
        sku: skuToTest,
        type: "IN_BATCH_COLLISION",
        message: `SKU "${skuToTest}" is generated multiple times within the same run batch`,
      });
    } else {
      seenSkus.add(lowerSku);
    }
  });

  return {
    hasCollisions: collisions.length > 0,
    collisions,
  };
}
