// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/theme/[id]  — Palette Editor (Server)
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import { PaletteEditor } from "@/components/admin/colors/palette-editor"
import type { ColorPalette, ColorTokens, ThemeSettings } from "@/lib/colors/types"
import { DEFAULT_THEME_SETTINGS } from "@/lib/colors/types"

// Reference defaults — always the first (isSystem) palette which is "FlixFlex Default"
const DEFAULT_COLORS: ColorTokens = DEFAULT_PALETTES[0].colors

/**
 * Merge DB colors with current DEFAULT_COLORS so that any field added
 * to ColorTokens after the palette was originally saved is never undefined.
 * The dark sub-object is merged separately because it is nested.
 */
function normalizeColors(raw: unknown): ColorTokens {
  const r = (raw ?? {}) as Partial<ColorTokens>
  const rawDark = (r.dark ?? {}) as Partial<ColorTokens["dark"]>
  return {
    ...DEFAULT_COLORS,
    ...r,
    dark: { ...DEFAULT_COLORS.dark, ...rawDark },
  }
}

/**
 * Merge DB settings with DEFAULT_THEME_SETTINGS so new fields added to
 * ThemeSettings are never undefined for old palette rows.
 */
function normalizeSettings(raw: unknown): ThemeSettings {
  return { ...DEFAULT_THEME_SETTINGS, ...(raw as Partial<ThemeSettings> ?? {}) }
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const palette = await getPalette(id)
  return { title: palette ? `${palette.name} — Düzenle` : "Palet bulunamadı" }
}

async function getPalette(id: string): Promise<ColorPalette | null> {
  // Try Prisma first
  if (prisma) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: any = await prisma.colorPalette.findUnique({ where: { id } })
      if (row) {
        return {
          id:          row.id          as string,
          name:        row.name        as string,
          description: (row.description as string | null | undefined) ?? undefined,
          isActive:    row.isActive    as boolean,
          isSystem:    row.isSystem    as boolean,
          colors:      normalizeColors(row.colors),
          settings:    normalizeSettings(row.settings),
          fontDisplay: (row.fontDisplay as string | null | undefined) ?? "Outfit",
          fontBody:    (row.fontBody    as string | null | undefined) ?? "Inter",
          updatedAt:   (row.updatedAt  as Date).toISOString(),
        }
      }
    } catch {
      // fall through
    }
  }

  // In-memory / defaults fallback
  const found = DEFAULT_PALETTES.find((p) => p.id === id) ?? null

  if (found) {
    return {
      ...found,
      colors:   normalizeColors(found.colors),
      settings: normalizeSettings(found.settings),
    }
  }

  // Check globalThis store too
  if (typeof globalThis !== "undefined") {
    const store = (
      globalThis as { __paletteStore?: Map<string, ColorPalette> }
    ).__paletteStore
    const stored = store?.get(id)
    if (stored) {
      return {
        ...stored,
        colors:   normalizeColors(stored.colors),
        settings: normalizeSettings(stored.settings),
      }
    }
  }

  return null
}

export default async function PaletteEditPage({ params }: Props) {
  const { id } = await params
  const palette = await getPalette(id)

  if (!palette) {
    notFound()
  }

  return (
    <div className="px-6 md:px-10 py-8">
      <PaletteEditor initial={palette} />
    </div>
  )
}
