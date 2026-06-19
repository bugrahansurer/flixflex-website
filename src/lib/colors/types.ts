// ═══════════════════════════════════════════════════════════
// FlixFlex — Theme System Types
//
// A "Theme" is the full visual configuration of the site:
//   • ColorTokens   — palette (colors, light + dark)
//   • ThemeSettings — component-level choices (header, shapes, mobile nav)
//
// Persisted as ColorPalette.colors (Json) + ColorPalette.settings (Json).
// ═══════════════════════════════════════════════════════════

export interface ColorTokens {
  // ── Brand ────────────────────────────────────────
  primary:         string  // #hex
  primaryHover:    string
  primaryMuted:    string  // rgba allowed
  primaryGlow:     string  // rgba allowed
  secondary:       string  // charcoal
  secondaryLight:  string

  // ── Semantic — light mode ────────────────────────
  background:      string
  backgroundAlt:   string
  surface:         string
  surfaceElevated: string
  foreground:      string
  foregroundMuted: string
  foregroundFaint: string
  border:          string
  borderStrong:    string

  // ── Semantic — dark mode overrides ──────────────
  dark: {
    background:      string
    backgroundAlt:   string
    surface:         string
    surfaceElevated: string
    foreground:      string
    foregroundMuted: string
    foregroundFaint: string
    border:          string
    borderStrong:    string
    // Optional dark-mode secondary overrides. When absent, the light
    // `secondary` / `secondaryLight` are reused (backward compatible).
    secondary?:      string
    secondaryLight?: string
  }

  // ── Status ───────────────────────────────────────
  success: string
  warning: string
  error:   string
}

// ── Header variant ─────────────────────────────────
// "classic"   — Logo + horizontal nav + CTA + theme toggle (default)
// "hamburger" — Logo + hamburger button → full-screen overlay menu
export type HeaderVariant = "classic" | "hamburger"

// ── Shape variants for buttons & containers ────────
// "sharp"   — border-radius: 0 (FlixFlex default)
// "rounded" — border-radius: 8px (modern soft)
// "hex"     — clip-path hexagon (horizontal hex)
// "bevel"   — clip-path beveled corners (cut corners, sci-fi feel)
export type ShapeVariant = "sharp" | "rounded" | "hex" | "bevel"

// ── Mobile navbar variant (bottom dock) ────────────
// "dock"    — Icon + label bottom navbar (4-5 items)
// "minimal" — Pure icon row (no labels)
export type MobileNavbarVariant = "dock" | "minimal"

export interface ThemeSettings {
  /** Which header layout to render */
  headerVariant:        HeaderVariant
  /** Shape applied to most CTAs / buttons site-wide */
  buttonShape:          ShapeVariant
  /** Shape applied to cards / sections / large containers */
  containerShape:       ShapeVariant
  /** Show a persistent bottom navbar on mobile (in addition to header) */
  mobileNavbar:         boolean
  /** Style of the bottom mobile navbar when enabled */
  mobileNavbarVariant:  MobileNavbarVariant

  /** Base font size for body text (px) */
  fontBodySize:         number
  /** Base font size for headings (px) */
  fontHeadingSize:      number
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  headerVariant:       "classic",
  buttonShape:         "bevel",
  containerShape:      "bevel",
  mobileNavbar:        true,
  mobileNavbarVariant: "dock",
  fontBodySize:        16,
  fontHeadingSize:     32,
}

export interface ColorPalette {
  id:           string
  name:         string
  description?: string
  isActive:     boolean
  isSystem:     boolean
  colors:       ColorTokens
  settings:     ThemeSettings
  
  // Typography
  fontDisplay:  string
  fontBody:     string

  updatedAt:    string
}

// Alias for clarity — same shape, different name in product copy
export type Theme = ColorPalette
