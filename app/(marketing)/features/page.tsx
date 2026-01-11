"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Reveal on scroll animation
function RevealOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ASCII Feature Section
function ASCIIFeatureSection({
  number,
  title,
  description,
  details,
  demo,
  reverse = false,
  delay = 0,
}: {
  number: string;
  title: string;
  description: string;
  details: string[];
  demo: React.ReactNode;
  reverse?: boolean;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <div className={`grid lg:grid-cols-2 gap-12 items-start ${reverse ? "lg:flex-row-reverse" : ""}`}>
        <div className={reverse ? "lg:order-2" : ""}>
          {/* Section header with ASCII box */}
          <pre className="font-mono text-xs text-neutral-500 mb-4">
{`┌${"─".repeat(title.length + 6)}┐
│ ${number} ${title} │
└${"─".repeat(title.length + 6)}┘`}
          </pre>

          <p className="font-sans text-neutral-400 mb-6 leading-relaxed text-body">
            {description}
          </p>

          <ul className="space-y-3">
            {details.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-300">
                <span className="font-mono text-green-500 mt-0.5 animate-pulse">●</span>
                <span className="font-sans text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={reverse ? "lg:order-1" : ""}>
          <div className="relative group">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-green-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative border-4 border-white bg-black p-6 transition-all duration-300 hover:border-green-500">
              {demo}
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative bg-black text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 border-b-4 border-white">
        <RevealOnScroll>
          <pre className="font-mono text-xs text-neutral-500 mb-6">
{`╔════════════════════════════════════════╗
║  FEATURES v1.0 // DOCUMENTATION        ║
╚════════════════════════════════════════╝`}
          </pre>

          <h1 className="font-mono text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
            BUILT FOR ENGINEERS WHO
            <br />
            SPEAK IN <span className="text-green-500 animate-pulse">MPNs</span>
          </h1>

          <p className="font-sans text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Stop wasting hours on distributor sites. Get sourcing suggestions in seconds.
            Real-time data. AI-powered recommendations. Zero spreadsheet hell.
          </p>
        </RevealOnScroll>
      </header>

      {/* Real-time Inventory Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIFeatureSection
          delay={100}
          number="01"
          title="REAL-TIME INVENTORY"
          description="Direct API integration with DigiKey means you're always seeing live data. No cached results from yesterday. No stale pricing. The stock count you see is the stock count that exists right now."
          details={[
            "Live stock levels updated every request",
            "Price breaks at every quantity tier",
            "Lead time visibility for backordered items",
            "Factory stock vs distributor stock breakdown",
          ]}
          demo={
            <>
              <pre className="font-mono text-xs text-neutral-500 mb-4">
{`┌────────────────────────────────────────┐
│  API_RESPONSE // DigiKey Live          │
└────────────────────────────────────────┘`}
              </pre>
              <pre className="font-mono text-xs text-neutral-400 overflow-x-auto">
{`{
  "mpn": "STM32F405RGT6",
  "manufacturer": "STMicroelectronics",
  "stock": {
    "digikey": 4847,
    "factory": 12000
  },
  "pricing": [
    { "qty": 1, "unit": 11.42 },
    { "qty": 10, "unit": 10.28 },
    { "qty": 100, "unit": 8.85 }
  ],
  "leadTime": "In Stock"
}`}
              </pre>
            </>
          }
        />
      </section>

      {/* AI Suggestions Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIFeatureSection
          delay={100}
          reverse
          number="02"
          title="AI-POWERED SUGGESTIONS"
          description="Our AI doesn't just find exact matches. It understands your BOM and suggests alternatives that could save you money, reduce risk, or consolidate vendors. Every suggestion comes with reasoning you can audit."
          details={[
            "Alternate parts with equivalent specs",
            "Quantity optimization for price breaks",
            "Vendor consolidation recommendations",
            "Risk flags for sole-source or EOL parts",
            "Transparent reasoning for every suggestion",
          ]}
          demo={
            <>
              <pre className="font-mono text-xs text-neutral-500 mb-4">
{`┌────────────────────────────────────────┐
│  AI_REASONING // Claude Analysis       │
└────────────────────────────────────────┘`}
              </pre>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <pre className="font-mono text-xs text-green-500 mb-1">[COST_OPTIMIZATION]</pre>
                  <p className="font-sans text-sm text-neutral-400">
                    Increasing order quantity from 50 to 100 units drops unit price
                    from $2.34 to $1.87 — 20% savings for 2x volume.
                  </p>
                </div>
                <div className="border-l-4 border-green-300 pl-4">
                  <pre className="font-mono text-xs text-green-300 mb-1">[RISK_ALERT]</pre>
                  <p className="font-sans text-sm text-neutral-400">
                    Single-source part with 6-week lead time. Consider TI equivalent
                    TPS63020DSJR available from 3 distributors.
                  </p>
                </div>
              </div>
            </>
          }
        />
      </section>

      {/* BOM Intelligence Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIFeatureSection
          delay={100}
          number="03"
          title="BOM INTELLIGENCE"
          description="Every team exports BOMs differently. Different column names, different formats, different conventions. We handle it. Upload your CSV or Excel and we'll figure out what's what."
          details={[
            "Automatic column detection (MPN, quantity, description, etc.)",
            "Handles multiple MPN formats and conventions",
            "Fuzzy matching for partial or incorrect part numbers",
            "Description-based search when MPN fails",
            "CSV, XLSX, and ODS support",
          ]}
          demo={
            <>
              <pre className="font-mono text-xs text-neutral-500 mb-4">
{`┌────────────────────────────────────────┐
│  COLUMN_DETECT // Auto-mapping         │
└────────────────────────────────────────┘`}
              </pre>
              <pre className="font-mono text-xs text-neutral-600 mb-2">
{`INPUT:
┌──────────┬──────────┬─────┬─────────┐
│ Part #   │ Desc     │ Qty │ Ref Des │
├──────────┼──────────┼─────┼─────────┤`}
              </pre>
              <pre className="font-mono text-xs text-neutral-400 mb-4">
{`MAPPED:
  Part #   → MPN ✓
  Desc     → DESCRIPTION
  Qty      → QUANTITY ✓
  Ref Des  → REFERENCE`}
              </pre>
              <pre className="font-mono text-xs text-green-500">
{`[✓] Detected 47 line items
[✓] 45 parts matched
[!] 2 parts need review`}
              </pre>
            </>
          }
        />
      </section>

      {/* Export Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIFeatureSection
          delay={100}
          reverse
          number="04"
          title="EXPORT & INTEGRATION"
          description="Once you've optimized your BOM, get it out of the tool and into your workflow. Export to CSV for your purchasing team, or use our direct DigiKey cart integration to skip the data entry entirely."
          details={[
            "Export to CSV with full decision audit trail",
            "Direct add-to-cart for DigiKey",
            "Include AI reasoning in exports",
            "Custom export templates (coming soon)",
            "API access for automation (coming soon)",
          ]}
          demo={
            <>
              <pre className="font-mono text-xs text-neutral-500 mb-4">
{`┌────────────────────────────────────────┐
│  EXPORT_OPTIONS // Select Format       │
└────────────────────────────────────────┘`}
              </pre>
              <div className="space-y-3">
                <div className="border-4 border-neutral-700 p-4 hover:border-green-500 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <pre className="font-mono text-sm text-white group-hover:text-green-400 transition-colors">[1] EXPORT CSV</pre>
                      <span className="font-sans text-xs text-neutral-500">Full BOM with pricing</span>
                    </div>
                    <span className="font-mono text-neutral-600 group-hover:text-green-500 transition-colors">→</span>
                  </div>
                </div>
                <div className="border-4 border-green-800 bg-green-950 p-4 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <pre className="font-mono text-sm text-white group-hover:text-green-300 transition-colors">[2] ADD TO DIGIKEY</pre>
                      <span className="font-sans text-xs text-green-500 animate-pulse">Direct cart integration</span>
                    </div>
                    <span className="font-mono text-green-500 group-hover:text-green-300 transition-colors">→</span>
                  </div>
                </div>
              </div>
            </>
          }
        />
      </section>

      {/* Integrations */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <RevealOnScroll delay={100}>
          <div className="text-center mb-12">
            <pre className="font-mono text-xs text-neutral-500 mb-4 inline-block">
{`┌─────────────────────────────────┐
│  DISTRIBUTOR INTEGRATIONS       │
└─────────────────────────────────┘`}
            </pre>
            <p className="font-sans text-neutral-400">
              Direct API connections to the distributors you use.
            </p>
          </div>

          <div className="relative group">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-green-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative border-4 border-white p-8 transition-all duration-300 hover:border-green-500">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { name: "DIGIKEY", available: true },
                  { name: "MOUSER", available: false },
                  { name: "ARROW", available: false },
                  { name: "NEWARK", available: false },
                  { name: "LCSC", available: false },
                ].map((dist, i) => (
                  <div
                    key={i}
                    className={`p-4 text-center font-mono transition-all duration-300 ${
                      dist.available
                        ? "border-4 border-green-500 bg-green-950 text-white hover:border-green-400 hover:bg-green-900"
                        : "border-4 border-dashed border-neutral-700 text-neutral-600 hover:border-green-500/50 hover:text-neutral-400"
                    }`}
                  >
                    <div className="text-sm font-bold">{dist.name}</div>
                    <div className={`text-xs mt-1 ${dist.available ? "animate-pulse" : ""}`}>
                      {dist.available ? "[ACTIVE]" : "[SOON]"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Workflow Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <RevealOnScroll delay={100}>
          <div className="text-center mb-12">
            <pre className="font-mono text-xs text-neutral-500 mb-4 inline-block">
{`┌─────────────────────────────────┐
│  WORKFLOW FEATURES              │
└─────────────────────────────────┘`}
            </pre>
            <p className="font-sans text-neutral-400">
              Tools to manage your sourcing workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "SAVED BOMS", desc: "Store and version your bills of materials. Quick access to recent projects.", available: true },
              { title: "HISTORY", desc: "Track every search, every decision. Full audit trail for compliance.", available: true },
              { title: "TEAM COLLAB", desc: "Share BOMs with team members. Comment on part selections.", available: false },
            ].map((feature, i) => (
              <div
                key={i}
                className={`relative group p-6 transition-all duration-300 ${
                  feature.available
                    ? "border-4 border-white hover:border-green-500"
                    : "border-4 border-dashed border-neutral-700 hover:border-green-500/50"
                }`}
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-green-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <pre className="font-mono text-sm text-white mb-2 group-hover:text-green-400 transition-colors">{feature.title}</pre>
                <p className={`font-sans text-sm mb-4 ${feature.available ? "text-neutral-400" : "text-neutral-600"}`}>
                  {feature.desc}
                </p>
                <pre className={`font-mono text-xs ${feature.available ? "text-green-500" : "text-green-400"}`}>
                  {feature.available ? (
                    <span><span className="animate-pulse">●</span> AVAILABLE</span>
                  ) : "[○ COMING_SOON]"}
                </pre>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <RevealOnScroll delay={100}>
          <div className="relative group">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-green-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative border-4 border-white p-12 text-center transition-all duration-300 hover:border-green-500">
              {/* Corner decorations */}
              <pre className="absolute top-4 left-4 font-mono text-green-500/50 text-xs animate-pulse">╔══</pre>
              <pre className="absolute top-4 right-4 font-mono text-green-500/50 text-xs animate-pulse">══╗</pre>
              <pre className="absolute bottom-4 left-4 font-mono text-green-500/50 text-xs animate-pulse">╚══</pre>
              <pre className="absolute bottom-4 right-4 font-mono text-green-500/50 text-xs animate-pulse">══╝</pre>

              <pre className="font-mono text-white text-sm mb-6">
{`╔═══════════════════════════════════════════╗
║                                           ║
║   READY TO OPTIMIZE YOUR SOURCING?        ║
║                                           ║
╚═══════════════════════════════════════════╝`}
              </pre>

              <p className="font-sans text-neutral-400 mb-8 max-w-lg mx-auto">
                Upload your first BOM and see how much time you can save.
                No credit card required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-10 py-4 text-sm font-bold bg-green-500 text-black border-4 border-green-500 hover:bg-black hover:text-green-500 transition-all duration-300 font-mono uppercase tracking-wider"
                >
                  GET STARTED FREE
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-10 py-4 text-sm font-bold border-4 border-white text-white hover:border-green-500 hover:text-green-500 transition-all duration-300 font-mono uppercase tracking-wider"
                >
                  BACK TO HOME
                </Link>
              </div>

              <pre className="font-mono text-green-500/50 text-xs mt-8">
{`●────────────────────●────────────────────●`}
              </pre>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
