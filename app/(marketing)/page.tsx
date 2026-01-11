"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ASCII Box component - renders text inside ASCII art frame
function ASCIIBox({
  children,
  className = "",
  variant = "single",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "single" | "double" | "heavy";
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="font-mono text-white">{children}</div>
    </div>
  );
}

// Parallax section wrapper
function ParallaxSection({
  children,
  className = "",
  speed = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.innerHeight - rect.top;
        setOffset(scrolled * speed * 0.1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div style={{ transform: `translateY(${offset}px)` }} className="transition-transform duration-100 ease-out">
        {children}
      </div>
    </div>
  );
}

// Reveal on scroll component
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

// ASCII Feature Card
function ASCIIFeatureCard({
  title,
  description,
  delay = 0,
}: {
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <div className="border-4 border-white bg-black p-0 hover:bg-white hover:text-black transition-colors duration-200 group">
        <pre className="font-mono text-xs text-white group-hover:text-black whitespace-pre p-4 leading-tight">
{`┌${"─".repeat(title.length + 2)}┐
│ ${title} │──────●
└${"─".repeat(title.length + 2)}┘`}
        </pre>
        <div className="px-4 pb-4">
          <p className="font-sans text-sm text-neutral-400 group-hover:text-neutral-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </RevealOnScroll>
  );
}

// ASCII Stat component
function ASCIIStat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <RevealOnScroll delay={delay} className="text-center">
      <div className="font-mono">
        <div className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
          {value}
        </div>
        <pre className="text-neutral-500 text-xs mt-1">{"─".repeat(Math.max(value.length, label.length))}</pre>
        <div className="text-xs text-neutral-500 uppercase tracking-widest mt-1 font-sans">
          {label}
        </div>
      </div>
    </RevealOnScroll>
  );
}

// ASCII separator line
function ASCIISeparator({ className = "" }: { className?: string }) {
  return (
    <pre className={`font-mono text-neutral-600 text-center text-sm ${className}`}>
      ●────────────────●────────────────●────────────────●
    </pre>
  );
}

export default function LandingPage() {
  return (
    <div className="relative bg-black text-white overflow-hidden min-h-screen">
      {/* ASCII Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <pre className="font-mono text-white text-xs leading-none whitespace-pre">
{`║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
════════════════════════════════════════════════════════════════════════════════
║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
════════════════════════════════════════════════════════════════════════════════
║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
════════════════════════════════════════════════════════════════════════════════
║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║║
════════════════════════════════════════════════════════════════════════════════`}
        </pre>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 border-b-4 border-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Status indicator */}
            <ParallaxSection speed={0.3}>
              <pre className="font-mono text-xs text-neutral-500 mb-8 inline-block">
{`[■■■■■■■■■■] SYSTEM ONLINE`}
              </pre>
            </ParallaxSection>

            {/* Main ASCII Art Logo */}
            <ParallaxSection speed={0.2}>
              <pre className="font-mono text-white text-sm md:text-base leading-tight inline-block text-left mb-8">
{`╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     ██████╗ ██████╗ ███████╗ ██████╗██╗███████╗██╗ ██████╗ ███╗   ██╗    ║
║     ██╔══██╗██╔══██╗██╔════╝██╔════╝██║██╔════╝██║██╔═══██╗████╗  ██║    ║
║     ██████╔╝██████╔╝█████╗  ██║     ██║███████╗██║██║   ██║██╔██╗ ██║    ║
║     ██╔═══╝ ██╔══██╗██╔══╝  ██║     ██║╚════██║██║██║   ██║██║╚██╗██║    ║
║     ██║     ██║  ██║███████╗╚██████╗██║███████║██║╚██████╔╝██║ ╚████║    ║
║     ╚═╝     ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ║
║                                                          ║
║                    ██████╗  ██████╗ ███╗   ███╗                          ║
║                    ██╔══██╗██╔═══██╗████╗ ████║                          ║
║                    ██████╔╝██║   ██║██╔████╔██║                          ║
║                    ██╔══██╗██║   ██║██║╚██╔╝██║                          ║
║                    ██████╔╝╚██████╔╝██║ ╚═╝ ██║                          ║
║                    ╚═════╝  ╚═════╝ ╚═╝     ╚═╝                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`}
              </pre>
            </ParallaxSection>

            <ParallaxSection speed={0.15}>
              <h2 className="font-mono text-2xl md:text-3xl text-white mb-4 tracking-tight">
                PRECISION SOURCING FOR PRECISION ENGINEERING
              </h2>
            </ParallaxSection>

            <p className="font-sans text-lg text-neutral-400 mb-12 max-w-xl mx-auto leading-relaxed">
              AI-powered BOM optimization with real-time DigiKey inventory data.
              Find parts, compare prices, and source with confidence.
            </p>

            {/* CTA Buttons - Brutalist style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-sm font-bold bg-white text-black border-4 border-white hover:bg-black hover:text-white transition-colors duration-200 font-mono uppercase tracking-wider"
              >
                GET STARTED FREE
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold border-4 border-white text-white hover:bg-white hover:text-black transition-colors duration-200 font-mono uppercase tracking-wider"
              >
                SEE FEATURES
              </Link>
            </div>

            {/* Terminal Demo */}
            <ParallaxSection speed={0.1}>
              <div className="max-w-2xl mx-auto border-4 border-white bg-black">
                <div className="border-b-4 border-white px-4 py-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500">■ TERMINAL_01</span>
                </div>
                <pre className="font-mono text-sm text-left p-6 leading-relaxed">
{`$ upload bom.csv
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 78%     │
└─────────────────────────────────────────┘
# Parsing 47 components...
# Querying DigiKey API...
# Cross-referencing Mouser inventory...

┌─────────────────────────────────────────┐
│  STATUS: ALL PARTS IN STOCK             │
│  TOTAL:  $2,847.32                      │
│  SAVINGS: $423.18 (13%)                 │
└─────────────────────────────────────────┘

[✓] Ready to export`}
                </pre>
              </div>
            </ParallaxSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b-4 border-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ASCIISeparator className="mb-12" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ASCIIStat value="15M+" label="Parts" delay={0} />
            <ASCIIStat value="2,300+" label="Suppliers" delay={100} />
            <ASCIIStat value="REAL-TIME" label="Stock" delay={200} />
            <ASCIIStat value="SAME-DAY" label="Shipping" delay={300} />
          </div>

          <ASCIISeparator className="mt-12" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-b-4 border-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.2}>
            <div className="text-center mb-16">
              <pre className="font-mono text-xs text-neutral-500 mb-4 inline-block">
{`┌────────────────────────┐
│  FEATURES v1.0         │
└────────────────────────┘`}
              </pre>
              <h2 className="font-mono text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                BUILT ON DIGIKEY&apos;S CATALOG
              </h2>
              <p className="font-sans text-neutral-400 text-base max-w-xl mx-auto">
                Direct API integration means real-time pricing, live inventory counts, and accurate lead times.
              </p>
            </div>
          </ParallaxSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ASCIIFeatureCard
              delay={0}
              title="LIVE INVENTORY"
              description="Real-time stock levels from DigiKey's 15M+ parts catalog. Never source discontinued parts again."
            />
            <ASCIIFeatureCard
              delay={100}
              title="AI SUGGESTIONS"
              description="Intelligent alternates and quantity optimization powered by machine learning models."
            />
            <ASCIIFeatureCard
              delay={200}
              title="PRICE BREAKS"
              description="Automatic quantity tier analysis to maximize savings across your entire BOM."
            />
            <ASCIIFeatureCard
              delay={300}
              title="ONE-CLICK EXPORT"
              description="Export to CSV or add directly to your DigiKey cart with a single click."
            />
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="inline-flex items-center font-mono text-sm text-white hover:text-neutral-400 transition-colors group"
            >
              [VIEW ALL FEATURES]
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-b-4 border-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.2}>
            <div className="text-center mb-16">
              <h2 className="font-mono text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                BOM → ORDER IN MINUTES
              </h2>
            </div>
          </ParallaxSection>

          {/* Process flow */}
          <div className="border-4 border-white bg-black p-8">
            <pre className="font-mono text-white text-xs md:text-sm whitespace-pre overflow-x-auto text-center mb-8">
{`┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  UPLOAD     │────────→│  REVIEW     │────────→│  EXPORT     │
│  BOM        │         │  MATCHES    │         │  & ORDER    │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                       │
      ▼                       ▼                       ▼
 Drop CSV/Excel        See live pricing        Export optimized
 We parse MPNs         Stock & alternates      Add to DigiKey cart`}
            </pre>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <RevealOnScroll delay={0} className="text-center">
                <div className="font-mono text-4xl font-bold text-white mb-2">01</div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">UPLOAD BOM</h3>
                <p className="font-sans text-sm text-neutral-400">
                  Drop your CSV or Excel file. We parse manufacturer part numbers automatically.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={100} className="text-center">
                <div className="font-mono text-4xl font-bold text-white mb-2">02</div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">REVIEW MATCHES</h3>
                <p className="font-sans text-sm text-neutral-400">
                  See live pricing, stock levels, and AI-suggested alternatives at a glance.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={200} className="text-center">
                <div className="font-mono text-4xl font-bold text-white mb-2">03</div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">EXPORT & ORDER</h3>
                <p className="font-sans text-sm text-neutral-400">
                  Export your optimized BOM or add parts directly to DigiKey.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.15}>
            <div className="border-4 border-white bg-black p-12 text-center relative">
              {/* Corner decorations */}
              <pre className="absolute top-4 left-4 font-mono text-neutral-600 text-xs">┌──</pre>
              <pre className="absolute top-4 right-4 font-mono text-neutral-600 text-xs">──┐</pre>
              <pre className="absolute bottom-4 left-4 font-mono text-neutral-600 text-xs">└──</pre>
              <pre className="absolute bottom-4 right-4 font-mono text-neutral-600 text-xs">──┘</pre>

              <pre className="font-mono text-white text-sm mb-6">
{`╔═══════════════════════════════════════╗
║                                       ║
║   READY TO OPTIMIZE YOUR SOURCING?    ║
║                                       ║
╚═══════════════════════════════════════╝`}
              </pre>

              <p className="font-sans text-neutral-400 text-base max-w-md mx-auto mb-8">
                Start with our free tier. No credit card required.
                Join hundreds of hardware teams already using PrecisionBOM.
              </p>

              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-10 py-4 text-sm font-bold bg-white text-black border-4 border-white hover:bg-black hover:text-white transition-colors duration-200 font-mono uppercase tracking-wider"
              >
                START SOURCING NOW
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <pre className="font-mono text-neutral-600 text-xs mt-8">
{`●────────────────●────────────────●`}
              </pre>
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Footer ASCII art */}
      <div className="border-t-4 border-white py-8">
        <pre className="font-mono text-neutral-600 text-xs text-center">
{`═══════════════════════════════════════════════════════════════
                    PRECISIONBOM © 2024
         PRECISION SOURCING FOR PRECISION ENGINEERING
═══════════════════════════════════════════════════════════════`}
        </pre>
      </div>
    </div>
  );
}
