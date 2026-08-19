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
  limit = 10,
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

    // Query products inside the specified collection GIDs
    const collectionId = collectionIds[0]; // Primary collection GID
    const afterStr = cursor ? `, after: "${cursor}"` : "";

    const response = await admin.graphql(`
      query getSelectionCollectionProducts($id: ID!) {
        collection(id: $id) {
          id
          title
          products(first: ${limit}${afterStr}, sortKey: ${sortConfig.sortKey}, reverse: ${sortConfig.reverse}) {
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
      }
    `, { variables: { id: collectionId } });

    const resJson = await response.json();
    const productEdges = resJson?.data?.collection?.products?.edges || [];
    const pageInfo = resJson?.data?.collection?.products?.pageInfo || { hasNextPage: false, endCursor: null };

    const products = productEdges.map((e) => parseProductNode(e.node));
    return { products, pageInfo, selectionType: "COLLECTIONS" };
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

  if (type === "VARIANTS") {
    const count = variantIds ? variantIds.length : 0;
    return {
      totalProducts: Math.min(count, 50),
      totalVariants: count,
      variantsWithSku: 0,
      variantsWithoutSku: count,
      estimatedCredits: count,
    };
  }

  if (type === "PRODUCTS") {
    const count = productIds ? productIds.length : 0;
    // Estimate ~2 variants per product if unknown
    const estVariants = count * 2;
    return {
      totalProducts: count,
      totalVariants: estVariants,
      variantsWithSku: 0,
      variantsWithoutSku: estVariants,
      estimatedCredits: estVariants,
    };
  }

  // For ALL_PRODUCTS, COLLECTIONS, TAG: fetch target counts via Shopify GraphQL
  try {
    let q = "";
    if (type === "TAG") {
      q = sanitizeTagQuery(tag);
    }

    let productsCount = 0;
    let variantsCount = 0;

    if (type === "COLLECTIONS" && collectionIds.length > 0) {
      const resp = await admin.graphql(`
        query getCollectionCount($id: ID!) {
          collection(id: $id) {
            productsCount { count }
          }
        }
      `, { variables: { id: collectionIds[0] } });
      const rJson = await resp.json();
      productsCount = rJson?.data?.collection?.productsCount?.count || 0;
      variantsCount = productsCount * 2; // Approximate variants
    } else {
      const countQuery = q ? `productsCount(query: "${q}") { count }` : `productsCount { count }`;
      const varQuery = q ? `productVariantsCount(query: "${q}") { count }` : `productVariantsCount { count }`;

      const resp = await admin.graphql(`
        query getCatalogCounts {
          pCount: ${countQuery}
          vCount: ${varQuery}
        }
      `);
      const rJson = await resp.json();
      productsCount = rJson?.data?.pCount?.count || 0;
      variantsCount = rJson?.data?.vCount?.count || 0;
    }

    return {
      totalProducts: productsCount,
      totalVariants: variantsCount,
      variantsWithSku: Math.round(variantsCount * 0.2), // Estimated stats
      variantsWithoutSku: Math.round(variantsCount * 0.8),
      estimatedCredits: variantsCount,
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
