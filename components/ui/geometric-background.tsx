"use client";

import { useEffect, useState, useRef } from "react";

interface GeometricBackgroundProps {
  variant?: "hero" | "section" | "full";
  intensity?: "subtle" | "medium" | "bold";
}

export function GeometricBackground({
  variant = "section",
  intensity = "medium",
}: GeometricBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const opacityMap = {
    subtle: 0.15,
    medium: 0.25,
    bold: 0.4,
  };

  const baseOpacity = opacityMap[intensity];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Grid pattern - slowest parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.05}px)`,
          opacity: baseOpacity * 0.5,
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated diagonal traces - medium parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Animated dash for traces */}
            <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="1" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Green traces with animation */}
          <line
            x1="0"
            y1="200"
            x2="400"
            y2="600"
            stroke="#22c55e"
            strokeWidth="2"
            opacity={baseOpacity}
            className="animate-trace-pulse"
          />
          <line
            x1="100"
            y1="0"
            x2="500"
            y2="400"
            stroke="#22c55e"
            strokeWidth="1.5"
            opacity={baseOpacity * 0.7}
          />
          <line
            x1="600"
            y1="100"
            x2="1000"
            y2="500"
            stroke="#22c55e"
            strokeWidth="2"
            opacity={baseOpacity}
            className="animate-trace-pulse-delayed"
          />
          <line
            x1="800"
            y1="300"
            x2="1000"
            y2="100"
            stroke="#22c55e"
            strokeWidth="1.5"
            opacity={baseOpacity * 0.5}
          />
          <line
            x1="200"
            y1="600"
            x2="600"
            y2="1000"
            stroke="#22c55e"
            strokeWidth="2"
            opacity={baseOpacity * 0.6}
          />
        </svg>
      </div>

      {/* Floating circles (vias) - faster parallax with pulse animation */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      >
        {variant === "hero" && (
          <>
            {/* Large green circle with slow pulse */}
            <div
              className="absolute w-64 h-64 rounded-full border-2 border-green-500 animate-pulse-slow"
              style={{
                top: "10%",
                right: "5%",
                opacity: baseOpacity,
              }}
            />
            {/* Medium green circle */}
            <div
              className="absolute w-40 h-40 rounded-full border border-green-500/50"
              style={{
                bottom: "20%",
                left: "10%",
                opacity: baseOpacity * 0.7,
              }}
            />
            {/* Small filled circle with glow */}
            <div
              className="absolute w-4 h-4 rounded-full bg-green-500 animate-glow"
              style={{
                top: "30%",
                left: "20%",
                opacity: baseOpacity,
              }}
            />
          </>
        )}

        {/* Via points scattered with pulse */}
        <div
          className="absolute w-3 h-3 rounded-full bg-green-500 animate-pulse"
          style={{ top: "15%", left: "80%", opacity: baseOpacity }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-green-400 animate-pulse-delayed"
          style={{ top: "45%", right: "15%", opacity: baseOpacity * 0.8 }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-green-500 animate-pulse"
          style={{ bottom: "25%", left: "5%", opacity: baseOpacity }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-green-300"
          style={{ top: "60%", left: "70%", opacity: baseOpacity * 0.5 }}
        />
      </div>

      {/* Corner brackets - no parallax, fixed */}
      {variant === "hero" && (
        <>
          <div
            className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-green-500"
            style={{ opacity: baseOpacity }}
          />
          <div
            className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-green-500"
            style={{ opacity: baseOpacity }}
          />
          <div
            className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-green-500/70"
            style={{ opacity: baseOpacity * 0.7 }}
          />
          <div
            className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-green-500/70"
            style={{ opacity: baseOpacity * 0.7 }}
          />
        </>
      )}

      {/* Horizontal scan lines - very slow parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.02}px)`,
          opacity: baseOpacity * 0.3,
        }}
      >
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan-delayed" />
      </div>
    </div>
  );
}

// Parallax wrapper for content sections
interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.1,
  className = "",
}: ParallaxLayerProps) {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const relativeScroll = window.scrollY - elementTop + window.innerHeight;
        setScrollY(relativeScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${scrollY * speed}px)`,
      }}
    >
      {children}
    </div>
  );
}

// Floating geometric shape component
interface FloatingShapeProps {
  shape: "circle" | "square" | "line";
  color?: "green" | "amber" | "white";
  size?: "sm" | "md" | "lg";
  position: { top?: string; bottom?: string; left?: string; right?: string };
  parallaxSpeed?: number;
  filled?: boolean;
}

export function FloatingShape({
  shape,
  color = "green",
  size = "md",
  position,
  parallaxSpeed = 0.1,
  filled = false,
}: FloatingShapeProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-32 h-32",
  };

  const colorMap = {
    green: "border-green-500 bg-green-500",
    amber: "border-amber-500 bg-amber-500",
    white: "border-white bg-white",
  };

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
      ? ""
      : "h-px w-full";

  return (
    <div
      className={`absolute pointer-events-none ${sizeMap[size]} ${
        filled ? colorMap[color].split(" ")[1] : `border-2 ${colorMap[color].split(" ")[0]}`
      } ${shapeClass}`}
      style={{
        ...position,
        transform: `translateY(${scrollY * parallaxSpeed}px)`,
        opacity: 0.3,
      }}
      aria-hidden="true"
    />
  );
}
