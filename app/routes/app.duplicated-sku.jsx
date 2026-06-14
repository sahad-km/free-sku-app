import { useState } from "react";
import "../styles/app._index.css";

const recentActivity = [
    { rule: "Daily new products", status: "Completed", products: 12, variants: 18, generated: 30, date: "May 20, 2025 10:30 AM" },
    { rule: "Collection based rule", status: "Completed", products: 8, variants: 24, generated: 32, date: "May 19, 2025 09:15 AM" },
    { rule: "Vendor rule", status: "Completed", products: 15, variants: 27, generated: 42, date: "May 18, 2025 02:46 PM" },
    { rule: "Manual run", status: "Failed", products: 5, variants: 8, generated: "—", date: "May 17, 2025 11:20 AM" },
    // { rule: "Gift cards update", status: "Completed", products: 3, variants: 3, generated: 6, date: "May 16, 2025 08:10 AM" },
];

const ArrowRight = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);

export default function DuplicatedSkuPage() {
    return (
        <div className="dashboard-root">
            <div className="dashboard-inner">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">SKU History</h1>
                        <p className="dashboard-subtitle">Track and manage all your SKU generation activities.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
