"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// PCB Panel component
function PCBPanel({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "dark";
}) {
  const variants = {
    default: "bg-substrate-900 border-substrate-700",
    highlight: "bg-substrate-900 border-trace-800",
    dark: "bg-substrate-950 border-substrate-800",
  };

  return (
    <div className={`relative ${variants[variant]} border rounded-sm overflow-hidden ${className}`}>
      {/* Corner mounting holes */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-substrate-600 bg-substrate-800" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-substrate-600 bg-substrate-800" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-substrate-600 bg-substrate-800" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-substrate-600 bg-substrate-800" />

      {/* Trace lines */}
      <div className="absolute top-2 left-6 right-6 h-px bg-substrate-800" />
      <div className="absolute bottom-2 left-6 right-6 h-px bg-substrate-800" />

      {children}
    </div>
  );
}

// Via decoration
function Via({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizes = { sm: "w-1.5 h-1.5", md: "w-2.5 h-2.5" };
  return (
    <div className={`rounded-full border border-substrate-600 bg-substrate-800 ${sizes[size]}`}>
      <div className="w-full h-full rounded-full border border-substrate-700 bg-substrate-900" />
    </div>
  );
}

// Animated section reveal
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
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
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Feature section with PCB styling
function FeatureSection({
  icon,
  title,
  description,
  details,
  demo,
  reverse = false,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  demo: React.ReactNode;
  reverse?: boolean;
  delay?: number;
}) {
  return (
    <RevealSection delay={delay}>
      <div className={`grid lg:grid-cols-2 gap-12 items-start ${reverse ? "lg:flex-row-reverse" : ""}`}>
        <div className={reverse ? "lg:order-2" : ""}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-sm border border-substrate-700 bg-substrate-800 flex items-center justify-center text-trace-500">
              {icon}
            </div>
            <h2 className="text-2xl font-bold text-white font-mono">{title}</h2>
          </div>
          <p className="text-substrate-400 mb-6 leading-relaxed">{description}</p>
          <ul className="space-y-3">
            {details.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-substrate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-trace-500 mt-2 shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={reverse ? "lg:order-1" : ""}>
          <PCBPanel variant="dark" className="p-6">
            {demo}
          </PCBPanel>
        </div>
      </div>
    </RevealSection>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 border-b border-substrate-800">
        <RevealSection>
          <div className="max-w-3xl">
            <PCBPanel variant="dark" className="inline-block px-4 py-2 mb-6">
              <span className="text-xs text-substrate-500 uppercase tracking-wider font-mono">
                FEATURES_V1.0
              </span>
            </PCBPanel>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white font-mono">
              Built for engineers who speak in{" "}
              <span className="text-trace-500">MPNs</span>
            </h1>
            <p className="text-lg text-substrate-400">
              Stop wasting hours on distributor sites. Get sourcing suggestions in seconds.
            </p>
          </div>
        </RevealSection>
      </header>

      {/* Real-time Inventory Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <FeatureSection
          delay={100}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Real-time Inventory"
          description="Direct API integration with DigiKey means you're always seeing live data. No cached results from yesterday. No stale pricing. The stock count you see is the stock count that exists right now."
          details={[
            "Live stock levels updated every request",
            "Price breaks at every quantity tier",
            "Lead time visibility for backordered items",
            "Factory stock vs distributor stock breakdown",
          ]}
          demo={
            <>
              <div className="flex items-center gap-2 mb-4">
                <Via size="sm" />
                <span className="text-xs text-substrate-600 font-mono">API_RESPONSE</span>
              </div>
              <pre className="text-xs text-substrate-400 overflow-x-auto font-mono">
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

      {/* AI Optimization Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <FeatureSection
          delay={100}
          reverse
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="AI-Powered Suggestions"
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
              <div className="flex items-center gap-2 mb-4">
                <Via size="sm" />
                <span className="text-xs text-substrate-600 font-mono">AI_REASONING</span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-substrate-900 rounded-sm border-l-2 border-trace-500">
                  <div className="text-trace-500 text-xs uppercase mb-1 font-mono">Cost Optimization</div>
                  <p className="text-substrate-400">
                    Increasing order quantity from 50 to 100 units drops unit price from $2.34 to $1.87 —
                    20% savings for 2x volume.
                  </p>
                </div>
                <div className="p-3 bg-substrate-900 rounded-sm border-l-2 border-copper-500">
                  <div className="text-copper-500 text-xs uppercase mb-1 font-mono">Risk Alert</div>
                  <p className="text-substrate-400">
                    Single-source part with 6-week lead time. Consider TI equivalent TPS63020DSJR
                    available from 3 distributors.
                  </p>
                </div>
              </div>
            </>
          }
        />
      </section>

      {/* BOM Intelligence Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <FeatureSection
          delay={100}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="BOM Intelligence"
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
              <div className="flex items-center gap-2 mb-4">
                <Via size="sm" />
                <span className="text-xs text-substrate-600 font-mono">COLUMN_DETECT</span>
              </div>
              <div className="font-mono text-xs">
                <div className="grid grid-cols-4 gap-2 p-2 bg-substrate-900 rounded-sm text-substrate-500 mb-2">
                  <span>Part #</span>
                  <span>Desc</span>
                  <span>Qty</span>
                  <span>Ref Des</span>
                </div>
                <div className="grid grid-cols-4 gap-2 p-2 text-substrate-400">
                  <span className="text-trace-500">→ MPN</span>
                  <span className="text-substrate-600">→ DESC</span>
                  <span className="text-trace-500">→ QTY</span>
                  <span className="text-substrate-600">→ REF</span>
                </div>
                <div className="mt-4 p-3 bg-substrate-900 rounded-sm flex items-center gap-2">
                  <span className="text-trace-500">✓</span>
                  <span className="text-substrate-400">Detected 47 line items</span>
                </div>
              </div>
            </>
          }
        />
      </section>

      {/* Export Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <FeatureSection
          delay={100}
          reverse
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          title="Export & Integration"
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
              <div className="flex items-center gap-2 mb-4">
                <Via size="sm" />
                <span className="text-xs text-substrate-600 font-mono">EXPORT_OPTIONS</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-substrate-900 border border-substrate-700 rounded-sm hover:border-substrate-600 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium font-mono">Export to CSV</div>
                      <div className="text-substrate-500 text-xs">Full BOM with pricing</div>
                    </div>
                    <svg className="w-4 h-4 text-substrate-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>
                <div className="p-3 bg-trace-950 border border-trace-800 rounded-sm hover:border-trace-700 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium font-mono">Add to DigiKey</div>
                      <div className="text-trace-400 text-xs">Direct integration</div>
                    </div>
                    <svg className="w-4 h-4 text-trace-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          }
        />
      </section>

      {/* Integrations */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <RevealSection delay={100}>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">Distributor Integrations</h2>
            <p className="text-substrate-400 text-sm">
              Direct API connections to the distributors you use.
            </p>
          </div>

          <PCBPanel className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "DigiKey", available: true },
                { name: "Mouser", available: false },
                { name: "Arrow", available: false },
                { name: "Newark", available: false },
                { name: "LCSC", available: false },
              ].map((dist, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-sm border text-center transition-colors ${
                    dist.available
                      ? "bg-substrate-800 border-trace-700 hover:border-trace-500"
                      : "bg-substrate-900 border-substrate-700 border-dashed"
                  }`}
                >
                  <div className={`text-sm font-medium font-mono ${dist.available ? "text-white" : "text-substrate-600"}`}>
                    {dist.name}
                  </div>
                  {dist.available ? (
                    <div className="text-xs text-trace-500 mt-1 font-mono">ACTIVE</div>
                  ) : (
                    <div className="text-xs text-substrate-700 mt-1 font-mono">SOON</div>
                  )}
                </div>
              ))}
            </div>
          </PCBPanel>
        </RevealSection>
      </section>

      {/* Workflow Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <RevealSection delay={100}>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">Workflow Features</h2>
            <p className="text-substrate-400 text-sm">
              Tools to manage your sourcing workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Saved BOMs", desc: "Store and version your bills of materials. Quick access to recent projects.", available: true },
              { title: "History & Audit", desc: "Track every search, every decision. Full audit trail for compliance.", available: true },
              { title: "Team Collaboration", desc: "Share BOMs with team members. Comment on part selections.", available: false },
            ].map((feature, i) => (
              <PCBPanel
                key={i}
                variant={feature.available ? "dark" : "default"}
                className={`p-6 ${!feature.available ? "border-dashed" : ""}`}
              >
                <h3 className={`font-semibold mb-2 font-mono ${feature.available ? "text-white" : "text-substrate-500"}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm mb-4 ${feature.available ? "text-substrate-400" : "text-substrate-600"}`}>
                  {feature.desc}
                </p>
                <div className={`flex items-center gap-2 text-xs font-mono ${feature.available ? "text-trace-500" : "text-copper-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${feature.available ? "bg-trace-500" : "bg-copper-500"}`} />
                  {feature.available ? "AVAILABLE" : "COMING_SOON"}
                </div>
              </PCBPanel>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <RevealSection delay={100}>
          <PCBPanel variant="highlight" className="text-center py-12 px-8">
            {/* Decorative traces */}
            <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-trace-500/50 to-transparent" />
            <div className="absolute top-8 right-8 w-16 h-px bg-gradient-to-l from-trace-500/50 to-transparent" />

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-mono">
              Ready to optimize your sourcing?
            </h2>
            <p className="text-substrate-400 mb-8 max-w-lg mx-auto">
              Upload your first BOM and see how much time you can save. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-substrate-200 text-substrate-950 px-8 py-3 rounded-sm font-medium transition-colors font-mono"
              >
                Get Started Free
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-substrate-700 hover:border-substrate-500 text-substrate-300 hover:text-white px-8 py-3 rounded-sm font-medium transition-colors font-mono"
              >
                Back to Home
              </Link>
            </div>
          </PCBPanel>
        </RevealSection>
      </section>
    </div>
  );
}
