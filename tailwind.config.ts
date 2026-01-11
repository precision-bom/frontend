import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Industrial PCB color palette - white on black with green accent
        trace: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Primary - muted industrial green
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        copper: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15", // Accent yellow - use sparingly
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
          950: "#422006",
        },
        substrate: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        silkscreen: "#ffffff",
        solder: "#a1a1aa",
      },
      fontFamily: {
        mono: [
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "Roboto Mono",
          "Fira Code",
          "monospace",
        ],
        sans: [
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "SF Pro Display",
          "Inter",
          "Helvetica Neue",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        brutalist: [
          "JetBrains Mono",
          "SF Mono",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        headline: ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        subhead: ["1.25rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
        "dark-gradient":
          "radial-gradient(ellipse at top, #18181b 0%, #09090b 100%)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      boxShadow: {
        trace: "0 0 20px rgba(16, 185, 129, 0.1)",
        "trace-lg": "0 0 40px rgba(16, 185, 129, 0.15)",
        glow: "0 0 30px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-delayed": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s",
        "trace-flow": "traceFlow 2s ease-in-out infinite",
        "trace-pulse": "tracePulse 3s ease-in-out infinite",
        "trace-pulse-delayed": "tracePulse 3s ease-in-out infinite 1.5s",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
        "scan-delayed": "scan 8s linear infinite 4s",
        "float": "float 6s ease-in-out infinite",
        "blink": "blink 1s step-end infinite",
        "typing": "typing 2s steps(20) forwards",
      },
      keyframes: {
        traceFlow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        tracePulse: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(34, 197, 94, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.8)" },
        },
        scan: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        typing: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
