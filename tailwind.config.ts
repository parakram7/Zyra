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
        ink: {
          950: "#08090b",
          900: "#0c0e11",
          850: "#111318",
          800: "#15181e",
          700: "#1c2027",
          600: "#262b34",
          500: "#343b46",
          400: "#565f6d",
          300: "#7b8492",
          200: "#a7adb8",
          100: "#d3d6dc",
          50: "#f3f4f6",
        },
        volt: {
          50: "#f6ffe0",
          100: "#ecffb8",
          200: "#ddff85",
          300: "#c8fb4d",
          400: "#b3f224",
          500: "#9be000",
          600: "#7cb800",
          700: "#5e8c00",
          800: "#3f5f00",
          900: "#233400",
        },
        sky: {
          400: "#5fb2ff",
          500: "#3b93f0",
        },
        cardyellow: "#ffc53d",
        cardred: "#ff4d5e",
        live: "#ff3b57",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(200,251,77,0.15), 0 8px 30px -8px rgba(200,251,77,0.25)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(200,251,77,0.08), transparent 60%)",
        "pitch-lines":
          "linear-gradient(180deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
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
