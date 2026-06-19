/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          900: "#0B0C0E", // neutral near-black base
          800: "#141619", // panel
          700: "#1A1D21", // raised surface
        },
        line: "#23262B",   // neutral hairline
        gold: {
          400: "#F6C744",  // bright gold (signature)
          500: "#E0AE2E",
          600: "#C9971F",  // deep gold
        },
        champagne: "#E9D8A6",
        ink: {
          DEFAULT: "#ECEEF2", // cool white
          dim: "#9AA0AA",     // muted
          faint: "#5C616B",   // captions
        },
        verdict: {
          low: "#5DD39E",
          med: "#FBC54B",
          high: "#F2786F",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        vault: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 24px 60px -28px rgba(0,0,0,0.85)",
        glow: "0 0 0 1px rgba(246,199,68,0.18), 0 18px 50px -20px rgba(246,199,68,0.25)",
      },
    },
  },
  plugins: [],
};
