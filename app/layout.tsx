import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Intel — Business Intelligence Dashboard",
  description: "Real-time company intelligence from a single search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
