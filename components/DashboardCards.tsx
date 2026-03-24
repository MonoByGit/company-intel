"use client";

import { Badge } from "./Badge";
import { MetricCard } from "./MetricCard";
import { OpportunityScore } from "./OpportunityScore";

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "0.5px solid #D3D1C7",
  borderRadius: "4px",
  padding: "20px 24px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#B4B2A9",
  marginBottom: 12,
};

const headingStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: "#2C2C2A",
  letterSpacing: "-0.02em",
  marginBottom: 4,
};

// ─── Snapshot ────────────────────────────────────────────────────────────────
export function SnapshotCard({ data }: { data: { paragraph: string } }) {
  return (
    <div className="card-fade-in" style={cardStyle}>
      <p style={sectionLabelStyle}>Company Snapshot</p>
      <p style={{ fontSize: 15, color: "#2C2C2A", lineHeight: 1.7 }}>{data.paragraph}</p>
    </div>
  );
}

// ─── Business Model ───────────────────────────────────────────────────────────
export function BusinessModelCard({
  data,
}: {
  data: { description: string; model_type: string; market_position: string };
}) {
  return (
    <div className="card-fade-in" style={cardStyle}>
      <p style={sectionLabelStyle}>Business Model</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Badge variant="blue">{data.model_type}</Badge>
        <Badge variant="neutral">{data.market_position}</Badge>
      </div>
      <p style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.7 }}>{data.description}</p>
    </div>
  );
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export function ChallengesCard({
  data,
}: {
  data: { items: Array<{ title: string; detail: string }> };
}) {
  return (
    <div className="card-fade-in" style={cardStyle}>
      <p style={sectionLabelStyle}>Current Challenges</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#FCEBEB",
                color: "#E24B4A",
                fontSize: 11,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </span>
            <div>
              <p style={headingStyle}>{item.title}</p>
              <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.6 }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────
const confidenceVariant = (c: string) =>
  c === "high" ? "green" : c === "medium" ? "yellow" : "neutral";

export function TechStackCard({
  data,
}: {
  data: { items: Array<{ name: string; category: string; confidence: string }> };
}) {
  return (
    <div className="card-fade-in" style={cardStyle}>
      <p style={sectionLabelStyle}>Tech Stack Signals</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        {data.items.map((item, i) => (
          <div
            key={i}
            style={{
              background: "#F7F6F2",
              borderRadius: 6,
              padding: "10px 12px",
              border: "0.5px solid #E8E6DE",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A", marginBottom: 4 }}>
              {item.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#888780" }}>{item.category}</span>
              <Badge variant={confidenceVariant(item.confidence)}>
                {item.confidence}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Growth Signals ───────────────────────────────────────────────────────────
const sentimentVariant = (s: string) =>
  s === "positive" ? "green" : s === "negative" ? "red" : "neutral";

export function GrowthSignalsCard({
  data,
}: {
  data: {
    signals: Array<{ type: string; detail: string; sentiment: string }>;
    funding_stage: string;
    team_size_estimate: string;
  };
}) {
  return (
    <div className="card-fade-in" style={cardStyle}>
      <p style={sectionLabelStyle}>Growth Signals</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <MetricCard label="Funding Stage" value={data.funding_stage} />
        <MetricCard label="Team Size" value={data.team_size_estimate} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.signals.map((signal, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Badge variant={sentimentVariant(signal.sentiment)}>{signal.type}</Badge>
            <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.6, marginTop: 1 }}>
              {signal.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Conversation Starters ────────────────────────────────────────────────────
export function ConversationStartersCard({
  data,
}: {
  data: { questions: Array<{ question: string; rationale: string }> };
}) {
  return (
    <div className="card-fade-in" style={cardStyle}>
      <p style={sectionLabelStyle}>Conversation Starters</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.questions.map((q, i) => (
          <div
            key={i}
            style={{
              borderLeft: "2px solid #185FA5",
              paddingLeft: 14,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A", marginBottom: 4 }}>
              {q.question}
            </p>
            <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>{q.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Opportunity Score re-export ──────────────────────────────────────────────
export { OpportunityScore };
