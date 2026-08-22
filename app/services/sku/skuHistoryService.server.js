import { connectMongoose, isDbConnected } from "../../db.mongoose.server";
import SkuGenerationRun from "../../models/SkuGenerationRun.server";
import GeneratedSku from "../../models/GeneratedSku.server";

/**
 * Format raw Date object into merchant-friendly date and time strings
 */
function formatDateTime(dateInput) {
  if (!dateInput) return { date: "—", time: "—" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };

  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

  return { date, time };
}

/**
 * Format scope label for UI
 */
function formatScopeType(scopeType, snapshot = {}) {
  switch (scopeType) {
    case "ALL_PRODUCTS":
      return "All products";
    case "COLLECTIONS":
      return snapshot.collectionNames ? snapshot.collectionNames.join(", ") : "Collections";
    case "PRODUCTS":
      return "Selected products";
    case "VARIANTS":
      return "Selected variants";
    case "TAG":
      return snapshot.tag ? `Tag: ${snapshot.tag}` : "Product tag";
    default:
      return scopeType || "All products";
  }
}

/**
 * Deterministic badge color styling for UI
 */
function getIconStyles(status, ruleName = "") {
  if (status === "Failed" || status === "COMPLETED_WITH_ERRORS") {
    return { iconBg: "bg-red-light", iconColor: "#DC2626" };
  }
  if (ruleName.toLowerCase().includes("auto")) {
    return { iconBg: "bg-blue-light", iconColor: "#2563EB" };
  }
  if (ruleName.toLowerCase().includes("vendor")) {
    return { iconBg: "bg-green-light", iconColor: "#16A34A" };
  }
  return { iconBg: "bg-purple-light", iconColor: "#5B3DF5" };
}

/**
 * Transform MongoDB SkuGenerationRun document into frontend History Record
 */
export function transformRunToRecord(doc) {
  const { date, time } = formatDateTime(doc.createdAt || doc.startedAt);
  const status =
    doc.status === "COMPLETED_WITH_ERRORS"
      ? "Failed"
      : doc.status === "PROCESSING"
      ? "In Progress"
      : doc.status === "QUEUED"
      ? "Queued"
      : doc.status || "Completed";

  const { iconBg, iconColor } = getIconStyles(status, doc.ruleName);

  const config = doc.skuConfiguration || {};

  return {
    id: doc._id.toString(),
    rule: doc.ruleName || "Manual SKU Run",
    ruleType: doc.ruleName?.toLowerCase().includes("auto") ? "Automated" : "Manual run",
    scope: formatScopeType(doc.scopeType, doc.selectionSnapshot),
    scopeCount: `${doc.totalProducts || 0} products`,
    products: doc.totalProducts || 0,
    variants: doc.totalVariants || 0,
    totalProducts: doc.totalProducts || 0,
    totalVariants: doc.totalVariants || 0,
    processedVariants: doc.processedVariants || 0,
    successfulVariants: doc.successfulVariants || 0,
    failedVariants: doc.failedVariants || 0,
    skippedVariants: doc.skippedVariants || 0,
    generated: status === "Failed" && (doc.successfulVariants || 0) === 0 ? "—" : (doc.successfulVariants || doc.skusGenerated || 0),
    status,
    date,
    time,
    createdAtIso: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    creditsUsed: doc.creditsConsumed || doc.successfulVariants || doc.creditsUsed || 0,
    failureReason: doc.errorSummary || (status === "Failed" ? "One or more variant updates encountered an error." : ""),
    failedProductsCount: doc.failedVariants || 0,
    settings: {
      prefix: config.prefix || config.prefixText || "None",
      bodyType: config.bodyType || config.bodyNumberType || "Sequential",
      padding: config.padding || config.paddingDigits || config.digitPadding || 4,
      suffix: config.suffix || config.suffixText || "None",
      separator: config.separator || config.delimiter || "-",
    },
    iconBg,
    iconColor,
  };
}

/**
 * 1. Fetch Paginated History List
 */
export async function getSkuHistoryList({
  shopDomain,
  page = 1,
  limit = 20,
  search = "",
  statusFilter = "All",
  ruleTypeFilter = "All",
  activeTab = "All history",
  dateRange = "",
}) {
  if (!shopDomain) {
    throw new Error("Unauthorized shop domain");
  }

  await connectMongoose();
  if (!isDbConnected()) {
    console.warn("[SkuHistoryService] MongoDB not connected, returning empty list.");
    return { items: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
  }

  const query = { shopDomain: shopDomain.toLowerCase() };

  // Status / Tab filter
  if (activeTab === "Successful") {
    query.status = "Completed";
  } else if (activeTab === "Failed") {
    query.status = { $in: ["Failed", "COMPLETED_WITH_ERRORS"] };
  } else if (statusFilter && statusFilter !== "All") {
    if (statusFilter === "Completed") query.status = "Completed";
    else if (statusFilter === "Failed") query.status = { $in: ["Failed", "COMPLETED_WITH_ERRORS"] };
    else query.status = statusFilter;
  }

  // Rule type filter
  if (ruleTypeFilter !== "All") {
    if (ruleTypeFilter === "Automated") {
      query.ruleName = { $regex: "auto", $options: "i" };
    } else if (ruleTypeFilter === "Manual run") {
      query.ruleName = { $not: { $regex: "auto", $options: "i" } };
    }
  }

  // Search query across ruleName, scopeType, and _id
  if (search && search.trim().length > 0) {
    const cleanSearch = search.trim().replace(/["'\\]/g, "");
    query.$or = [
      { ruleName: { $regex: cleanSearch, $options: "i" } },
      { scopeType: { $regex: cleanSearch, $options: "i" } },
      { errorSummary: { $regex: cleanSearch, $options: "i" } },
    ];
  }

  // Enforce boundary safety on limit
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  const [docs, totalCount] = await Promise.all([
    SkuGenerationRun.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    SkuGenerationRun.countDocuments(query),
  ]);

  const items = docs.map(transformRunToRecord);
  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalCount,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * 2. Fetch Summary Statistics Aggregation
 */
export async function getSkuHistorySummary({ shopDomain }) {
  if (!shopDomain) {
    throw new Error("Unauthorized shop domain");
  }

  await connectMongoose();
  if (!isDbConnected()) {
    return {
      totalExecuted: 0,
      successful: 0,
      successRate: "0.0%",
      failed: 0,
      failureRate: "0.0%",
      lastExecutionDate: "No runs yet",
      lastExecutionTime: "",
    };
  }

  const shopQuery = { shopDomain: shopDomain.toLowerCase() };

  const [aggResult, latestRun] = await Promise.all([
    SkuGenerationRun.aggregate([
      { $match: shopQuery },
      {
        $group: {
          _id: null,
          totalExecuted: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $in: ["$status", ["Failed", "COMPLETED_WITH_ERRORS"]] }, 1, 0],
            },
          },
        },
      },
    ]),
    SkuGenerationRun.findOne(shopQuery).sort({ createdAt: -1 }).lean(),
  ]);

  const stats = aggResult[0] || { totalExecuted: 0, successful: 0, failed: 0 };
  const totalExecuted = stats.totalExecuted || 0;
  const successful = stats.successful || 0;
  const failed = stats.failed || 0;

  const successRate = totalExecuted > 0 ? `${((successful / totalExecuted) * 100).toFixed(1)}%` : "0.0%";
  const failureRate = totalExecuted > 0 ? `${((failed / totalExecuted) * 100).toFixed(1)}%` : "0.0%";

  const { date: lastExecutionDate, time: lastExecutionTime } = formatDateTime(latestRun?.createdAt || latestRun?.startedAt);

  return {
    totalExecuted,
    successful,
    successRate,
    failed,
    failureRate,
    lastExecutionDate: lastExecutionDate !== "—" ? lastExecutionDate : "No runs yet",
    lastExecutionTime: lastExecutionTime !== "—" ? lastExecutionTime : "",
  };
}

/**
 * 3. Fetch Single Run Details
 */
export async function getSkuHistoryDetail({ shopDomain, runId }) {
  if (!shopDomain || !runId) {
    throw new Error("Missing shopDomain or runId");
  }

  await connectMongoose();
  if (!isDbConnected()) return null;

  const doc = await SkuGenerationRun.findOne({ _id: runId, shopDomain: shopDomain.toLowerCase() }).lean();
  if (!doc) return null;

  return transformRunToRecord(doc);
}

/**
 * 4. Fetch Paginated Generated SKU Audit Records for a Run
 */
export async function getGeneratedSkusForRun({ shopDomain, runId, search = "", limit = 50 }) {
  if (!shopDomain || !runId) {
    throw new Error("Missing shopDomain or runId");
  }

  await connectMongoose();
  if (!isDbConnected()) return { items: [], totalCount: 0 };

  // Multi-tenant verification: Ensure run belongs to shop
  const runDoc = await SkuGenerationRun.findOne({ _id: runId, shopDomain: shopDomain.toLowerCase() });
  if (!runDoc) {
    return { items: [], totalCount: 0 };
  }

  const query = {
    shopDomain: shopDomain.toLowerCase(),
    generationRunId: runId,
  };

  if (search && search.trim().length > 0) {
    const cleanSearch = search.trim().replace(/["'\\]/g, "");
    query.$or = [
      { productTitleSnapshot: { $regex: cleanSearch, $options: "i" } },
      { variantTitleSnapshot: { $regex: cleanSearch, $options: "i" } },
      { newSku: { $regex: cleanSearch, $options: "i" } },
      { previousSku: { $regex: cleanSearch, $options: "i" } },
    ];
  }

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 200);

  const docs = await GeneratedSku.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const items = docs.map((item) => ({
    product: item.productTitleSnapshot || "Product",
    variant: item.variantTitleSnapshot || "Default Variant",
    sku: item.newSku,
    previousSku: item.previousSku || "—",
    status: item.status === "SUCCESS" ? "Generated" : item.status === "SKIPPED" ? "Skipped" : "Failed",
    errorMessage: item.errorMessage || "",
  }));

  return { items, totalCount: items.length };
}

/**
 * 5. Delete a History Record & Audit Logs
 */
export async function deleteSkuHistoryRecord({ shopDomain, runId }) {
  if (!shopDomain || !runId) {
    throw new Error("Missing shopDomain or runId");
  }

  await connectMongoose();
  if (!isDbConnected()) return { success: false, message: "Database not connected" };

  const deletedRun = await SkuGenerationRun.findOneAndDelete({
    _id: runId,
    shopDomain: shopDomain.toLowerCase(),
  });

  if (!deletedRun) {
    return { success: false, message: "Record not found or unauthorized" };
  }

  await GeneratedSku.deleteMany({
    generationRunId: runId,
    shopDomain: shopDomain.toLowerCase(),
  }).catch(() => {});

  return { success: true };
}

/**
 * 6. Export SKU History as CSV
 */
export async function exportSkuHistoryRecords({ shopDomain, format = "csv" }) {
  if (!shopDomain) {
    throw new Error("Unauthorized shop domain");
  }

  await connectMongoose();
  if (!isDbConnected()) return { content: "", filename: "error.csv", mimeType: "text/csv" };

  const docs = await SkuGenerationRun.find({ shopDomain: shopDomain.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const items = docs.map(transformRunToRecord);

  const headers = ["Run ID", "Rule Name", "Rule Type", "Target Scope", "Products", "Variants", "Generated SKUs", "Status", "Date", "Time", "Credits Used"];
  const rows = items.map((r) => [
    `"${r.id}"`,
    `"${r.rule.replace(/"/g, '""')}"`,
    `"${r.ruleType}"`,
    `"${r.scope.replace(/"/g, '""')}"`,
    r.products,
    r.variants,
    `"${r.generated}"`,
    `"${r.status}"`,
    `"${r.date}"`,
    `"${r.time}"`,
    r.creditsUsed,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return {
    content: csvContent,
    filename: `sku_history_${shopDomain.split(".")[0]}_${Date.now()}.csv`,
    mimeType: "text/csv",
  };
}
