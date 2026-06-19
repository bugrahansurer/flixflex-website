import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── FlixFlex Brand Colors ───────────────────
      colors: {
        "ff-purple":       "#FF4FD8",
        "ff-purple-hover": "#dc2db6",
        "ff-purple-dark":  "#dd2bb7",
        "ff-purple-light": "#ff4fd833",
        "ff-charcoal":     "#D6FF3B",
        "ff-charcoal-light": "#D6FF380D",
        "ff-charcoal-dark":  "#D6FF3B80",
        // Semantic tokens (CSS variable backed)
        background:    "var(--background)",
        surface:       "var(--surface)",
        foreground:    "var(--foreground)",
        border:        "var(--border)",
        primary:       "var(--ff-purple)",
        secondary:     "var(--ff-charcoal)",
      },
      // ── Typography ──────────────────────────────
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
        sans:    ["DM Sans", "sans-serif"],
      },
      // ── Font Sizes ───────────────────────────────
      fontSize: {
        "display-2xl": ["72px",  { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-xl":  ["60px",  { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-lg":  ["48px",  { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-md":  ["36px",  { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm":  ["30px",  { lineHeight: "1.2",  letterSpacing: "-0.015em" }],
      },
      // ── Border Radius — SHARP CORNERS ───────────
      // FlixFlex DNA: no rounded corners
      borderRadius: {
        none:    "0px",
        DEFAULT: "0px",
        sm:      "0px",
        md:      "0px",
        lg:      "0px",
        xl:      "0px",
        "2xl":   "0px",
        "3xl":   "0px",
        full:    "9999px", // Only for pills/avatars when explicitly needed
      },
      // ── Spacing ─────────────────────────────────
      spacing: {
        "18":  "72px",
        "22":  "88px",
        "26":  "104px",
        "30":  "120px",
        "34":  "136px",
        "38":  "152px",
        "42":  "168px",
        "section": "80px",
      },
      // ── Max Width ────────────────────────────────
      maxWidth: {
        "container": "1280px",
        "content":   "720px",
        "narrow":    "480px",
      },
      // ── Keyframes ────────────────────────────────
      keyframes: {
        "ff-fadeInUp": {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ff-fadeIn": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ff-pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(255, 79, 216,0.2)" },
          "50%":       { boxShadow: "0 0 40px rgba(255, 79, 216,0.5)" },
        },
        "ff-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        "ff-shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "ff-spin-slow": {
          "from": { transform: "rotate(0deg)" },
          "to":   { transform: "rotate(360deg)" },
        },
        "ff-aurora": {
          "from": { backgroundPosition: "50% 50%, 50% 50%" },
          "to":   { backgroundPosition: "350% 50%, 350% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      // ── Animations ──────────────────────────────
      animation: {
        "ff-fadeInUp":    "ff-fadeInUp 0.6s ease forwards",
        "ff-fadeIn":      "ff-fadeIn 0.4s ease forwards",
        "ff-pulse-glow":  "ff-pulse-glow 2s ease-in-out infinite",
        "ff-float":       "ff-float 4s ease-in-out infinite",
        "ff-shimmer":     "ff-shimmer 3s ease infinite",
        "ff-spin-slow":   "ff-spin-slow 8s linear infinite",
        "ff-aurora":      "ff-aurora 60s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
      // ── Box Shadows ──────────────────────────────
      boxShadow: {
        "ff-glow":    "0 0 30px rgba(255, 79, 216,0.35)",
        "ff-glow-sm": "0 0 15px rgba(255, 79, 216,0.2)",
        "ff-glow-lg": "0 0 60px rgba(255, 79, 216,0.3), 0 0 120px rgba(255, 79, 216,0.15)",
        "ff-card":    "0 4px 30px rgba(255, 79, 216,0.08)",
        "ff-card-hover": "0 8px 40px rgba(255, 79, 216,0.15)",
      },
      // ── Backdrop Blur ────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
      // ── Z-Index Scale ────────────────────────────
      zIndex: {
        "60":  "60",
        "70":  "70",
        "80":  "80",
        "90":  "90",
        "100": "100",
      },
    },
  },
  plugins: [],
};

export default config;
