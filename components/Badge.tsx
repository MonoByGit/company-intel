"use client";

type BadgeVariant = "blue" | "green" | "yellow" | "red" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  blue:    { color: "#185FA5" },
  green:   { color: "#1D9E75" },
  yellow:  { color: "#B07218" },
  red:     { color: "#E24B4A" },
  neutral: { color: "#888780" },
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      style={{
        ...variantStyles[variant],
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}
