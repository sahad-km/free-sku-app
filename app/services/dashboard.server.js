import { connectMongoose, isDbConnected } from "../db.mongoose.server";
import Shop from "../models/Shop.server";
import SkuGenerationRun from "../models/SkuGenerationRun.server";

export async function getDashboardData({ admin, session }) {
  const shopDomain = session?.shop;

  if (!shopDomain) {
    throw new Response("Unauthorized Shopify session", { status: 401 });
  }

  // 1. Ensure Mongoose connection
  await connectMongoose();
  const dbActive = isDbConnected();

  let shopDoc = null;
  let shopName = shopDomain.split(".")[0] || "Shopify Store";
  let creditsUsed = 0;
  let creditsAllocated = 100;
  let totalSkusGenerated = 0;

  // Compute dynamic credit reset date (e.g. 30 days from creation or next 20th)
  const resetDate = new Date();
  resetDate.setDate(20);
  if (new Date().getDate() >= 20) {
    resetDate.setMonth(resetDate.getMonth() + 1);
  }
  const resetDateStr = resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 2. Fetch or initialize Shop in MongoDB if DB is connected
  if (dbActive) {
    try {
      shopDoc = await Shop.findOne({ shopDomain });
      if (!shopDoc) {
        shopDoc = await Shop.create({
          shopDomain,
          shopName,
          plan: "Free",
          creditsAllocated: 500,
          creditsUsed: 0,
          installationStatus: "active",
          lastSeenAt: new Date(),
        });
      } else {
        shopDoc.lastSeenAt = new Date();
        await shopDoc.save();
      }

      if (shopDoc) {
        shopName = shopDoc.shopName || shopName;
        creditsUsed = Math.max(0, shopDoc.creditsUsed ?? 0);
        creditsAllocated = shopDoc.creditsAllocated ?? 100;
      }
    } catch (err) {
      console.warn("[Dashboard Service] MongoDB shop query warning:", err.message);
    }
  }

  // 3. Fetch real store catalog metrics (cached in MongoDB with 15-min TTL for fast reloads)
  let totalProducts = shopDoc?.totalProducts || 0;
  let totalVariants = shopDoc?.totalVariants || 0;

  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  const isCacheFresh =
    shopDoc?.catalogCountsSyncedAt &&
    Date.now() - new Date(shopDoc.catalogCountsSyncedAt).getTime() < CACHE_TTL_MS;

  if (!isCacheFresh) {
    try {
      const response = await admin.graphql(`
        query getShopDashboardMetrics {
          shop {
            name
            email
            myshopifyDomain
            currencyCode
            ianaTimezone
          }
          productsCount {
            count
          }
          productVariantsCount {
            count
          }
        }
      `);

      const resJson = await response.json();
      if (resJson?.data?.shop) {
        shopName = resJson.data.shop.name || shopName;
      }
      if (typeof resJson?.data?.productsCount?.count === "number") {
        totalProducts = resJson.data.productsCount.count;
      } else if (typeof resJson?.data?.products?.totalCount === "number") {
        totalProducts = resJson.data.products.totalCount;
      }

      if (typeof resJson?.data?.productVariantsCount?.count === "number") {
        totalVariants = resJson.data.productVariantsCount.count;
      } else if (typeof resJson?.data?.productVariants?.totalCount === "number") {
        totalVariants = resJson.data.productVariants.totalCount;
      }

      // Persist updated metrics to MongoDB shop document for fast subsequent page reloads
      if (dbActive && shopDoc) {
        shopDoc.shopName = shopName;
        shopDoc.totalProducts = totalProducts;
        shopDoc.totalVariants = totalVariants;
        shopDoc.catalogCountsSyncedAt = new Date();
        await shopDoc.save().catch((err) =>
          console.warn("[Dashboard Service] Failed to save catalog counts cache:", err.message)
        );
      }
    } catch (err) {
      console.warn(
        "[Dashboard Service] Shopify GraphQL fetch error:",
        err.message
      );
    }
  }

  // 4. Fetch real SKU generation runs and aggregate from MongoDB for this shop
  let recentActivityData = [];
  
  // Prepare date maps for Last 7 days and Last 30 days
  const daysMap7 = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    daysMap7[label] = 0;
  }

  const daysMap30 = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    daysMap30[label] = 0;
  }

  if (dbActive) {
    try {
      // Aggregate Total SKUs Generated from DB for this shopDomain
      const totalGeneratedAggregation = await SkuGenerationRun.aggregate([
        { $match: { shopDomain, status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$skusGenerated" } } },
      ]);
      totalSkusGenerated = totalGeneratedAggregation[0]?.total || 0;

      // Recent Activity from DB for this shopDomain
      const recentRunsDocs = await SkuGenerationRun.find({ shopDomain })
        .sort({ createdAt: -1 })
        .limit(5);

      if (recentRunsDocs.length > 0) {
        recentActivityData = recentRunsDocs.map((r) => ({
          id: r._id.toString(),
          rule: r.ruleName,
          status: r.status,
          products: r.totalProducts,
          variants: r.totalVariants,
          generated: r.skusGenerated > 0 ? r.skusGenerated : "—",
          date: new Date(r.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
      }

      // Trend Chart from DB for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const trendRuns = await SkuGenerationRun.find({
        shopDomain,
        status: "Completed",
        createdAt: { $gte: thirtyDaysAgo },
      });

      trendRuns.forEach((run) => {
        const label = new Date(run.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (daysMap7[label] !== undefined) {
          daysMap7[label] += run.skusGenerated;
        }
        if (daysMap30[label] !== undefined) {
          daysMap30[label] += run.skusGenerated;
        }
      });
    } catch (err) {
      console.warn("[Dashboard Service] MongoDB query error:", err.message);
    }
  }

  const chartData7 = Object.keys(daysMap7).map((date) => ({
    date,
    skus: daysMap7[date],
  }));

  const chartData30 = Object.keys(daysMap30).map((date) => ({
    date,
    skus: daysMap30[date],
  }));

  // 5. Build KPI Cards Data
  const progressPercent = Math.round((creditsUsed / creditsAllocated) * 100);

  const kpiData = [
    {
      id: "credits",
      title: "Credits used",
      value: creditsUsed.toString(),
      suffix: `/ ${creditsAllocated}`,
      subtext: `Resets on ${resetDateStr}`,
      iconType: "wallet",
      progress: progressPercent,
    },
    {
      id: "products",
      title: "Total products",
      value: totalProducts.toLocaleString(),
      subtext: "In your store",
      iconType: "bag",
    },
    {
      id: "variants",
      title: "Total variants",
      value: totalVariants.toLocaleString(),
      subtext: "Across all products",
      iconType: "layers",
    },
    {
      id: "skus",
      title: "SKUs generated",
      value: totalSkusGenerated.toLocaleString(),
      subtext: "All time",
      iconType: "sparkle",
    },
  ];

  return {
    shop: {
      domain: shopDomain,
      name: shopName,
      plan: shopDoc?.plan || "Free",
    },
    kpiData,
    chartData: chartData7,
    chartData7,
    chartData30,
    recentActivityData,
  };
}
