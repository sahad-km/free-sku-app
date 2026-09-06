import React, { useState, useMemo } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  GlobeIcon,
  BookIcon,
  GearIcon,
  ZapIcon,
  SearchIcon,
  CreditCardIcon,
  MailIcon,
  ClockIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
  ChatIcon,
} from "../components/Help/Icons";
import ReviewBanner from "../components/Common/ReviewBanner";
import "../styles/app.help.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

// ── FAQ Dataset ────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  { id: "all", title: "All Topics", iconComponent: GlobeIcon, color: "#4F46E5", count: 12 },
  { id: "getting-started", title: "Getting Started", iconComponent: BookIcon, color: "#0284C7", count: 3 },
  { id: "sku-layout", title: "SKU Layout & Rules", iconComponent: GearIcon, color: "#7C3AED", count: 3 },
  { id: "automation", title: "Automation & Sync", iconComponent: ZapIcon, color: "#D97706", count: 2 },
  { id: "duplicates", title: "Duplicate SKUs", iconComponent: SearchIcon, color: "#EF4444", count: 2 },
  { id: "billing", title: "Billing & Credits", iconComponent: CreditCardIcon, color: "#10B981", count: 2 },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "getting-started",
    question: "How do I generate my first set of SKUs?",
    answer: "Navigate to the 'Generate SKU' page from the top navigation. Select your scope (All Products, Specific Collections, Products, or Tags), configure your preferred SKU pattern (Prefix, Body sequence, Options, Extra Components), preview the generated SKUs in real-time, and click 'Confirm & Generate'.",
  },
  {
    id: 2,
    category: "getting-started",
    question: "Will SKU generation overwrite my existing product SKUs?",
    answer: "Only if you explicitly check the 'Overwrite existing SKUs' checkbox in Step 1 (Configure Rule) or Step 3. By default, existing SKUs are preserved and SKU Generator only populates variants missing SKUs.",
  },
  {
    id: 3,
    category: "getting-started",
    question: "Is SKU generation safe for large stores (10,000+ variants)?",
    answer: "Yes! Our engine processes SKU assignments via asynchronous batch queues using Shopify GraphQL API. Thousands of SKUs are generated reliably in the background without browser timeouts or memory overload.",
  },
  {
    id: 4,
    category: "sku-layout",
    question: "How do I add custom sequence numbering to my SKUs?",
    answer: "In Step 1 of Generate SKU, under 'Body Number Settings', choose between 'Sequential Number' or 'Continue from last sequence'. You can configure the start number, number padding (e.g. 0001 vs 1), and increment step size.",
  },
  {
    id: 5,
    category: "sku-layout",
    question: "Can I truncate or limit characters for product titles and options?",
    answer: "Yes! In the 'Extra Components' section, enable components like Product Title, Variant Title, Product Type, Vendor, or Options. Next to each component, choose how many characters to extract (e.g. first 3 characters of Product Title).",
  },
  {
    id: 6,
    category: "sku-layout",
    question: "How do Metafield extra components work?",
    answer: "Click '+ Add Metafield Component' in the Extra Components box. Enter your Metafield Namespace (e.g. 'custom') and Key (e.g. 'brand_code'). The app will automatically pull product/variant metafield values directly into your SKU format.",
  },
  {
    id: 7,
    category: "automation",
    question: "How does Auto SKU generation work when new products are created?",
    answer: "When you activate an Automation Rule in the 'Auto SKU' page, Shopify webhooks trigger our automated engine every time a new product or variant is added to your store. A SKU is automatically formatted and assigned based on your rule conditions.",
  },
  {
    id: 8,
    category: "automation",
    question: "Can I pause or edit an existing automation rule?",
    answer: "Yes! Go to the 'Auto SKU' table, use the interactive toggle switch next to any rule to Pause or Activate it, or click the '...' options menu to edit the rule configuration.",
  },
  {
    id: 9,
    category: "duplicates",
    question: "How does Duplicate SKU detection find matching SKUs?",
    answer: "Our engine scans your entire product catalog for two types of duplicates: 'Exact Matches' (identical SKU strings across multiple variants) and 'Potential Matches' (case-insensitive or whitespace-differing SKUs).",
  },
  {
    id: 10,
    category: "duplicates",
    question: "How do I resolve duplicate SKU groups?",
    answer: "In the 'Duplicated SKU' page, click 'Resolve duplicate' or 'View details' on any duplicate group. You can choose to automatically regenerate unique SKUs for the group or manually select which variant keeps the original SKU.",
  },
  {
    id: 11,
    category: "billing",
    question: "How do monthly SKU credits work?",
    answer: "Every variant that receives a generated SKU consumes 1 credit. Free tier accounts receive monthly free credits. You can view your current credit usage in the 'Scope & Credits' sidebar or upgrade to unlimited plans on the 'Plans & Pricing' page.",
  },
  {
    id: 12,
    category: "billing",
    question: "Can I cancel or downgrade my subscription plan anytime?",
    answer: "Absolutely! You can upgrade, downgrade to the Free plan, or manage your Shopify billing subscription at any time under the 'Plans & Pricing' page with zero lock-in contracts.",
  },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState(1);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchQ = item.question.toLowerCase().includes(query);
        const matchA = item.answer.toLowerCase().includes(query);
        if (!matchQ && !matchA) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleToggleFaq = (id) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="help-page-root">
      <div className="help-page-inner">
        {/* ── Hero Search Banner ──────────────────────────────────── */}
        <div className="help-hero-card">
          <h1 className="help-hero-title">How can we help you today?</h1>
          <p className="help-hero-subtitle">
            Search our knowledge base or browse answers to common SKU generation questions.
          </p>

          <div className="help-search-container">
            <span className="help-search-icon">
              <SearchIcon size={18} color="#64748B" />
            </span>
            <input
              type="text"
              className="help-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics, SKU rules, automation, or billing..."
            />
          </div>

          <div className="help-status-pills">
            <span className="status-pill">
              <ZapIcon size={13} color="#FDE047" />
              <span>Average response time: &lt; 2 hrs</span>
            </span>
            <span className="status-pill">
              <ChatIcon size={13} color="#60A5FA" />
              <span>Live Support Chat Active</span>
            </span>
            <span className="status-pill">
              <BookIcon size={13} color="#A7F3D0" />
              <span>Complete Shopify Docs</span>
            </span>
          </div>
        </div>

        {/* ── Category Cards Grid ─────────────────────────────────── */}
        <div className="category-grid">
          {FAQ_CATEGORIES.map((cat) => {
            const IconComp = cat.iconComponent;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-card ${isSelected ? "category-card-active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                type="button"
              >
                <div
                  className="category-icon-box"
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
                  <IconComp size={20} color={cat.color} />
                </div>
                <div className="category-info">
                  <h3 className="category-title">{cat.title}</h3>
                  <span className="category-count">{cat.count} FAQs</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── FAQs Accordion Section ──────────────────────────────── */}
        <div className="faq-section-card">
          <div className="faq-section-header">
            <div>
              <h2 className="faq-section-title">
                {selectedCategory === "all"
                  ? "Frequently Asked Questions"
                  : `${FAQ_CATEGORIES.find((c) => c.id === selectedCategory)?.title} Questions`}
              </h2>
              <p className="faq-section-subtitle">
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "article" : "articles"}
              </p>
            </div>

            {selectedCategory !== "all" && (
              <button
                className="btn-reset-category"
                onClick={() => setSelectedCategory("all")}
                type="button"
              >
                View all topics
              </button>
            )}
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <SearchIcon size={32} color="#94A3B8" />
                <h4 style={{ margin: "10px 0 4px 0", color: "#1E293B" }}>No matching answers found</h4>
                <p style={{ margin: 0, color: "#64748B", fontSize: "13px" }}>
                  Try different keywords or browse all categories above.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div key={faq.id} className="faq-item">
                    <button
                      className="faq-question-button"
                      onClick={() => handleToggleFaq(faq.id)}
                      type="button"
                    >
                      <span>{faq.question}</span>
                      <span style={{ display: "inline-flex", alignItems: "center" }}>
                        {isOpen ? (
                          <MinusIcon size={16} color="#6366F1" />
                        ) : (
                          <PlusIcon size={16} color="#6366F1" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="faq-answer-box">
                        <p style={{ margin: 0 }}>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Direct Support & Live Assistance ───────────────────── */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            padding: "24px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ maxWidth: "560px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Still have questions or need help?
            </h2>
            <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 14px 0", lineHeight: "1.5" }}>
              Our support team is always available. Start a live chat session or email us directly and we will assist you right away.
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px", color: "#475569" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MailIcon size={16} color="#5B3DF5" />
                <span>catalystcreationapps@gmail.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ClockIcon size={16} color="#5B3DF5" />
                <span>Response within 24 hours</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheckIcon size={16} color="#16A34A" />
                <span>Shopify App Guarantee</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
                  window.Tawk_API.maximize();
                } else {
                  window.location.href = "mailto:catalystcreationapps@gmail.com?subject=SKU%20App%20Support%20Request";
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                backgroundColor: "#5B3DF5",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(91, 61, 245, 0.2)",
              }}
            >
              <ChatIcon size={16} color="#FFFFFF" />
              <span>Start Live Chat</span>
            </button>

            <a
              href="mailto:catalystcreationapps@gmail.com?subject=SKU%20App%20Support%20Request"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                backgroundColor: "#FFFFFF",
                color: "#334155",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <MailIcon size={15} color="#64748B" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        {/* Bottom Review Callout */}
        <ReviewBanner
          title="Love using Free SKU Bulk Generator?"
          description="A quick 5-star review on the Shopify App Store means the world to our independent developer team. Have suggestions or feature requests? Contact us directly anytime!"
        />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return boundary.error();
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
