import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// Global fallback handler
let globalToastHandler = null;
export function showGlobalToast(message, type = "info") {
  if (globalToastHandler) {
    globalToastHandler(message, type);
  } else {
    console.log(`[Toast ${type}]:`, message);
  }
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    if (!message) return;
    setToast({ message, type, id: Date.now() });

    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, duration);
  }, []);

  useEffect(() => {
    globalToastHandler = showToast;
  }, [showToast]);

  const handleClose = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className="toast-notification-banner"
          style={{
            position: "fixed",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 20px",
            borderRadius: "10px",
            backgroundColor: "#1E293B",
            color: "#FFFFFF",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
            fontSize: "13.5px",
            fontWeight: "500",
            animation: "toastSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            maxWidth: "90vw",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: "16px", display: "inline-flex", alignItems: "center" }}>
            {toast.type === "success" && "✅"}
            {toast.type === "error" && "⚠️"}
            {toast.type === "warning" && "🔔"}
            {toast.type === "info" && "ℹ️"}
          </span>

          <span style={{ flex: 1, lineHeight: "1.3" }}>{toast.message}</span>

          <button
            onClick={handleClose}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              fontSize: "14px",
              padding: "2px 6px",
              borderRadius: "4px",
              marginLeft: "8px",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
