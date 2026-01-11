"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GeometricBackground } from "@/components/ui/geometric-background";

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

// ASCII Feature Card with hover animation
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
      <div className="border-4 border-white bg-black p-0 hover:border-green-500 transition-all duration-300 group relative overflow-hidden">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500/5" />

        {/* Animated corner accent */}
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-green-500 border-l-[20px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <pre className="font-mono text-xs whitespace-pre p-4 leading-tight relative z-10">
          <span className="text-white">{`┌${"─".repeat(title.length + 2)}┐`}</span>
          {"\n"}
          <span className="text-white">{`│ ${title} │`}</span>
          <span className="text-green-500 group-hover:animate-pulse">──────●</span>
          {"\n"}
          <span className="text-white">{`└${"─".repeat(title.length + 2)}┘`}</span>
        </pre>
        <div className="px-4 pb-4 relative z-10">
          <p className="font-sans text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
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

// ASCII separator line with animation
function ASCIISeparator({ className = "" }: { className?: string }) {
  return (
    <pre className={`font-mono text-center text-sm ${className}`}>
      <span className="text-green-500 animate-pulse">●</span>
      <span className="text-neutral-600">────────────────</span>
      <span className="text-green-400">●</span>
      <span className="text-neutral-600">────────────────</span>
      <span className="text-green-500 animate-pulse">●</span>
      <span className="text-neutral-600">────────────────</span>
      <span className="text-green-400">●</span>
    </pre>
  );
}

export default function LandingPage() {
  return (
    <div className="relative bg-black text-white overflow-hidden min-h-screen">
      {/* Geometric Background with Parallax */}
      <GeometricBackground variant="hero" intensity="medium" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 border-b-4 border-white">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Status indicator */}
            <ParallaxSection speed={0.3}>
              <pre className="font-mono text-xs mb-8 inline-block">
                <span className="text-green-500">[■■■■■■■■■■]</span>
                <span className="text-white"> SYSTEM </span>
                <span className="text-green-400">ONLINE</span>
              </pre>
            </ParallaxSection>

            {/* Main Logo */}
            <ParallaxSection speed={0.2}>
              <div className="mb-8 flex justify-center">
                <Image
                  src="/precision-bom-logo.svg"
                  alt="PrecisionBOM"
                  width={600}
                  height={120}
                  className="w-full max-w-3xl h-auto invert"
                  priority
                />
              </div>
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
              <div className="max-w-2xl mx-auto border-4 border-white bg-black relative overflow-hidden hover:border-green-500 transition-colors duration-300">
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 blur-3xl pointer-events-none animate-pulse-slow" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/10 blur-3xl pointer-events-none" />

                <div className="border-b-4 border-white px-4 py-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-xs text-neutral-500">TERMINAL_01</span>
                  <span className="ml-auto font-mono text-xs text-green-500 animate-blink">_</span>
                </div>
                <pre className="font-mono text-sm text-left p-6 leading-relaxed relative z-10">
<span className="text-green-400">$</span>{` upload bom.csv`}
{`
┌─────────────────────────────────────────┐
│ `}<span className="text-green-500">▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</span><span className="text-neutral-600">░░░░░░</span>{` 78%     │
└─────────────────────────────────────────┘`}
<span className="text-neutral-500">{`
# Parsing 47 components...
# Querying DigiKey API...
# Cross-referencing Mouser inventory...`}</span>
{`

┌─────────────────────────────────────────┐
│  STATUS: `}<span className="text-green-400">ALL PARTS IN STOCK</span>{`             │
│  TOTAL:  `}<span className="text-white">$2,847.32</span>{`                      │
│  SAVINGS: `}<span className="text-green-300">$423.18 (13%)</span>{`                 │
└─────────────────────────────────────────┘

`}<span className="text-green-400">[✓]</span>{` Ready to export`}
                </pre>
              </div>
            </ParallaxSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b-4 border-white relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
      <section id="features" className="py-24 border-b-4 border-white relative overflow-hidden">
        <GeometricBackground variant="section" intensity="subtle" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ParallaxSection speed={0.2}>
            <div className="text-center mb-16">
              <pre className="font-mono text-xs mb-4 inline-block">
                <span className="text-green-500">┌────────────────────────┐</span>
                {"\n"}
                <span className="text-green-500">│</span>
                <span className="text-white">  FEATURES v1.0         </span>
                <span className="text-green-500">│</span>
                {"\n"}
                <span className="text-green-500">└────────────────────────┘</span>
              </pre>
              <h2 className="font-mono text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                BUILT ON <span className="text-green-500">DIGIKEY&apos;S</span> CATALOG
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
        {/* Section geometric background */}
        <GeometricBackground variant="section" intensity="subtle" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ParallaxSection speed={0.2}>
            <div className="text-center mb-16">
              <h2 className="font-mono text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                BOM <span className="text-green-500">→</span> ORDER IN MINUTES
              </h2>
            </div>
          </ParallaxSection>

          {/* Process flow */}
          <div className="border-4 border-white bg-black p-8 relative overflow-hidden hover:border-green-500/50 transition-colors duration-500">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-green-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-green-500/10 blur-3xl pointer-events-none" />

            <pre className="font-mono text-xs md:text-sm whitespace-pre overflow-x-auto text-center mb-8 relative z-10">
<span className="text-white">{`┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  `}</span><span className="text-green-400">UPLOAD</span><span className="text-white">{`     │`}</span><span className="text-green-500 animate-pulse">────────→</span><span className="text-white">{`│  `}</span><span className="text-green-300">REVIEW</span><span className="text-white">{`     │`}</span><span className="text-green-500 animate-pulse">────────→</span><span className="text-white">{`│  `}</span><span className="text-green-400">EXPORT</span><span className="text-white">{`     │
│  BOM        │         │  MATCHES    │         │  & ORDER    │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                       │
      ▼                       ▼                       ▼`}</span>
{`
 Drop CSV/Excel        See live pricing        Export optimized
 We parse MPNs         Stock & alternates      Add to DigiKey cart`}
            </pre>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 relative z-10">
              <RevealOnScroll delay={0} className="text-center group">
                <div className="font-mono text-4xl font-bold text-green-500 mb-2 group-hover:animate-pulse">01</div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">UPLOAD BOM</h3>
                <p className="font-sans text-sm text-neutral-400">
                  Drop your CSV or Excel file. We parse manufacturer part numbers automatically.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={100} className="text-center group">
                <div className="font-mono text-4xl font-bold text-green-400 mb-2 group-hover:animate-pulse">02</div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">REVIEW MATCHES</h3>
                <p className="font-sans text-sm text-neutral-400">
                  See live pricing, stock levels, and AI-suggested alternatives at a glance.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={200} className="text-center group">
                <div className="font-mono text-4xl font-bold text-green-500 mb-2 group-hover:animate-pulse">03</div>
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
      <section className="py-24 relative">
        <GeometricBackground variant="section" intensity="subtle" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ParallaxSection speed={0.15}>
            <div className="border-4 border-white bg-black p-12 text-center relative overflow-hidden hover:border-green-500/50 transition-colors duration-500">
              {/* Glow effects */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/15 blur-3xl pointer-events-none animate-pulse-slow" />
              <div className="absolute -bottom-20 left-1/4 w-40 h-40 bg-green-500/10 blur-3xl pointer-events-none" />

              {/* Corner decorations with animation */}
              <pre className="absolute top-4 left-4 font-mono text-green-500 text-xs animate-pulse">┌──●</pre>
              <pre className="absolute top-4 right-4 font-mono text-green-500 text-xs animate-pulse">●──┐</pre>
              <pre className="absolute bottom-4 left-4 font-mono text-green-400 text-xs">└──●</pre>
              <pre className="absolute bottom-4 right-4 font-mono text-green-400 text-xs">●──┘</pre>

              <pre className="font-mono text-sm mb-6 relative z-10">
<span className="text-green-500">╔═══════════════════════════════════════╗</span>
{`
`}<span className="text-green-500">║</span><span className="text-white">{`                                       `}</span><span className="text-green-500">║</span>{`
`}<span className="text-green-500">║</span><span className="text-white">{`   READY TO OPTIMIZE YOUR SOURCING?    `}</span><span className="text-green-500">║</span>{`
`}<span className="text-green-500">║</span><span className="text-white">{`                                       `}</span><span className="text-green-500">║</span>
{`
`}<span className="text-green-500">╚═══════════════════════════════════════╝</span>
              </pre>

              <p className="font-sans text-neutral-400 text-base max-w-md mx-auto mb-8 relative z-10">
                Start with our free tier. No credit card required.
                Join hundreds of hardware teams already using PrecisionBOM.
              </p>

              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-10 py-4 text-sm font-bold bg-green-500 text-black border-4 border-green-500 hover:bg-black hover:text-green-500 transition-all duration-200 font-mono uppercase tracking-wider relative z-10 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
              >
                START SOURCING NOW
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <pre className="font-mono text-xs mt-8 relative z-10">
                <span className="text-green-500 animate-pulse">●</span>
                <span className="text-neutral-600">────────────────</span>
                <span className="text-green-400">●</span>
                <span className="text-neutral-600">────────────────</span>
                <span className="text-green-500 animate-pulse">●</span>
              </pre>
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Footer ASCII art */}
      <div className="border-t-4 border-white py-8 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-between items-center px-8 pointer-events-none opacity-20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <pre className="font-mono text-xs text-center relative z-10">
          <span className="text-green-500">═══════════════════════════════</span>
          <span className="text-green-400">═══════════════════════════════</span>
          {"\n"}
          <span className="text-neutral-500">PRECISIONBOM © 2024</span>
          {"\n"}
          <span className="text-neutral-600">PRECISION SOURCING FOR PRECISION ENGINEERING</span>
          {"\n"}
          <span className="text-green-400">═══════════════════════════════</span>
          <span className="text-green-500">═══════════════════════════════</span>
        </pre>
      </div>
    </div>
  );
}
