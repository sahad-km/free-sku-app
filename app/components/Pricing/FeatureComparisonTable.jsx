import React from "react";
import { CheckIcon, CrossIcon } from "./Icons";
import { comparisonMatrix } from "./mockData";

export default function FeatureComparisonTable() {
  const renderCellContent = (val) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="table-check-icon">
          <CheckIcon size={11} color="#16A34A" />
        </div>
      ) : (
        <div className="table-cross-icon">
          <CrossIcon size={14} color="#DC2626" />
        </div>
      );
    }
    return <span className="matrix-val-text">{val}</span>;
  };

  return (
    <div className="card comparison-table-card">
      <div className="comparison-header">
        <h3 className="comparison-title">Compare plans</h3>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="th-feature">FEATURES</th>
              <th className="th-plan">FREE</th>
              <th className="th-plan">BASIC</th>
              <th className="th-plan th-pro-popular">
                <div className="pro-header-badge-col">
                  <span>PRO</span>
                  <span className="pro-tag-sub">MOST POPULAR</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonMatrix.map((row, idx) => (
              <tr key={idx}>
                <td className="td-feature-name">{row.feature}</td>
                <td className="td-plan-cell">{renderCellContent(row.free)}</td>
                <td className="td-plan-cell">{renderCellContent(row.basic)}</td>
                <td className="td-plan-cell td-pro-col">{renderCellContent(row.pro)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
