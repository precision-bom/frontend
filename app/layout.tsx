import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrecisionBOM - AI-Powered BOM Sourcing",
  description:
    "Precision sourcing with DigiKey. AI-powered BOM optimization for accurate, reliable component sourcing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-substrate-950 text-silkscreen min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
