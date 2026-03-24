"use client";

interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div
      style={{
        background: "#F1EFE8",
        borderRadius: 8,
        padding: "12px 16px",
        minWidth: 120,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "#888780",
          fontWeight: 400,
          marginBottom: 4,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: "#2C2C2A",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
    </div>
  );
}
