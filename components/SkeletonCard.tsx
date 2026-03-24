"use client";

interface SkeletonCardProps {
  title: string;
  lines?: number;
}

export function SkeletonCard({ title, lines = 3 }: SkeletonCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #D3D1C7",
        borderRadius: "4px",
        padding: "20px 24px",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="skeleton-shimmer"
          style={{ width: 80, height: 11, borderRadius: 3 }}
        />
      </div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#B4B2A9",
          marginBottom: 12,
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{
              height: 14,
              borderRadius: 3,
              width: i === lines - 1 ? "65%" : "100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
