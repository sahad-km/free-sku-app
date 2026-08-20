import React, { useState, useMemo } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useToast } from "../components/Common/Toast";
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
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState(1);

  // Form State
  const [ticketTopic, setTicketTopic] = useState("general");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast("Please complete all required fields.", "warning");
      return;
    }

    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketSubject("");
      setTicketMessage("");
      showToast("Support ticket submitted! Our team will respond shortly.", "success");
    }, 600);
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
              <div
                key={cat.id}
                className={`category-card ${isSelected ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div
                  className="category-icon-wrapper"
                  style={{
                    backgroundColor: isSelected ? "#E0E7FF" : "#F1F5F9",
                  }}
                >
                  <IconComp size={20} color={cat.color} />
                </div>
                <div>
                  <h3 className="category-title">{cat.title}</h3>
                  <p className="category-count">{cat.count} articles</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FAQ Accordion Section ───────────────────────────────── */}
        <div className="faq-section-card">
          <div className="faq-header-row">
            <h2 className="faq-section-title">
              {selectedCategory === "all"
                ? "Frequently Asked Questions"
                : FAQ_CATEGORIES.find((c) => c.id === selectedCategory)?.title || "FAQs"}
            </h2>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
              Showing {filteredFaqs.length} answers
            </span>
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#64748B" }}>
                <p style={{ fontWeight: 600, fontSize: "15px", margin: "0 0 6px 0" }}>
                  No matching help articles found
                </p>
                <p style={{ fontSize: "13px", margin: 0 }}>
                  Try adjusting your search query or choosing another category above.
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

        {/* ── Contact Support & Info Grid ─────────────────────────── */}
        <div className="contact-section-grid">
          {/* Left: Contact Form */}
          <div className="support-form-card">
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Still have questions? Contact Support
            </h2>
            <p style={{ fontSize: "13.5px", color: "#64748B", margin: "0 0 20px 0" }}>
              Send a direct message to our support team and we will get back to you within a few hours.
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Issue Topic</label>
                <select
                  className="form-select"
                  value={ticketTopic}
                  onChange={(e) => setTicketTopic(e.target.value)}
                >
                  <option value="general">General Question</option>
                  <option value="sku-rule">SKU Layout / Formatting Help</option>
                  <option value="automation">Auto SKU & Webhooks</option>
                  <option value="duplicate">Duplicate SKU Resolution</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Need help configuring product option SKU sequence"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  required
                />
              </div>

              <button
                className="btn-submit-ticket"
                type="submit"
                disabled={isSubmittingTicket}
              >
                {isSubmittingTicket ? "Submitting..." : "Send Support Message"}
              </button>
            </form>
          </div>

          {/* Right: Support Info Card */}
          <div className="support-info-card">
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#1E293B" }}>
              Customer Support Center
            </h3>

            <div className="info-item">
              <div className="info-icon-box">
                <MailIcon size={18} color="#4F46E5" />
              </div>
              <div>
                <h4 className="info-title">Email Support</h4>
                <p className="info-desc">support@free-sku-app.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box">
                <ClockIcon size={18} color="#4F46E5" />
              </div>
              <div>
                <h4 className="info-title">Support Hours</h4>
                <p className="info-desc">Monday – Saturday: 24/7 Priority Support for Pro & Unlimited subscribers.</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box">
                <ShieldCheckIcon size={18} color="#4F46E5" />
              </div>
              <div>
                <h4 className="info-title">Shopify App Guarantee</h4>
                <p className="info-desc">Built strictly adhering to Shopify App Bridge and GraphQL performance standards.</p>
              </div>
            </div>
          </div>
        </div>
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
