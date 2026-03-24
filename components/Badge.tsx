"use client";

type BadgeVariant = "blue" | "green" | "yellow" | "red" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  blue: { background: "#EBF2FB", color: "#185FA5" },
  green: { background: "#E1F5EE", color: "#1D9E75" },
  yellow: { background: "#FAEEDA", color: "#B07218" },
  red: { background: "#FCEBEB", color: "#E24B4A" },
  neutral: { background: "#F1EFE8", color: "#888780" },
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      style={{
        ...variantStyles[variant],
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 20,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}
