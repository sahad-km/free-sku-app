import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

import { ensureShopDetailsSynced } from "../services/shop/shopSyncService.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  if (admin && session?.shop) {
    ensureShopDetailsSynced({ admin, shopDomain: session.shop }).catch((err) =>
      console.warn("[AppLoader] Shop sync error:", err.message)
    );
  }

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/generate-sku">Generate SKU</s-link>
        <s-link href="/app/generate-history">Generate History</s-link>
        <s-link href="/app/auto-sku">Auto SKU</s-link>
        <s-link href="/app/duplicated-sku">Duplicated SKU</s-link>
        <s-link href="/app/pricing">Plans & Pricing</s-link>
        <s-link href="/app/help">FAQ & Help</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
