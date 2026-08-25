/**
 * Dynamic Product & Variant Selection Service
 * Resolves Shopify catalog targets for ALL_PRODUCTS, COLLECTIONS, PRODUCTS, VARIANTS, and TAG.
 */

// Allowlist for sort options to prevent GraphQL injection
export const ALLOWED_SORTS = {
  TITLE_ASC: { sortKey: "TITLE", reverse: false },
  TITLE_DESC: { sortKey: "TITLE", reverse: true },
  CREATED_NEWEST: { sortKey: "CREATED_AT", reverse: true },
  CREATED_OLDEST: { sortKey: "CREATED_AT", reverse: false },
};

/**
 * Maps input sort code or defaults to TITLE_ASC
 */
export function getSortConfig(sortKeyStr) {
  if (sortKeyStr && ALLOWED_SORTS[sortKeyStr]) {
    return ALLOWED_SORTS[sortKeyStr];
  }
  return ALLOWED_SORTS.TITLE_ASC;
}

/**
 * Sanitize tag input for Shopify GraphQL search query
 */
export function sanitizeTagQuery(tag) {
  if (!tag) return "";
  const cleaned = tag.trim().replace(/["'\\]/g, "");
  return `tag:${cleaned}`;
}

/**
 * Helper to parse a Product Node from Shopify GraphQL response into unified format
 */
export function parseProductNode(node) {
  if (!node) return null;

  const featuredImage = node.featuredImage?.url || node.images?.edges?.[0]?.node?.url || "";
  const variants = (node.variants?.edges || []).map((vEdge) => {
    const v = vEdge.node;
    return {
      id: v.id,
      variantId: v.id,
      title: v.title,
      sku: v.sku || "",
      price: v.price || "0.00",
      selectedOptions: v.selectedOptions || [],
      option1: v.selectedOptions?.[0]?.value || "",
      option2: v.selectedOptions?.[1]?.value || "",
      option3: v.selectedOptions?.[2]?.value || "",
      image: v.image?.url || featuredImage,
    };
  });

  return {
    id: node.id,
    productId: node.id,
    title: node.title,
    handle: node.handle,
    vendor: node.vendor || "",
    productType: node.productType || "",
    tags: node.tags || [],
    createdAt: node.createdAt,
    image: featuredImage,
    variants,
  };
}

/**
 * Fetch dynamic preview & catalog page based on Selection configuration
 */
export async function resolveSkuSelection({
  admin,
  selection = {},
  sort = "TITLE_ASC",
  search = "",
  cursor = null,
  limit = 250,
  includeMetafields = [],
}) {
  const { type = "ALL_PRODUCTS", collectionIds = [], productIds = [], variantIds = [], tag = "" } = selection;
  const sortConfig = getSortConfig(sort);

  let searchFilter = "";
  if (search && search.trim().length > 0) {
    const cleanSearch = search.trim().replace(/["'\\]/g, "");
    searchFilter = `title:*${cleanSearch}* OR sku:*${cleanSearch}*`;
  }

  // ── Mode 1: ALL_PRODUCTS ──────────────────────────────────────────────────
  if (type === "ALL_PRODUCTS") {
    const queryStr = searchFilter ? `, query: "${searchFilter}"` : "";
    const afterStr = cursor ? `, after: "${cursor}"` : "";

    const response = await admin.graphql(`
      query getSelectionAllProducts {
        products(first: ${limit}${afterStr}, sortKey: ${sortConfig.sortKey}, reverse: ${sortConfig.reverse}${queryStr}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              tags
              createdAt
              featuredImage { url }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    selectedOptions { name value }
                    image { url }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const resJson = await response.json();
    const productEdges = resJson?.data?.products?.edges || [];
    const pageInfo = resJson?.data?.products?.pageInfo || { hasNextPage: false, endCursor: null };

    const products = productEdges.map((e) => parseProductNode(e.node));
    return { products, pageInfo, selectionType: "ALL_PRODUCTS" };
  }

  // ── Mode 2: COLLECTIONS ───────────────────────────────────────────────────
  if (type === "COLLECTIONS" || type === "COLLECTION") {
    if (!collectionIds || collectionIds.length === 0) {
      return { products: [], pageInfo: { hasNextPage: false, endCursor: null }, selectionType: "COLLECTIONS" };
    }

    const response = await admin.graphql(`
      query getSelectionCollectionsProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Collection {
            id
            title
            products(first: 250) {
              edges {
                node {
                  id
                  title
                  handle
                  vendor
                  productType
                  tags
                  createdAt
                  featuredImage { url }
                  variants(first: 250) {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        selectedOptions { name value }
                        image { url }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, { variables: { ids: collectionIds.slice(0, 50) } });

    const resJson = await response.json();
    const collectionNodes = (resJson?.data?.nodes || []).filter(Boolean);

    const productMap = {};
    collectionNodes.forEach((col) => {
      const pEdges = col.products?.edges || [];
      pEdges.forEach((e) => {
        if (e.node && !productMap[e.node.id]) {
          productMap[e.node.id] = parseProductNode(e.node);
        }
      });
    });

    const products = Object.values(productMap);
    return { products, pageInfo: { hasNextPage: false, endCursor: null }, selectionType: "COLLECTIONS" };
  }

  // ── Mode 3: PRODUCTS ──────────────────────────────────────────────────────
  if (type === "PRODUCTS" || type === "PRODUCT") {
    if (!productIds || productIds.length === 0) {
      return { products: [], pageInfo: { hasNextPage: false, endCursor: null }, selectionType: "PRODUCTS" };
    }

    const response = await admin.graphql(`
      query getSelectionProductsByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            handle
            vendor
            productType
            tags
            createdAt
            featuredImage { url }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  selectedOptions { name value }
                  image { url }
                }
              }
            }
          }
        }
      }
    `, { variables: { ids: productIds.slice(0, 50) } });

    const resJson = await response.json();
    const productNodes = (resJson?.data?.nodes || []).filter(Boolean);
    const products = productNodes.map(parseProductNode);

    return {
      products,
      pageInfo: { hasNextPage: false, endCursor: null },
      selectionType: "PRODUCTS",
    };
  }

  // ── Mode 4: VARIANTS ──────────────────────────────────────────────────────
  if (type === "VARIANTS" || type === "VARIANT") {
    if (!variantIds || variantIds.length === 0) {
      return { products: [], pageInfo: { hasNextPage: false, endCursor: null }, selectionType: "VARIANTS" };
    }

    const response = await admin.graphql(`
      query getSelectionVariantsByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            title
            sku
            price
            selectedOptions { name value }
            image { url }
            product {
              id
              title
              handle
              vendor
              productType
              tags
              createdAt
              featuredImage { url }
            }
          }
        }
      }
    `, { variables: { ids: variantIds.slice(0, 50) } });

    const resJson = await response.json();
    const variantNodes = (resJson?.data?.nodes || []).filter(Boolean);

    // Group variants by parent product
    const productMap = {};
    variantNodes.forEach((v) => {
      const p = v.product;
      if (!p) return;
      if (!productMap[p.id]) {
        productMap[p.id] = {
          id: p.id,
          productId: p.id,
          title: p.title,
          handle: p.handle,
          vendor: p.vendor || "",
          productType: p.productType || "",
          tags: p.tags || [],
          createdAt: p.createdAt,
          image: p.featuredImage?.url || "",
          variants: [],
        };
      }
      productMap[p.id].variants.push({
        id: v.id,
        variantId: v.id,
        title: v.title,
        sku: v.sku || "",
        price: v.price || "0.00",
        selectedOptions: v.selectedOptions || [],
        option1: v.selectedOptions?.[0]?.value || "",
        option2: v.selectedOptions?.[1]?.value || "",
        option3: v.selectedOptions?.[2]?.value || "",
        image: v.image?.url || productMap[p.id].image,
      });
    });

    const products = Object.values(productMap);
    return {
      products,
      pageInfo: { hasNextPage: false, endCursor: null },
      selectionType: "VARIANTS",
    };
  }

  // ── Mode 5: TAG ───────────────────────────────────────────────────────────
  if (type === "TAG") {
    const tagQuery = sanitizeTagQuery(tag);
    if (!tagQuery) {
      return { products: [], pageInfo: { hasNextPage: false, endCursor: null }, selectionType: "TAG" };
    }

    const combinedQuery = searchFilter ? `${tagQuery} AND (${searchFilter})` : tagQuery;
    const afterStr = cursor ? `, after: "${cursor}"` : "";

    const response = await admin.graphql(`
      query getSelectionTagProducts {
        products(first: ${limit}${afterStr}, query: "${combinedQuery}", sortKey: ${sortConfig.sortKey}, reverse: ${sortConfig.reverse}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              tags
              createdAt
              featuredImage { url }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    selectedOptions { name value }
                    image { url }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const resJson = await response.json();
    const productEdges = resJson?.data?.products?.edges || [];
    const pageInfo = resJson?.data?.products?.pageInfo || { hasNextPage: false, endCursor: null };

    const products = productEdges.map((e) => parseProductNode(e.node));
    return { products, pageInfo, selectionType: "TAG" };
  }

  return { products: [], pageInfo: { hasNextPage: false, endCursor: null }, selectionType: type };
}

/**
 * Calculate dynamic variant count metrics for selected scope
 */
export async function calculateSelectionScopeCounts({ admin, selection = {} }) {
  const { type = "ALL_PRODUCTS", collectionIds = [], productIds = [], variantIds = [], tag = "" } = selection;

  // 1. VARIANTS selection mode
  if ((type === "VARIANTS" || type === "VARIANT") && variantIds && variantIds.length > 0) {
    if (admin) {
      try {
        const response = await admin.graphql(`
          query getVariantsScopeCounts($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on ProductVariant {
                id
                sku
                product {
                  id
                }
              }
            }
          }
        `, { variables: { ids: variantIds.slice(0, 250) } });

        const resJson = await response.json();
        const variantNodes = (resJson?.data?.nodes || []).filter(Boolean);

        const productSet = new Set();
        let totalVariants = variantNodes.length;
        let variantsWithSku = 0;
        let variantsWithoutSku = 0;

        variantNodes.forEach((v) => {
          if (v.product?.id) productSet.add(v.product.id);
          const sku = v.sku;
          if (sku && sku.trim().length > 0) {
            variantsWithSku++;
          } else {
            variantsWithoutSku++;
          }
        });

        return {
          totalProducts: productSet.size,
          totalVariants,
          variantsWithSku,
          variantsWithoutSku,
          estimatedCredits: totalVariants,
        };
      } catch (err) {
        console.warn("[Selection Service] VARIANTS count query warning:", err.message);
      }
    }
    const count = variantIds.length;
    return {
      totalProducts: Math.min(count, 50),
      totalVariants: count,
      variantsWithSku: 0,
      variantsWithoutSku: count,
      estimatedCredits: count,
    };
  }

  // 2. PRODUCTS selection mode
  if ((type === "PRODUCTS" || type === "PRODUCT") && productIds && productIds.length > 0) {
    if (admin) {
      try {
        const response = await admin.graphql(`
          query getProductsScopeCounts($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on Product {
                id
                variants(first: 250) {
                  edges {
                    node {
                      id
                      sku
                    }
                  }
                }
              }
            }
          }
        `, { variables: { ids: productIds.slice(0, 250) } });

        const resJson = await response.json();
        const productNodes = (resJson?.data?.nodes || []).filter(Boolean);

        let totalProducts = productNodes.length;
        let totalVariants = 0;
        let variantsWithSku = 0;
        let variantsWithoutSku = 0;

        productNodes.forEach((product) => {
          const vEdges = product.variants?.edges || [];
          vEdges.forEach((vEdge) => {
            const sku = vEdge.node?.sku;
            totalVariants++;
            if (sku && sku.trim().length > 0) {
              variantsWithSku++;
            } else {
              variantsWithoutSku++;
            }
          });
        });

        return {
          totalProducts,
          totalVariants,
          variantsWithSku,
          variantsWithoutSku,
          estimatedCredits: totalVariants,
        };
      } catch (err) {
        console.warn("[Selection Service] PRODUCTS count query warning:", err.message);
      }
    }
    const count = productIds.length;
    const estVariants = count * 2;
    return {
      totalProducts: count,
      totalVariants: estVariants,
      variantsWithSku: 0,
      variantsWithoutSku: estVariants,
      estimatedCredits: estVariants,
    };
  }

  // 3. TAG selection mode
  if (type === "TAG") {
    if (admin) {
      try {
        const tagQuery = sanitizeTagQuery(tag);
        if (tagQuery) {
          const pResponse = await admin.graphql(`
            query getTagProductsScopeCounts($query: String!) {
              productsCount(query: $query) { count }
              products(first: 250, query: $query) {
                edges {
                  node {
                    id
                    variants(first: 250) {
                      edges {
                        node {
                          id
                          sku
                        }
                      }
                    }
                  }
                }
              }
            }
          `, { variables: { query: tagQuery } });

          const pJson = await pResponse.json();
          const productsCount = pJson?.data?.productsCount?.count || 0;
          const pEdges = pJson?.data?.products?.edges || [];

          let totalVariants = 0;
          let variantsWithSku = 0;
          let variantsWithoutSku = 0;

          pEdges.forEach((pEdge) => {
            const vEdges = pEdge.node?.variants?.edges || [];
            vEdges.forEach((vEdge) => {
              const sku = vEdge.node?.sku;
              totalVariants++;
              if (sku && sku.trim().length > 0) {
                variantsWithSku++;
              } else {
                variantsWithoutSku++;
              }
            });
          });

          return {
            totalProducts: productsCount || pEdges.length,
            totalVariants,
            variantsWithSku,
            variantsWithoutSku,
            estimatedCredits: totalVariants,
          };
        }
      } catch (err) {
        console.warn("[Selection Service] TAG count query warning:", err.message);
      }
    }
    return {
      totalProducts: 0,
      totalVariants: 0,
      variantsWithSku: 0,
      variantsWithoutSku: 0,
      estimatedCredits: 0,
    };
  }

  // 4. COLLECTIONS & ALL_PRODUCTS selection modes
  try {
    if ((type === "COLLECTIONS" || type === "COLLECTION") && collectionIds.length > 0) {
      if (admin) {
        const resp = await admin.graphql(`
          query getCollectionsScopeCounts($ids: [ID!]!) {
            nodes(ids: $ids) {
              ... on Collection {
                id
                products(first: 250) {
                  edges {
                    node {
                      id
                      variants(first: 250) {
                        edges {
                          node {
                            id
                            sku
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `, { variables: { ids: collectionIds.slice(0, 50) } });
        const rJson = await resp.json();
        const collectionNodes = (rJson?.data?.nodes || []).filter(Boolean);

        const productMap = {};
        collectionNodes.forEach((col) => {
          const pEdges = col.products?.edges || [];
          pEdges.forEach((pEdge) => {
            if (pEdge.node && !productMap[pEdge.node.id]) {
              productMap[pEdge.node.id] = pEdge.node;
            }
          });
        });

        const uniqueProducts = Object.values(productMap);
        let totalProducts = uniqueProducts.length;
        let totalVariants = 0;
        let variantsWithSku = 0;
        let variantsWithoutSku = 0;

        uniqueProducts.forEach((product) => {
          const vEdges = product.variants?.edges || [];
          vEdges.forEach((vEdge) => {
            const sku = vEdge.node?.sku;
            totalVariants++;
            if (sku && sku.trim().length > 0) {
              variantsWithSku++;
            } else {
              variantsWithoutSku++;
            }
          });
        });

        return {
          totalProducts,
          totalVariants,
          variantsWithSku,
          variantsWithoutSku,
          estimatedCredits: totalVariants,
        };
      }
    } else if (admin) {
      const resp = await admin.graphql(`
        query getCatalogCounts {
          pCount: productsCount { count }
          vCount: productVariantsCount { count }
          vWithSkuCount: productVariantsCount(query: "sku:*") { count }
        }
      `);
      const rJson = await resp.json();
      const productsCount = rJson?.data?.pCount?.count || 0;
      const variantsCount = rJson?.data?.vCount?.count || 0;
      const variantsWithSkuCount = rJson?.data?.vWithSkuCount?.count;

      let variantsWithSku = 0;
      let variantsWithoutSku = 0;

      if (typeof variantsWithSkuCount === "number" && !isNaN(variantsWithSkuCount)) {
        variantsWithSku = variantsWithSkuCount;
        variantsWithoutSku = Math.max(0, variantsCount - variantsWithSku);
      } else {
        const pResponse = await admin.graphql(`
          query getCatalogSampleCounts {
            products(first: 250) {
              edges {
                node {
                  id
                  variants(first: 250) {
                    edges {
                      node {
                        id
                        sku
                      }
                    }
                  }
                }
              }
            }
          }
        `);
        const pJson = await pResponse.json();
        const pEdges = pJson?.data?.products?.edges || [];
        pEdges.forEach((pEdge) => {
          const vEdges = pEdge.node?.variants?.edges || [];
          vEdges.forEach((vEdge) => {
            const sku = vEdge.node?.sku;
            if (sku && sku.trim().length > 0) {
              variantsWithSku++;
            } else {
              variantsWithoutSku++;
            }
          });
        });
      }

      return {
        totalProducts: productsCount,
        totalVariants: variantsCount,
        variantsWithSku,
        variantsWithoutSku,
        estimatedCredits: variantsCount,
      };
    }

    return {
      totalProducts: 0,
      totalVariants: 0,
      variantsWithSku: 0,
      variantsWithoutSku: 0,
      estimatedCredits: 0,
    };
  } catch (err) {
    console.warn("[Selection Service] Count estimation warning:", err.message);
    return {
      totalProducts: 0,
      totalVariants: 0,
      variantsWithSku: 0,
      variantsWithoutSku: 0,
      estimatedCredits: 0,
    };
  }
}
