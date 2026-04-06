/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
        body: ['"DM Sans"', "sans-serif"],
        display: ['"Syne"', "sans-serif"],
      },
      colors: {
        ink: {
          950: "#070b14",
          900: "#0d1220",
          800: "#141b2d",
          700: "#1e2740",
          600: "#273352",
        },
        amber: { 400: "#fbbf24", 500: "#f59e0b" },
        electric: { 400: "#38bdf8", 500: "#0ea5e9" },
        emerald: { 400: "#34d399", 500: "#10b981" },
        rose: { 400: "#fb7185", 500: "#f43f5e" },
      },
      animation: {
        "fade-up": "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-bar": "pulseBar 1.4s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pulseBar: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
