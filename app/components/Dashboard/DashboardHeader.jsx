import React from "react";
import { useNavigate } from "react-router";
import { SparkleIcon } from "./Icons";

export default function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your SKU generation performance</p>
      </div>
      <button
        className="btn-generate"
        onClick={() => navigate("/app/generate-sku")}
        type="button"
      >
        <SparkleIcon size={16} color="#FFFFFF" />
        <span>Generate SKUs</span>
      </button>
    </div>
  );
}
