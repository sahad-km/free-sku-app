import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function GenerationProgressModal({ isOpen, runId, onComplete, onClose }) {
  const navigate = useNavigate();
  const [runProgress, setRunProgress] = useState({
    status: "PROCESSING",
    processedVariants: 0,
    totalVariants: 0,
    successfulVariants: 0,
    failedVariants: 0,
    skippedVariants: 0,
  });

  useEffect(() => {
    if (!isOpen || !runId) return;

    let intervalId = null;

    const pollRunStatus = async () => {
      try {
        const response = await fetch(`/api/generate-sku/runs/${runId}`);
        const resJson = await response.json();

        if (resJson.success && resJson.run) {
          const run = resJson.run;
          const isDone = run.status === "Completed" || run.status === "COMPLETED_WITH_ERRORS" || run.status === "Failed";

          const totalVal = run.totalVariants ?? run.variants ?? 1;
          const successfulVal = run.successfulVariants ?? (typeof run.generated === "number" ? run.generated : 0);
          const failedVal = run.failedVariants ?? run.failedProductsCount ?? 0;
          const skippedVal = run.skippedVariants ?? 0;
          const processedVal = run.processedVariants ?? (successfulVal + failedVal + skippedVal);

          setRunProgress({
            status: run.status,
            processedVariants: processedVal,
            totalVariants: totalVal,
            successfulVariants: successfulVal,
            failedVariants: failedVal,
            skippedVariants: skippedVal,
          });

          if (isDone) {
            clearInterval(intervalId);
            setTimeout(() => {
              if (onComplete) onComplete(run);
              navigate("/app/generate-history");
            }, 3500);
          }
        }
      } catch (err) {
        console.warn("Polling run status warning:", err.message);
      }
    };

    pollRunStatus();
    intervalId = setInterval(pollRunStatus, 600);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, runId, navigate, onComplete]);

  if (!isOpen) return null;

  const total = Math.max(1, parseInt(runProgress.totalVariants, 10) || 1);
  const isDone = runProgress.status === "Completed" || runProgress.status === "COMPLETED_WITH_ERRORS";
  const isFailed = runProgress.status === "Failed";
  const rawProcessed = parseInt(runProgress.processedVariants, 10) || 0;
  const processed = isDone ? Math.max(total, rawProcessed) : Math.min(total, rawProcessed);
  const calcPercent = Math.round((processed / total) * 100);
  const percent = isDone ? 100 : isNaN(calcPercent) ? 0 : Math.min(100, Math.max(0, calcPercent));

  const handleCloseModal = () => {
    if (onClose) onClose();
    else if (onComplete) onComplete();
  };

  const handleGoToHistory = () => {
    handleCloseModal();
    navigate("/app/generate-history");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: "480px", width: "100%", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB", padding: "16px 20px" }}>
          <h3 className="modal-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: isDone ? "#059669" : isFailed ? "#DC2626" : "#111827" }}>
            {isDone ? "✓ SKU Generation Completed!" : isFailed ? "⚠️ SKU Generation Failed" : "Generating SKUs..."}
          </h3>
          <button
            onClick={handleCloseModal}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#6B7280",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: "center", padding: "20px" }}>
          {/* Info Notice Banner */}
          <div style={{
            backgroundColor: isDone ? "#ECFDF5" : isFailed ? "#FEF2F2" : "#EFF6FF",
            border: `1px solid ${isDone ? "#A7F3D0" : isFailed ? "#FCA5A5" : "#BFDBFE"}`,
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "20px",
            fontSize: "13px",
            color: isDone ? "#065F46" : isFailed ? "#991B1B" : "#1E40AF",
            textAlign: "left",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}>
            <span style={{ fontSize: "16px", lineHeight: "1" }}>{isDone ? "✓" : isFailed ? "⚠️" : "ℹ️"}</span>
            <div>
              {isDone ? (
                <>
                  <strong>Generation Complete!</strong> Successfully processed <strong>{total.toLocaleString()}</strong> variant(s). Redirecting to SKU History...
                </>
              ) : isFailed ? (
                <>
                  <strong>Generation Failed:</strong> Something went wrong during execution. Check SKU History for error details.
                </>
              ) : (
                <>
                  <strong>Runs in background:</strong> You can safely close this window anytime. Progress is saved and updated live on the <strong>SKU History</strong> page.
                </>
              )}
            </div>
          </div>

          <div style={{ fontSize: "40px", fontWeight: 800, color: isDone ? "#059669" : isFailed ? "#DC2626" : "#5B3DF5", marginBottom: "6px" }}>
            {percent}%
          </div>

          <p style={{ color: "#374151", fontWeight: 600, fontSize: "15px", marginBottom: "16px" }}>
            {processed.toLocaleString()} of {total.toLocaleString()} variants processed
          </p>

          {/* Progress Bar Container */}
          <div style={{ width: "100%", height: "12px", backgroundColor: "#E5E7EB", borderRadius: "6px", overflow: "hidden", marginBottom: "20px" }}>
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                backgroundColor: isDone ? "#059669" : isFailed ? "#DC2626" : "#5B3DF5",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Metrics summary */}
          <div style={{ display: "flex", justifyContent: "space-around", fontSize: "13px", color: "#6B7280", backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
            <div>
              <span style={{ display: "block", color: "#059669", fontWeight: 700, fontSize: "16px" }}>
                {runProgress.successfulVariants.toLocaleString()}
              </span>
              <span>Successful</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#DC2626", fontWeight: 700, fontSize: "16px" }}>
                {runProgress.failedVariants.toLocaleString()}
              </span>
              <span>Failed</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#D97706", fontWeight: 700, fontSize: "16px" }}>
                {runProgress.skippedVariants.toLocaleString()}
              </span>
              <span>Skipped</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #F3F4F6" }}>
            <button
              onClick={handleGoToHistory}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #D1D5DB",
                backgroundColor: isDone ? "#5B3DF5" : "#ffffff",
                color: isDone ? "#ffffff" : "#374151",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              View SKU History
            </button>
            <button
              onClick={handleCloseModal}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: isDone ? "1px solid #D1D5DB" : "none",
                backgroundColor: isDone ? "#ffffff" : "#5B3DF5",
                color: isDone ? "#374151" : "#ffffff",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {isDone ? "Close" : "Close & Run in Background"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
