"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// PCB Panel component - text appears on circuit board panels
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

      {/* Content */}
      <div className="relative z-10 p-6 pt-8 pb-8">
        {children}
      </div>
    </div>
  );
}

// Via/solder point decoration
function Via({ className = "", size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };
  return (
    <div className={`rounded-full border border-substrate-600 bg-substrate-800 ${sizes[size]} ${className}`}>
      <div className="w-full h-full rounded-full border border-substrate-700 bg-substrate-900" />
    </div>
  );
}

// Horizontal trace line
function Trace({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  return (
    <div className={`h-px bg-substrate-700 ${glow ? "shadow-[0_0_4px_rgba(16,185,129,0.3)]" : ""} ${className}`} />
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

// Animated circuit trace background
function CircuitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {/* Horizontal traces */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-substrate-600 to-transparent" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-substrate-600 to-transparent" />
      <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-substrate-600 to-transparent" />

      {/* Vertical traces */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-substrate-600 to-transparent" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-substrate-600 to-transparent" />
      <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-substrate-600 to-transparent" />

      {/* Vias at intersections */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-1/4 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-1/4 left-3/4 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-1/2 left-3/4 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-3/4 left-1/4 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-3/4 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />
      <div className="absolute top-3/4 left-3/4 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-substrate-700 border border-substrate-600" />

      {/* Animated trace pulse */}
      <div className="absolute top-1/2 left-0 right-0 h-px overflow-hidden">
        <div className="h-full w-32 bg-gradient-to-r from-transparent via-trace-500/40 to-transparent animate-trace-pulse" />
      </div>
    </div>
  );
}

// Feature card with PCB styling
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
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
      className={`transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <PCBPanel variant="dark" className="h-full group hover:border-trace-700 transition-colors duration-300">
        {/* IC chip icon container */}
        <div className="mb-4 relative">
          <div className="w-10 h-10 bg-substrate-800 border border-substrate-700 rounded-sm flex items-center justify-center text-trace-500 group-hover:border-trace-600 transition-colors">
            {icon}
          </div>
          {/* Pin traces from IC */}
          <div className="absolute top-1/2 -right-2 w-2 h-px bg-substrate-700" />
          <div className="absolute -bottom-2 left-1/2 h-2 w-px bg-substrate-700" />
        </div>

        <h3 className="text-base font-semibold text-white mb-1.5 font-mono tracking-tight">{title}</h3>
        <p className="text-sm text-substrate-400 leading-relaxed">{description}</p>

        {/* Bottom trace decoration */}
        <div className="absolute bottom-4 left-8 right-8 flex items-center gap-2 opacity-30">
          <div className="flex-1 h-px bg-substrate-700" />
          <Via size="sm" />
          <div className="flex-1 h-px bg-substrate-700" />
        </div>
      </PCBPanel>
    </div>
  );
}

// Stat component with industrial styling
function Stat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
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
      className={`text-center transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative inline-block">
        <div className="text-2xl md:text-3xl font-bold text-white mb-0.5 font-mono">
          {value}
        </div>
        {/* Underline trace */}
        <div className="absolute -bottom-1 left-0 right-0 h-px bg-trace-500/50" />
      </div>
      <div className="text-xs text-substrate-500 uppercase tracking-wider mt-2 font-mono">
        {label}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <CircuitBackground />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Status badge */}
            <ParallaxSection speed={0.3}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-substrate-700 bg-substrate-900/80 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-trace-500 animate-pulse" />
                <span className="text-xs text-substrate-400 uppercase tracking-wider font-mono">
                  Powered by DigiKey API
                </span>
              </div>
            </ParallaxSection>

            {/* Main headline on PCB panel */}
            <ParallaxSection speed={0.2}>
              <PCBPanel variant="highlight" className="mb-8 inline-block">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-mono">
                  <span className="text-white">Precision</span>
                  <span className="text-trace-500">BOM</span>
                </h1>
              </PCBPanel>
            </ParallaxSection>

            <ParallaxSection speed={0.15}>
              <p className="text-xl md:text-2xl text-substrate-300 mb-4 font-mono">
                Precision sourcing for precision engineering
              </p>
            </ParallaxSection>

            <p className="text-base text-substrate-500 mb-10 max-w-xl mx-auto">
              AI-powered BOM optimization with real-time DigiKey inventory data.
              Find parts, compare prices, and source with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-white hover:bg-substrate-100 text-substrate-950 rounded-sm transition-all font-mono"
              >
                Get Started Free
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-substrate-700 hover:border-substrate-500 text-substrate-300 hover:text-white rounded-sm transition-all font-mono"
              >
                See Features
              </Link>
            </div>

            {/* Terminal Demo on PCB */}
            <ParallaxSection speed={0.1}>
              <PCBPanel className="max-w-lg mx-auto text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Via size="sm" />
                  <Via size="sm" />
                  <Via size="sm" />
                  <span className="text-[10px] text-substrate-600 ml-2 font-mono">TERMINAL_01</span>
                </div>
                <code className="text-xs text-substrate-400 leading-relaxed block font-mono">
                  <span className="text-white">$</span> upload bom.csv<br />
                  <span className="text-substrate-600"># Parsing 47 components...</span><br />
                  <span className="text-substrate-600"># Querying DigiKey API...</span><br />
                  <span className="text-trace-500">✓</span> All parts in stock: <span className="text-white">$2,847.32</span>
                </code>
              </PCBPanel>
            </ParallaxSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-t border-substrate-800 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4">
            <Stat value="15M+" label="Parts" delay={0} />
            <Stat value="2,300+" label="Suppliers" delay={100} />
            <Stat value="Real-time" label="Stock" delay={200} />
            <Stat value="Same-day" label="Ship" delay={300} />
          </div>
        </div>

        {/* Decorative traces */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-8 pointer-events-none opacity-20">
          <Trace className="w-24" />
          <Via size="md" />
          <Trace className="flex-1 max-w-xs" glow />
          <Via size="md" />
          <Trace className="w-24" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-substrate-800 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.2}>
            <div className="text-center mb-12">
              <PCBPanel variant="dark" className="inline-block mb-4">
                <span className="text-xs text-substrate-500 uppercase tracking-wider font-mono">FEATURES_V1.0</span>
              </PCBPanel>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-mono">
                Built on DigiKey&apos;s catalog
              </h2>
              <p className="text-substrate-400 text-sm max-w-xl mx-auto">
                Direct API integration means real-time pricing, live inventory counts, and accurate lead times.
              </p>
            </div>
          </ParallaxSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              delay={0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="Live Inventory"
              description="Real-time stock levels from DigiKey's 15M+ parts catalog."
            />
            <FeatureCard
              delay={100}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="AI Suggestions"
              description="Intelligent alternates and quantity optimization."
            />
            <FeatureCard
              delay={200}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Price Breaks"
              description="Automatic quantity tier analysis for savings."
            />
            <FeatureCard
              delay={300}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
              title="One-Click Export"
              description="Export to CSV or add directly to DigiKey cart."
            />
          </div>

          <div className="text-center mt-10">
            <Link
              href="/features"
              className="inline-flex items-center text-sm text-trace-500 hover:text-trace-400 transition-colors font-mono group"
            >
              View all features
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-substrate-800 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-mono">
                BOM to order in minutes
              </h2>
            </div>
          </ParallaxSection>

          {/* Process flow on PCB */}
          <PCBPanel className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection traces between steps */}
              <div className="hidden md:block absolute top-8 left-[33%] right-[33%] h-px">
                <div className="h-full bg-gradient-to-r from-substrate-700 via-trace-500/30 to-substrate-700" />
              </div>

              {[
                { step: "01", title: "Upload BOM", desc: "Drop your CSV or Excel. We parse MPNs automatically." },
                { step: "02", title: "Review Matches", desc: "See live pricing, stock, and AI-suggested alternatives." },
                { step: "03", title: "Export & Order", desc: "Export optimized BOM or add to DigiKey directly." },
              ].map((item, i) => (
                <div key={i} className="text-center relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm border border-substrate-600 bg-substrate-800 mb-4">
                    <span className="text-white font-bold font-mono text-sm">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-mono">{item.title}</h3>
                  <p className="text-substrate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </PCBPanel>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-substrate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.15}>
            <PCBPanel variant="highlight" className="text-center py-12 px-8">
              {/* Decorative traces */}
              <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-trace-500/50 to-transparent" />
              <div className="absolute top-8 right-8 w-16 h-px bg-gradient-to-l from-trace-500/50 to-transparent" />
              <div className="absolute bottom-8 left-8 w-16 h-px bg-gradient-to-r from-trace-500/50 to-transparent" />
              <div className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-l from-trace-500/50 to-transparent" />

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-mono">
                Ready to optimize your sourcing?
              </h2>
              <p className="text-substrate-400 text-sm max-w-md mx-auto mb-8">
                Start with our free tier. No credit card required.
              </p>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-3 text-sm font-medium bg-trace-500 hover:bg-trace-600 text-white rounded-sm transition-all font-mono"
              >
                Start Sourcing Now
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </PCBPanel>
          </ParallaxSection>
        </div>
      </section>
    </div>
  );
}
