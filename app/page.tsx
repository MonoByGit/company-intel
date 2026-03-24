"use client";

import { useState, useEffect, useRef } from "react";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  SnapshotCard,
  BusinessModelCard,
  ChallengesCard,
  TechStackCard,
  GrowthSignalsCard,
  ConversationStartersCard,
  OpportunityScore,
} from "@/components/DashboardCards";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionKey =
  | "snapshot"
  | "business_model"
  | "challenges"
  | "tech_stack"
  | "growth_signals"
  | "conversation_starters"
  | "opportunity_score";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionData = any;

interface Section {
  section: SectionKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface SearchHistory {
  company: string;
  url?: string;
  timestamp: number;
}

const SECTION_ORDER: SectionKey[] = [
  "snapshot",
  "business_model",
  "challenges",
  "tech_stack",
  "growth_signals",
  "conversation_starters",
  "opportunity_score",
];

const SECTION_LABELS: Record<SectionKey, string> = {
  snapshot: "Company Snapshot",
  business_model: "Business Model",
  challenges: "Current Challenges",
  tech_stack: "Tech Stack Signals",
  growth_signals: "Growth Signals",
  conversation_starters: "Conversation Starters",
  opportunity_score: "Opportunity Score",
};

const SKELETON_LINES: Record<SectionKey, number> = {
  snapshot: 3,
  business_model: 4,
  challenges: 5,
  tech_stack: 4,
  growth_signals: 4,
  conversation_starters: 5,
  opportunity_score: 3,
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "#185FA5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
        </svg>
      </div>
      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "#2C2C2A",
          letterSpacing: "-0.02em",
        }}
      >
        Company Intel
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<Record<string, SectionData>>({});
  const [loadingSections, setLoadingSections] = useState<Set<SectionKey>>(new Set());
  const [searchedCompany, setSearchedCompany] = useState("");
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [hoveredHistory, setHoveredHistory] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("company-intel-history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const saveToHistory = (companyName: string, companyUrl?: string) => {
    const entry: SearchHistory = {
      company: companyName,
      url: companyUrl,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const filtered = prev.filter(
        (h) => h.company.toLowerCase() !== companyName.toLowerCase()
      );
      const updated = [entry, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("company-intel-history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSearch = async (companyName?: string, companyUrl?: string) => {
    const name = companyName || company.trim();
    const websiteUrl = companyUrl !== undefined ? companyUrl : url.trim();
    if (!name) return;

    setIsLoading(true);
    setError("");
    setSections({});
    setSearchedCompany(name);

    const allLoading = new Set(SECTION_ORDER);
    setLoadingSections(allLoading);

    saveToHistory(name, websiteUrl || undefined);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: name, url: websiteUrl }),
      });

      if (!res.ok) throw new Error("API request failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed: Section = JSON.parse(trimmed);
            if (parsed.section === ("error" as SectionKey)) {
              setError(parsed.data.message || "Unknown error");
              continue;
            }
            setSections((prev) => ({ ...prev, [parsed.section]: parsed.data }));
            setLoadingSections((prev) => {
              const next = new Set(prev);
              next.delete(parsed.section as SectionKey);
              return next;
            });
          } catch {}
        }
      }
    } catch {
      setError("Failed to analyze company. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setLoadingSections(new Set());
    }
  };

  const removeFromHistory = (companyName: string) => {
    setHistory((prev) => {
      const updated = prev.filter(
        (h) => h.company.toLowerCase() !== companyName.toLowerCase()
      );
      try {
        localStorage.setItem("company-intel-history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleExportPDF = () => {
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    // Set document title so browser uses it as the default filename
    const originalTitle = document.title;
    const slug = searchedCompany.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const dateSlug = new Date().toISOString().slice(0, 10);
    document.title = `company-intel-${slug}-${dateSlug}`;
    // Write cover info into the print cover element
    const coverName = document.getElementById("print-cover-name");
    const coverDate = document.getElementById("print-cover-date");
    if (coverName) coverName.textContent = searchedCompany;
    if (coverDate) coverDate.textContent = date;
    window.print();
    document.title = originalTitle;
  };

  const handleReset = () => {
    setSections({});
    setLoadingSections(new Set());
    setSearchedCompany("");
    setError("");
    setIsLoading(false);
    setCompany("");
    setUrl("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const hasResults = Object.keys(sections).length > 0 || loadingSections.size > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2" }}>
      {/* Header */}
      <header
        className="no-print"
        style={{
          padding: "16px 24px",
          borderBottom: "0.5px solid #D3D1C7",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Logo />
        {hasResults && (
          <span style={{ fontSize: 13, color: "#888780" }}>
            Results for{" "}
            <strong style={{ color: "#2C2C2A", fontWeight: 500 }}>{searchedCompany}</strong>
          </span>
        )}
      </header>

      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "flex",
          gap: 28,
        }}
      >
        {/* Sidebar — search history */}
        {history.length > 0 && (
          <aside style={{ width: 180, flexShrink: 0, paddingTop: 32 }}>
            <div style={{ position: "sticky", top: 80 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#B4B2A9",
                  marginBottom: 10,
                }}
              >
                Recent
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 4,
                      background: hoveredHistory === i ? "#F1EFE8" : "none",
                    }}
                    onMouseEnter={() => setHoveredHistory(i)}
                    onMouseLeave={() => setHoveredHistory(null)}
                  >
                    <button
                      onClick={() => {
                        setCompany(h.company);
                        setUrl(h.url || "");
                        handleSearch(h.company, h.url);
                      }}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px 8px",
                        textAlign: "left",
                        fontSize: 13,
                        color: "#888780",
                      }}
                    >
                      {h.company}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(h.company);
                      }}
                      title="Remove"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 6px",
                        fontSize: 11,
                        color: "#B4B2A9",
                        flexShrink: 0,
                        opacity: hoveredHistory === i ? 1 : 0,
                        transition: "opacity 120ms",
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#E24B4A")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#B4B2A9")}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {!hasResults ? (
            /* ─── Landing / search state ─── */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 80,
                paddingBottom: 40,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 520 }}>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 500,
                    color: "#2C2C2A",
                    letterSpacing: "-0.03em",
                    marginBottom: 10,
                    lineHeight: 1.2,
                  }}
                >
                  Know any company
                  <br />
                  before you walk in.
                </h1>
                <p style={{ fontSize: 15, color: "#888780", lineHeight: 1.6 }}>
                  Type a company name. Get a full intelligence briefing in seconds.
                </p>
              </div>

              <div style={{ width: "100%", maxWidth: 520 }}>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "0.5px solid #D3D1C7",
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Company name — e.g. Founda Health"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    autoFocus
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: 15,
                      color: "#2C2C2A",
                      background: "transparent",
                      marginBottom: 10,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Website URL (optional)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    style={{
                      width: "100%",
                      border: "none",
                      borderTop: "0.5px solid #E8E6DE",
                      outline: "none",
                      fontSize: 13,
                      color: "#888780",
                      background: "transparent",
                      paddingTop: 10,
                    }}
                  />
                </div>

                <button
                  onClick={() => handleSearch()}
                  disabled={!company.trim()}
                  style={{
                    width: "100%",
                    padding: "11px 20px",
                    background: company.trim() ? "#185FA5" : "#D3D1C7",
                    color: company.trim() ? "#FFFFFF" : "#B4B2A9",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: company.trim() ? "pointer" : "not-allowed",
                    letterSpacing: "-0.01em",
                    transition: "background 0.15s",
                  }}
                >
                  Generate Intelligence Brief
                </button>
              </div>
            </div>
          ) : (
            /* ─── Results state ─── */
            <div style={{ paddingTop: 32 }}>
              {/* Inline search bar */}
              <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSearch()}
                  placeholder="Search another company..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    border: "0.5px solid #B4B2A9",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: "#2C2C2A",
                    background: "#FFFFFF",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !company.trim()}
                  style={{
                    padding: "10px 16px",
                    background: "#185FA5",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: isLoading ? "wait" : "pointer",
                    opacity: isLoading || !company.trim() ? 0.6 : 1,
                  }}
                >
                  {isLoading ? "Analyzing…" : "Search"}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "#FCEBEB",
                    border: "0.5px solid #F3CECE",
                    borderRadius: 6,
                    padding: "12px 16px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#E24B4A",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Print-only cover page */}
              <div id="print-cover" className="print-only" style={{ display: "none" }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#888780", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Company Intelligence Brief
                  </span>
                </div>
                <h1
                  id="print-cover-name"
                  style={{ fontSize: 32, fontWeight: 500, color: "#2C2C2A", letterSpacing: "-0.03em", margin: "8px 0 6px" }}
                />
                <p id="print-cover-date" style={{ fontSize: 13, color: "#888780" }} />
                <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6 }}>Powered by Company Intel</p>
                <hr style={{ border: "none", borderTop: "0.5px solid #D3D1C7", margin: "20px 0" }} />
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SECTION_ORDER.map((key) => {
                  const data = sections[key];
                  const isLoadingSection = loadingSections.has(key);

                  if (!data && !isLoadingSection) return null;
                  if (isLoadingSection && !data) {
                    return (
                      <SkeletonCard
                        key={key}
                        title={SECTION_LABELS[key]}
                        lines={SKELETON_LINES[key]}
                      />
                    );
                  }
                  if (!data) return null;

                  switch (key) {
                    case "snapshot":
                      return <SnapshotCard key={key} data={data} />;
                    case "business_model":
                      return <BusinessModelCard key={key} data={data} />;
                    case "challenges":
                      return <ChallengesCard key={key} data={data} />;
                    case "tech_stack":
                      return <TechStackCard key={key} data={data} />;
                    case "growth_signals":
                      return <GrowthSignalsCard key={key} data={data} />;
                    case "conversation_starters":
                      return <ConversationStartersCard key={key} data={data} />;
                    case "opportunity_score":
                      return (
                        <OpportunityScore
                          key={key}
                          score={data.score}
                          rationale={data.rationale}
                          factors={data.factors}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </div>

              {/* Actions */}
              {!isLoading && Object.keys(sections).length > 0 && (
                <div
                  className="no-print"
                  style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}
                >
                  <button
                    onClick={handleReset}
                    style={{
                      background: "transparent",
                      border: "0.5px solid #D3D1C7",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#888780",
                      cursor: "pointer",
                      letterSpacing: "-0.01em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#185FA5";
                      e.currentTarget.style.color = "#185FA5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#D3D1C7";
                      e.currentTarget.style.color = "#888780";
                    }}
                  >
                    Search another company
                  </button>
                  <button
                    onClick={handleExportPDF}
                    style={{
                      background: "#185FA5",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#E6F1FB",
                      cursor: "pointer",
                      letterSpacing: "-0.01em",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#155089")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#185FA5")}
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
