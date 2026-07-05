import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09090B",
        surface: "#111318",
        card: "#171A21",
        line: "#23262F",
        emerald: {
          DEFAULT: "#34D399",
          soft: "#10B981",
          dim: "#0B3B2E",
        },
        cyan: {
          DEFAULT: "#7DD3FC",
          dim: "#0E3A4A",
        },
        violet: {
          DEFAULT: "#A78BFA",
          dim: "#2C2350",
        },
        warmwhite: "#F5F3EC",
        muted: "#8B8F99",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(circle at 50% 0%, rgba(52,211,153,0.10), transparent 60%)",
        "grain": "url('/noise.svg')",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(52,211,153,0.15), 0 8px 30px rgba(52,211,153,0.08)",
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 40px rgba(0,0,0,0.35)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%": { transform: "translate(6px, -8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        spinSlowReverse: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        coreGlow: {
          // Softened to the spec'd 2-3% scale breathing.
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.025)" },
        },
        coreGlowDrift: {
          // Slow, independent glow-intensity drift layered under coreGlow.
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.55" },
        },
        linePulse: {
          "0%, 100%": { opacity: "0.18" },
          "50%": { opacity: "0.42" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3.4s ease-in-out infinite",
        "spin-slow": "spinSlow 60s linear infinite",
        "spin-slow-reverse": "spinSlowReverse 90s linear infinite",
        float: "float 6s ease-in-out infinite",
        "core-glow": "coreGlow 4.5s ease-in-out infinite",
        "core-glow-drift": "coreGlowDrift 11s ease-in-out infinite",
        "line-pulse": "linePulse 5.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
