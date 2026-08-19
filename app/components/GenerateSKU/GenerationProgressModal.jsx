import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function GenerationProgressModal({ isOpen, runId, onComplete }) {
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
          setRunProgress({
            status: run.status,
            processedVariants: run.processedVariants || 0,
            totalVariants: run.totalVariants || 1,
            successfulVariants: run.successfulVariants || 0,
            failedVariants: run.failedVariants || 0,
            skippedVariants: run.skippedVariants || 0,
          });

          if (run.status === "Completed" || run.status === "COMPLETED_WITH_ERRORS" || run.status === "Failed") {
            clearInterval(intervalId);
            setTimeout(() => {
              if (onComplete) onComplete(run);
              navigate("/app/generate-history");
            }, 1000);
          }
        }
      } catch (err) {
        console.warn("Polling run status warning:", err.message);
      }
    };

    pollRunStatus();
    intervalId = setInterval(pollRunStatus, 1500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, runId, navigate, onComplete]);

  if (!isOpen) return null;

  const total = Math.max(1, runProgress.totalVariants);
  const processed = runProgress.processedVariants;
  const percent = Math.min(100, Math.round((processed / total) * 100));

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Generating SKUs...</h3>
        </div>

        <div className="modal-body" style={{ textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "#5B3DF5", marginBottom: "8px" }}>
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
                backgroundColor: "#5B3DF5",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", fontSize: "13px", color: "#6B7280", backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "8px" }}>
            <div>
              <span style={{ display: "block", color: "#059669", fontWeight: 700 }}>
                {runProgress.successfulVariants.toLocaleString()}
              </span>
              <span>Successful</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#DC2626", fontWeight: 700 }}>
                {runProgress.failedVariants.toLocaleString()}
              </span>
              <span>Failed</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#D97706", fontWeight: 700 }}>
                {runProgress.skippedVariants.toLocaleString()}
              </span>
              <span>Skipped</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
