import { connectMongoose } from "../../db.mongoose.server";
import DuplicateScan from "../../models/DuplicateScan.server";
import DuplicateGroup from "../../models/DuplicateGroup.server";

/**
 * 1. Execute Catalog Duplicate Scan via Shopify GraphQL API
 */
export async function executeCatalogDuplicateScan({ admin, shopDomain }) {
  if (!admin || !shopDomain) {
    throw new Error("Missing required parameters for duplicate scan");
  }

  await connectMongoose();

  const scanRun = await DuplicateScan.create({
    shopDomain,
    status: "In Progress",
    totalVariantsScanned: 0,
    duplicateGroupsFound: 0,
    affectedVariants: 0,
    startedAt: new Date(),
  });

  let hasNextPage = true;
  let cursor = null;
  let totalVariantsScanned = 0;
  const scannedProductIds = new Set();
  const skuMap = {}; // Map of normalized SKU -> array of variant snapshots

  try {
    while (hasNextPage) {
      const response = await admin.graphql(`
        query getCatalogVariantsForDuplicates($cursor: String) {
          products(first: 50, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              variants(first: 100) {
                nodes {
                  id
                  title
                  sku
                }
              }
            }
          }
        }
      `, {
        variables: { cursor },
      });

      const json = await response.json();
      const products = json?.data?.products?.nodes || [];
      const pageInfo = json?.data?.products?.pageInfo || {};

      hasNextPage = pageInfo.hasNextPage || false;
      cursor = pageInfo.endCursor || null;

      if (products.length === 0) break;

      products.forEach((product) => {
        if (product.id) scannedProductIds.add(product.id);
        (product.variants?.nodes || []).forEach((variant) => {
          totalVariantsScanned++;
          const sku = (variant.sku || "").trim();

          // Ignore blank/empty SKUs
          if (!sku) return;

          if (!skuMap[sku]) {
            skuMap[sku] = [];
          }

          skuMap[sku].push({
            id: `rec-${product.id}-${variant.id}`,
            productId: product.id,
            variantId: variant.id,
            product: product.title,
            variant: variant.title,
            currentSku: sku,
          });
        });
      });
    }

    // Filter SKU groups with more than 1 variant (Duplicates)
    const duplicateSkuEntries = Object.entries(skuMap).filter(
      ([_, records]) => records.length > 1
    );

    let totalAffectedVariants = 0;
    const groupDocs = [];

    // Remove previous UNRESOLVED duplicate groups for this store before saving fresh scan
    await DuplicateGroup.deleteMany({ shopDomain, status: "UNRESOLVED" });

    duplicateSkuEntries.forEach(([sku, records]) => {
      totalAffectedVariants += records.length;
      const firstRecord = records[0];

      groupDocs.push({
        shopDomain,
        scanRunId: scanRun._id,
        sku,
        title: `${firstRecord.product} (${sku})`,
        groupTag: `${records.length} variants share SKU`,
        duplicateType: "Exact SKU Match",
        status: "UNRESOLVED",
        records,
      });
    });

    if (groupDocs.length > 0) {
      await DuplicateGroup.insertMany(groupDocs);
    }

    scanRun.status = "Completed";
    scanRun.totalProductsScanned = scannedProductIds.size;
    scanRun.totalVariantsScanned = totalVariantsScanned;
    scanRun.duplicateGroupsFound = duplicateSkuEntries.length;
    scanRun.affectedVariants = totalAffectedVariants;
    scanRun.completedAt = new Date();
    await scanRun.save();
    scanRun.duplicateGroupsFound = duplicateSkuEntries.length;
    scanRun.affectedVariants = totalAffectedVariants;
    scanRun.completedAt = new Date();
    await scanRun.save();

    return {
      success: true,
      scanRunId: scanRun._id.toString(),
      totalVariantsScanned,
      duplicateGroupsFound: duplicateSkuEntries.length,
      affectedVariants: totalAffectedVariants,
    };
  } catch (err) {
    console.error("[Duplicate Scan Error]:", err.message);
    scanRun.status = "Failed";
    scanRun.error = err.message;
    await scanRun.save();
    throw err;
  }
}

/**
 * 2. Get Duplicate Summary KPIs and Groups for a Store
 */
export async function getDuplicateSummaryAndGroups({
  shopDomain,
  searchQuery = "",
  sortBy = "severity",
}) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  await connectMongoose();

  const query = { shopDomain, status: "UNRESOLVED" };

  if (searchQuery && searchQuery.trim() !== "") {
    const regex = new RegExp(searchQuery.trim(), "i");
    query.$or = [
      { title: regex },
      { sku: regex },
      { groupTag: regex },
      { duplicateType: regex },
    ];
  }

  let groupsQuery = DuplicateGroup.find(query).lean();

  if (sortBy === "name") {
    groupsQuery = groupsQuery.sort({ title: 1 });
  } else {
    groupsQuery = groupsQuery.sort({ createdAt: -1 });
  }

  const groups = await groupsQuery.exec();

  // If sort by affected records requested
  if (sortBy === "affected") {
    groups.sort((a, b) => (b.records?.length || 0) - (a.records?.length || 0));
  }

  // Find last scan run for summary
  const lastScan = await DuplicateScan.findOne({ shopDomain, status: "Completed" })
    .sort({ createdAt: -1 })
    .lean();

  const totalGroups = groups.length;
  let totalAffectedVariants = 0;
  const affectedProductIds = new Set();

  groups.forEach((g) => {
    (g.records || []).forEach((r) => {
      totalAffectedVariants++;
      if (r.productId) affectedProductIds.add(r.productId);
    });
  });

  const riskLevel = totalGroups > 5 ? "High Risk" : totalGroups > 0 ? "Medium Risk" : "Low Risk";

  const summary = {
    duplicateGroups: totalGroups,
    affectedVariants: totalAffectedVariants,
    affectedProducts: affectedProductIds.size,
    riskLevel,
    lastScanDate: lastScan?.completedAt
      ? new Date(lastScan.completedAt).toLocaleDateString()
      : "Never",
    lastScanTime: lastScan?.completedAt
      ? new Date(lastScan.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--",
  };

  const durationStr = lastScan?.completedAt && lastScan?.startedAt
    ? `${((new Date(lastScan.completedAt) - new Date(lastScan.startedAt)) / 1000).toFixed(1)}s`
    : "--";

  const scanSummary = {
    startTime: lastScan?.startedAt
      ? `${new Date(lastScan.startedAt).toLocaleDateString()} ${new Date(lastScan.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Never",
    scanType: lastScan?.scanType || (lastScan ? "Full Catalog" : "--"),
    totalProducts: lastScan?.totalProductsScanned || affectedProductIds.size || 0,
    totalVariants: lastScan?.totalVariantsScanned || 0,
    scanDuration: durationStr,
    status: lastScan?.status || (lastScan ? "Completed" : "Not Scanned"),
  };

  return {
    groups: groups.map((g) => ({
      id: g._id.toString(),
      sku: g.sku,
      title: g.title,
      groupTag: g.groupTag || "Exact Match",
      duplicateType: g.duplicateType || "Exact SKU Match",
      exampleSku: g.sku,
      status: g.status,
      records: (g.records || []).map((r) => ({
        id: r.id,
        productId: r.productId,
        variantId: r.variantId,
        product: r.product,
        variant: r.variant,
        currentSku: r.currentSku,
      })),
    })),
    summary,
    scanSummary,
  };
}

/**
 * 3. Get Scan History Runs for a Store
 */
export async function getScanHistory({ shopDomain }) {
  if (!shopDomain) throw new Error("Unauthorized shop domain");
  await connectMongoose();

  const runs = await DuplicateScan.find({ shopDomain })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return runs.map((r) => ({
    id: r._id.toString(),
    date: r.createdAt ? new Date(r.createdAt).toLocaleString() : "Unknown",
    status: r.status,
    scanned: r.totalVariantsScanned || 0,
    duplicates: r.duplicateGroupsFound || 0,
    affected: r.affectedVariants || 0,
    duration: r.completedAt && r.startedAt
      ? `${((new Date(r.completedAt) - new Date(r.startedAt)) / 1000).toFixed(1)}s`
      : "--",
  }));
}
