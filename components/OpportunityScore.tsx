"use client";

interface OpportunityScoreProps {
  score: number;
  rationale: string;
  factors: string[];
}

function getScoreStyle(score: number) {
  if (score <= 4) return { color: "#E24B4A", bg: "#FCEBEB", label: "Low" };
  if (score <= 7) return { color: "#EF9F27", bg: "#FAEEDA", label: "Medium" };
  return { color: "#1D9E75", bg: "#E1F5EE", label: "High" };
}

export function OpportunityScore({ score, rationale, factors }: OpportunityScoreProps) {
  const { color, bg, label } = getScoreStyle(score);
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (score / 10) * circumference;

  return (
    <div
      className="card-fade-in"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #D3D1C7",
        borderRadius: "4px",
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#B4B2A9",
          marginBottom: 20,
        }}
      >
        Opportunity Score
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        {/* Circular Progress */}
        <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
          <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle
              cx="55"
              cy="55"
              r="45"
              fill="none"
              stroke="#F1EFE8"
              strokeWidth="8"
            />
            {/* Progress */}
            <circle
              cx="55"
              cy="55"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 32,
                fontWeight: 500,
                color,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {score}
            </span>
            <span style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>/10</span>
          </div>
        </div>

        {/* Score details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: "inline-block",
              background: bg,
              color,
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: 10,
            }}
          >
            {label} Opportunity
          </div>
          <p style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.6, marginBottom: 14 }}>
            {rationale}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {factors.map((factor, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: color,
                    marginTop: 7,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: "#888780", lineHeight: 1.5 }}>
                  {factor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
