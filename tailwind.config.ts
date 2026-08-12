import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark navy/slate neutral scale — the app's primary surface system.
        // 950 = page background, 800/850 = card surfaces, 700/600 = borders,
        // 50/100 = primary text, 300/400 = secondary/muted text.
        ink: {
          950: "#0a0e17",
          900: "#0e1420",
          850: "#121a2a",
          800: "#172033",
          700: "#222c42",
          600: "#2d3750",
          500: "#454f6b",
          400: "#636e89",
          300: "#8892ab",
          200: "#b0b7c9",
          100: "#d3d7e2",
          50: "#f5f6f9",
        },
        // Primary brand accent — restrained football/emerald green.
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // Secondary accent — subtle steel blue (assists, secondary info).
        sky: {
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        cardyellow: "#f2a93b",
        cardred: "#ef4444",
        live: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.025) inset, 0 10px 24px -14px rgba(0,0,0,0.55)",
        elevated: "0 24px 60px -18px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.05), transparent 60%)",
      },
      animation: {
        "pulse-live": "pulse-live 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pop-in": "pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
