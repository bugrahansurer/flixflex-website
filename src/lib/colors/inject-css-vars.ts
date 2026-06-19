// ═══════════════════════════════════════════════════════════
// FlixFlex — Theme CSS Variable Injector
//
// Emits CSS for the active theme: color tokens + shape tokens.
// Shape tokens drive button/container border-radius + clip-path.
//
// Used server-side via <ActivePaletteStyle> to render the
// override <style> block in the document head.
// ═══════════════════════════════════════════════════════════

import type { ColorTokens, ThemeSettings, ShapeVariant } from "./types"
import type React from "react"

// ── Shape token resolution ───────────────────────────────
// Returns { radius, clipPath } for a given shape variant.
// Used as `border-radius: var(--ff-shape-button-radius)` and
// `clip-path: var(--ff-shape-button-clip)`.
//
//   sharp   → r=0,  no clip
//   rounded → r=10, no clip
//   hex     → r=0,  hexagonal clip-path
//   bevel   → r=0,  cut-corner clip-path (sci-fi)
function shapeTokens(variant: ShapeVariant): { radius: string; clip: string } {
  switch (variant) {
    case "rounded":
      return { radius: "24px", clip: "none" }
    case "hex":
      // Horizontal hexagon — corners 14% in on each side
      return {
        radius: "0",
        clip: "polygon(14% 0%, 86% 0%, 100% 50%, 86% 100%, 14% 100%, 0% 50%)",
      }
    case "bevel":
      // Cut top-left + bottom-right corners (sci-fi feel)
      return {
        radius: "0",
        clip:
          "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
      }
    case "sharp":
    default:
      return { radius: "0", clip: "none" }
  }
}

/**
 * Generates a CSS string overriding global theme tokens.
 * Renders :root (light), .dark, and shape tokens.
 */
export function cssVarsFromPalette(
  colors: ColorTokens,
  settings: ThemeSettings,
  fonts: { display: string; body: string },
  customFonts: { name: string; url: string }[] = []
): string {
  const button = shapeTokens(settings.buttonShape ?? "sharp")
  const container = shapeTokens(settings.containerShape ?? "sharp")

  // Generate @font-face for custom fonts
  const fontFaces = customFonts.map(f => `
@font-face {
  font-family: "${f.name}";
  src: url("${f.url}") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`).join("\n")

  // Generate Google Fonts import ONLY for non-custom fonts
  const googleFontsToImport = [fonts.display, fonts.body]
    .filter(name => !customFonts.some(cf => cf.name === name))
    .map(f => f.replace(/\s+/g, '+'))

  const fontImport = googleFontsToImport.length > 0
    ? `@import url('https://fonts.googleapis.com/css2?family=${googleFontsToImport.join('&family=')}:wght@300;400;500;600;700;800&display=swap');`
    : ""

  return `
${fontFaces}
${fontImport}

:root {
  /* Typography */
  --font-display:       "${fonts.display}", system-ui, sans-serif;
  --font-body:          "${fonts.body}", system-ui, sans-serif;
  --font-body-size:     ${settings.fontBodySize}px;
  --font-heading-size:  ${settings.fontHeadingSize}px;

  --ff-purple:          ${colors.primary};
  --ff-purple-hover:    ${colors.primaryHover};
  --ff-purple-muted:    ${colors.primaryMuted};
  --ff-purple-glow:     ${colors.primaryGlow};
  --ff-charcoal:        ${colors.secondary};
  --ff-charcoal-light:  ${colors.secondaryLight};
  --background:         ${colors.background};
  --background-alt:     ${colors.backgroundAlt};
  --surface:            ${colors.surface};
  --surface-elevated:   ${colors.surfaceElevated};
  --foreground:         ${colors.foreground};
  --foreground-muted:   ${colors.foregroundMuted};
  --foreground-faint:   ${colors.foregroundFaint};
  --border:             ${colors.border};
  --border-strong:      ${colors.borderStrong};
  --primary:            var(--ff-purple);
  --primary-hover:      var(--ff-purple-hover);
  --primary-muted:      var(--ff-purple-muted);
  --secondary:          var(--ff-charcoal);
  --success:            ${colors.success};
  --warning:            ${colors.warning};
  --error:              ${colors.error};

  /* Shape tokens — override the global rounded-none / radius:0 default */
  --ff-shape-button-radius:    ${button.radius};
  --ff-shape-button-clip:      ${button.clip};
  --ff-shape-container-radius: ${container.radius};
  --ff-shape-container-clip:   ${container.clip};
}

.dark {
  --background:         ${colors.dark.background};
  --background-alt:     ${colors.dark.backgroundAlt};
  --surface:            ${colors.dark.surface};
  --surface-elevated:   ${colors.dark.surfaceElevated};
  --foreground:         ${colors.dark.foreground};
  --foreground-muted:   ${colors.dark.foregroundMuted};
  --foreground-faint:   ${colors.dark.foregroundFaint};
  --border:             ${colors.dark.border};
  --border-strong:      ${colors.dark.borderStrong};
  --ff-charcoal:        ${colors.dark.secondary ?? colors.secondary};
  --ff-charcoal-light:  ${colors.dark.secondaryLight ?? colors.secondaryLight};
  --secondary:          ${colors.dark.secondary ?? colors.secondary};
  --ff-purple-muted:    ${colors.primaryMuted};
  --ff-purple-glow:     ${colors.primaryGlow};
}
`.trim()
}

/**
 * Inline-style version for scoped preview containers.
 */
export function paletteToStyleObject(
  colors: ColorTokens,
  settings: ThemeSettings,
  fonts?: { display: string; body: string }
): React.CSSProperties & Record<string, string> {
  const button = shapeTokens(settings.buttonShape ?? "sharp")
  const container = shapeTokens(settings.containerShape ?? "sharp")
  return {
    "--font-display": fonts ? `"${fonts.display}", system-ui, sans-serif` : "inherit",
    "--font-body": fonts ? `"${fonts.body}", system-ui, sans-serif` : "inherit",
    "--font-body-size": `${settings.fontBodySize}px`,
    "--font-heading-size": `${settings.fontHeadingSize}px`,
    "--ff-purple": colors.primary,
    "--ff-purple-hover": colors.primaryHover,
    "--ff-purple-muted": colors.primaryMuted,
    "--ff-purple-glow": colors.primaryGlow,
    "--ff-charcoal": colors.secondary,
    "--ff-charcoal-light": colors.secondaryLight,
    "--background": colors.background,
    "--background-alt": colors.backgroundAlt,
    "--surface": colors.surface,
    "--surface-elevated": colors.surfaceElevated,
    "--foreground": colors.foreground,
    "--foreground-muted": colors.foregroundMuted,
    "--foreground-faint": colors.foregroundFaint,
    "--border": colors.border,
    "--border-strong": colors.borderStrong,
    "--success": colors.success,
    "--warning": colors.warning,
    "--error": colors.error,
    "--ff-shape-button-radius": button.radius,
    "--ff-shape-button-clip": button.clip,
    "--ff-shape-container-radius": container.radius,
    "--ff-shape-container-clip": container.clip,
  } as React.CSSProperties & Record<string, string>
}
