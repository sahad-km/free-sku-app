import React, { useEffect, useState } from "react";
import { SparkleIcon } from "./Icons";

export default function ScanProgressModal({ isOpen, onClose, onScanComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Scanning your store...");

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStatusText("Scanning your store...");
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatusText("Scan completed! 24 duplicate SKU values found.");
          setTimeout(() => {
            onScanComplete();
          }, 800);
          return 100;
        }
        if (prev === 25) setStatusText("Scanning products...");
        if (prev === 50) setStatusText("Checking variant SKUs...");
        if (prev === 75) setStatusText("Analyzing duplicate groups...");
        return prev + 25;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-row">
            <SparkleIcon size={18} color="#5B3DF5" />
            <h3 className="modal-title">Inventory Scan in Progress</h3>
          </div>
        </div>

        <div className="modal-body text-center">
          <div className="scan-progress-percentage">{progress}%</div>
          <p className="scan-status-text">{statusText}</p>

          <div className="scan-progress-bar-track">
            <div
              className="scan-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
