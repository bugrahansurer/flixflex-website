// ═══════════════════════════════════════════════════════════
// FlixFlex — Theme Provider Server Components
//
// • ActivePaletteStyle  → injects color + shape CSS vars
// • getActiveTheme()    → returns full active theme (colors + settings)
//
// Falls back to FlixFlex Default when DB unavailable or no active row.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { cache } from "react"
import { cssVarsFromPalette } from "./inject-css-vars"
import { DEFAULT_PALETTES } from "./defaults"
import { DEFAULT_THEME_SETTINGS } from "./types"
import type { ColorTokens, ThemeSettings } from "./types"
import prisma from "@/lib/prisma"

export interface ActiveTheme {
  colors:      ColorTokens
  settings:    ThemeSettings
  name:        string
  id:          string
  fontDisplay: string
  fontBody:    string
  // URLs for custom fonts if they are not Google Fonts
  customFonts: { name: string; url: string }[]
}

const FALLBACK: ActiveTheme = (() => {
  const p = DEFAULT_PALETTES.find((p) => p.isActive)!
  return {
    id:          p.id,
    name:        p.name,
    colors:      p.colors,
    settings:    p.settings ?? DEFAULT_THEME_SETTINGS,
    fontDisplay: "Outfit",
    fontBody:    "Inter",
    customFonts: [],
  }
})()

/**
 * Server-side fetch of the active theme.
 * Wrapped with React cache() so multiple callers within the same
 * request (e.g. layout + page both calling getActiveTheme) share
 * a single Prisma query result — no extra DB round-trips.
 */
export const getActiveTheme = cache(async (): Promise<ActiveTheme> => {
  if (!prisma) return FALLBACK

  try {
    const row = await prisma.colorPalette.findFirst({
      where:  { isActive: true },
      select: {
        id:          true,
        name:        true,
        colors:      true,
        settings:    true,
        fontDisplay: true,
        fontBody:    true,
      },
    })
    if (!row) return FALLBACK

    // Fetch custom fonts if any of the selected fonts are custom
    const customFonts = await prisma.customFont.findMany({
      where: {
        name: { in: [row.fontDisplay, row.fontBody] }
      }
    })

    const settings = (row.settings as Partial<ThemeSettings>) ?? {}
    return {
      id:          row.id,
      name:        row.name,
      colors:      row.colors as unknown as ColorTokens,
      settings:    { ...DEFAULT_THEME_SETTINGS, ...settings },
      fontDisplay: row.fontDisplay || "Syne",
      fontBody:    row.fontBody || "DM Sans",
      customFonts: customFonts.map((f: { name: string; url: string }) => ({ name: f.name, url: f.url })),
    }
  } catch {
    return FALLBACK
  }
})

/**
 * <ActivePaletteStyle /> — inline <style> with theme CSS vars.
 * Rendered inside <body> (or <head>) before page content paints.
 */
export async function ActivePaletteStyle() {
  const theme = await getActiveTheme()
  const css = cssVarsFromPalette(
    theme.colors, 
    theme.settings, 
    {
      display: theme.fontDisplay,
      body:    theme.fontBody,
    },
    theme.customFonts
  )
  return (
    <style
      id="ff-active-palette"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
