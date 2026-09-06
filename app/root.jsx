import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { ToastProvider } from "./components/Common/Toast";

function TawkToChat() {
  useEffect(() => {
    if (typeof window === "undefined" || window.Tawk_API) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: "bl",
          xOffset: "20px",
          yOffset: "20px",
        },
        mobile: {
          position: "bl",
          xOffset: "10px",
          yOffset: "10px",
        },
      },
    };
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/6a9d6ce297d45a34493329e9/1k1rf2m0h";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    document.head.appendChild(s1);
  }, []);

  return null;
}

function ContentsquareAnalytics() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('script[src*="contentsquare.net"]')) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://t.contentsquare.net/uxa/c546ad31b085a.js";

    document.head.appendChild(script);
  }, []);

  return null;
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <ToastProvider>
          <Outlet />
        </ToastProvider>
        <TawkToChat />
        <ContentsquareAnalytics />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
