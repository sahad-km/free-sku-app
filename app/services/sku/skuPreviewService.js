import { resolveSkuSelection, calculateSelectionScopeCounts } from "./skuSelectionService";
import { generateSkuForVariant } from "./skuGeneratorService";

/**
 * SKU Live & Full Preview Service
 * Read-only preview using real Shopify products and canonical SKU engine.
 */
export async function getSkuPreviewDataset({
  admin,
  selection = {},
  skuConfiguration = {},
  sort = "TITLE_ASC",
  search = "",
  cursor = null,
  limit = 10,
}) {
  // 1. Resolve matching catalog page from Shopify
  const { products, pageInfo, selectionType } = await resolveSkuSelection({
    admin,
    selection,
    sort,
    search,
    cursor,
    limit,
  });

  // 2. Fetch selection scope statistics
  const scopeCounts = await calculateSelectionScopeCounts({ admin, selection });

  // 3. Generate preview rows for each variant in the page
  const items = [];
  let variantIndexCounter = 0;

  products.forEach((product) => {
    (product.variants || []).forEach((variant) => {
      const genResult = generateSkuForVariant({
        product,
        variant,
        config: skuConfiguration,
        index: variantIndexCounter,
      });

      items.push({
        product: {
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          type: product.productType,
          image: product.image,
        },
        variant: {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          price: variant.price,
          image: variant.image,
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
          selectedOptions: variant.selectedOptions,
        },
        rawProduct: product,
        rawVariant: variant,
        currentSku: (variant.sku && variant.sku !== "—") ? variant.sku : null,
        previewSku: genResult.sku,
        status: genResult.status,
        isSkipped: genResult.isSkipped,
        reason: genResult.reason || "",
      });

      variantIndexCounter++;
    });
  });

  return {
    items,
    selectionSummary: {
      selectionType,
      products: scopeCounts.totalProducts,
      variants: scopeCounts.totalVariants,
      variantsWithSku: scopeCounts.variantsWithSku,
      variantsWithoutSku: scopeCounts.variantsWithoutSku,
      estimatedCredits: scopeCounts.estimatedCredits,
    },
    pageInfo,
  };
}
