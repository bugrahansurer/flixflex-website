// ═══════════════════════════════════════════════════════════
// FlixFlex — Default / Built-in Color Palettes
// CSS var names sourced from src/app/globals.css
// ═══════════════════════════════════════════════════════════

import type { ColorPalette } from "./types"
import { DEFAULT_THEME_SETTINGS } from "./types"

export const DEFAULT_PALETTES: ColorPalette[] = [
  // ─────────────────────────────────────────────
  // 1. FlixFlex Default (isSystem, isActive)
  //    Exact values from globals.css
  // ─────────────────────────────────────────────
  {
    id: "default-flixflex",
    name: "FlixFlex Default",
    description: "Varsayılan FlixFlex marka paleti — mor, antrasit, koyu arka plan.",
    isActive: true,
    isSystem: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
    settings: { ...DEFAULT_THEME_SETTINGS },
    fontDisplay: "Outfit",
    fontBody: "Inter",
    colors: {
      primary: "#ff4fd8",
      primaryHover: "#e045c2",
      primaryMuted: "rgba(255, 79, 216, 0.12)",
      primaryGlow: "rgba(255, 79, 216, 0.35)",
      secondary: "#D6FF3B",
      secondaryLight: "rgba(214, 255, 56, 0.05)",

      background: "#FFFFFF",
      backgroundAlt: "#F7F7F7",
      surface: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      foreground: "#111111",
      foregroundMuted: "#666666",
      foregroundFaint: "#999999",
      border: "#E0E0E0",
      borderStrong: "#CCCCCC",

      dark: {
        background: "#0d0d0d",
        backgroundAlt: "#111111",
        surface: "#1A1A1A",
        surfaceElevated: "#222222",
        foreground: "#f7f7f5",
        foregroundMuted: "#888888",
        foregroundFaint: "#999999",
        border: "#2A2A2A",
        borderStrong: "#CCCCCC",
      },
      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
    },
  },
  {
    id: "flixflex-modern-ui",
    name: "FlixFlex Modern UI",
    description: "Yepyeni nesil premium tasarım — yuvarlatılmış köşeler, cam efektleri.",
    isActive: false,
    isSystem: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
    settings: {
      headerVariant: "classic",
      buttonShape: "rounded",
      containerShape: "rounded",
      mobileNavbar: false,
      mobileNavbarVariant: "dock",
      fontBodySize: 16,
      fontHeadingSize: 32,
    },
    fontDisplay: "Syne",
    fontBody: "DM Sans",
    colors: {
      primary: "#ff4fd8",
      primaryHover: "#e045c2",
      primaryMuted: "rgba(255, 79, 216, 0.12)",
      primaryGlow: "rgba(255, 79, 216, 0.35)",
      secondary: "#D6FF3B",
      secondaryLight: "rgba(214, 255, 56, 0.05)",

      background: "#FFFFFF",
      backgroundAlt: "#F7F7F7",
      surface: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      foreground: "#111111",
      foregroundMuted: "#666666",
      foregroundFaint: "#999999",
      border: "#E0E0E0",
      borderStrong: "#CCCCCC",

      dark: {
        background: "#0d0d0d",
        backgroundAlt: "#111111",
        surface: "#1A1A1A",
        surfaceElevated: "#222222",
        foreground: "#f7f7f5",
        foregroundMuted: "#888888",
        foregroundFaint: "#999999",
        border: "#2A2A2A",
        borderStrong: "#3A3A3A",
      },
      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
    },
  },

  // ─────────────────────────────────────────────
  // 2. Midnight Spark — deeper purple/black
  // ─────────────────────────────────────────────
  {
    id: "default-midnight-spark",
    name: "Midnight Spark",
    description: "Derin mor ve koyu arka planla premium gece teması. Hamburger header + mobil dock.",
    isActive: false,
    isSystem: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
    settings: {
      headerVariant: "hamburger",
      buttonShape: "sharp",
      containerShape: "sharp",
      mobileNavbar: true,
      mobileNavbarVariant: "dock",
      fontBodySize: 16,
      fontHeadingSize: 32,
    },
    fontDisplay: "Outfit",
    fontBody: "Inter",
    colors: {
      primary: "#7B2FDE",
      primaryHover: "#6A1FCC",
      primaryMuted: "rgba(123, 47, 222, 0.14)",
      primaryGlow: "rgba(123, 47, 222, 0.40)",
      secondary: "#1E1E2E",
      secondaryLight: "#2A2A3E",

      background: "#FAFAFA",
      backgroundAlt: "#F3F3F8",
      surface: "#EDEDF5",
      surfaceElevated: "#FFFFFF",
      foreground: "#0D0D1A",
      foregroundMuted: "#5A5A7A",
      foregroundFaint: "#9090AA",
      border: "#DCDCE8",
      borderStrong: "#C8C8DA",

      dark: {
        background: "#08080F",
        backgroundAlt: "#0E0E1A",
        surface: "#14141F",
        surfaceElevated: "#1C1C2A",
        foreground: "#EEEEF8",
        foregroundMuted: "#7070A0",
        foregroundFaint: "#404060",
        border: "#1E1E30",
        borderStrong: "#2C2C44",
      },

      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
  },

  // ─────────────────────────────────────────────
  // 3. Daylight Premium — light-first
  // ─────────────────────────────────────────────
  {
    id: "default-daylight-premium",
    name: "Daylight Premium",
    description: "Açık ve temiz tasarım. Yuvarlatılmış buton ve konteynerler.",
    isActive: false,
    isSystem: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
    settings: {
      headerVariant: "classic",
      buttonShape: "rounded",
      containerShape: "rounded",
      mobileNavbar: false,
      mobileNavbarVariant: "dock",
      fontBodySize: 16,
      fontHeadingSize: 32,
    },
    fontDisplay: "Outfit",
    fontBody: "Inter",
    colors: {
      primary: "#6C3CE1",
      primaryHover: "#5A28D0",
      primaryMuted: "rgba(108, 60, 225, 0.10)",
      primaryGlow: "rgba(108, 60, 225, 0.30)",
      secondary: "#2D2D2D",
      secondaryLight: "#444444",

      background: "#FFFFFF",
      backgroundAlt: "#F9F9FB",
      surface: "#F3F3F7",
      surfaceElevated: "#FFFFFF",
      foreground: "#0A0A14",
      foregroundMuted: "#5C5C7A",
      foregroundFaint: "#9898B0",
      border: "#E4E4EE",
      borderStrong: "#D0D0E0",

      dark: {
        background: "#0F0F1A",
        backgroundAlt: "#161622",
        surface: "#1C1C2C",
        surfaceElevated: "#242436",
        foreground: "#F0F0FA",
        foregroundMuted: "#8080A8",
        foregroundFaint: "#505070",
        border: "#242438",
        borderStrong: "#343450",
      },

      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
    },
  },

  // ─────────────────────────────────────────────
  // 4. Electric Coral — coral/teal accent
  // ─────────────────────────────────────────────
  {
    id: "default-electric-coral",
    name: "Electric Coral",
    description: "Canlı mercan ve teal — bevel köşeli butonlar, minimal mobil ikon dock.",
    isActive: false,
    isSystem: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
    settings: {
      headerVariant: "hamburger",
      buttonShape: "bevel",
      containerShape: "bevel",
      mobileNavbar: true,
      mobileNavbarVariant: "minimal",
      fontBodySize: 16,
      fontHeadingSize: 32,
    },
    fontDisplay: "Outfit",
    fontBody: "Inter",
    colors: {
      primary: "#FF4D6A",
      primaryHover: "#E63055",
      primaryMuted: "rgba(255, 77, 106, 0.12)",
      primaryGlow: "rgba(255, 77, 106, 0.35)",
      secondary: "#0D9488",
      secondaryLight: "#14B8A6",

      background: "#FFFFFF",
      backgroundAlt: "#FFF8F8",
      surface: "#FFF0F2",
      surfaceElevated: "#FFFFFF",
      foreground: "#1A0A0D",
      foregroundMuted: "#7A5A60",
      foregroundFaint: "#AA8A90",
      border: "#FFD0D8",
      borderStrong: "#FFAAB8",

      dark: {
        background: "#0F060A",
        backgroundAlt: "#180C10",
        surface: "#210F15",
        surfaceElevated: "#2C141C",
        foreground: "#FFE8EC",
        foregroundMuted: "#AA6070",
        foregroundFaint: "#604040",
        border: "#3A1520",
        borderStrong: "#502030",
      },

      success: "#10b981",
      warning: "#f59e0b",
      error: "#dc2626",
    },
  },
]
