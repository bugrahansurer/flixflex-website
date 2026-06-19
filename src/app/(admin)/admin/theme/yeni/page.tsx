// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/theme/yeni  — New Palette (Server)
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { NewPaletteForm } from "@/components/admin/colors/new-palette-form"
import prisma from "@/lib/prisma"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import type { ColorPalette } from "@/lib/colors/types"

export const metadata: Metadata = { title: "Yeni Palet Oluştur" }

async function fetchPalettes(): Promise<ColorPalette[]> {
  if (prisma) {
    try {
      const rows = await prisma.colorPalette.findMany({
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      })
      if (rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rows.map((r: any) => ({
          id: r.id as string,
          name: r.name as string,
          description: (r.description as string | null | undefined) ?? undefined,
          isActive: r.isActive as boolean,
          isSystem: r.isSystem as boolean,
          colors: r.colors as ColorPalette["colors"],
          settings: (r.settings as ColorPalette["settings"]) ?? undefined,
          fontDisplay: (r.fontDisplay as string | null | undefined) ?? "Syne",
          fontBody: (r.fontBody as string | null | undefined) ?? "DM Sans",
          updatedAt: (r.updatedAt as Date).toISOString(),
        }))
      }
    } catch {
      // fall through
    }
  }
  return DEFAULT_PALETTES
}

export default async function YeniPaletPage() {
  const palettes = await fetchPalettes()

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="mb-8">
        <Link
          href="/admin/theme"
          className="text-[11px] uppercase tracking-widest text-[var(--foreground-faint)] hover:text-[var(--ff-purple)] transition-colors"
        >
          Tema Düzeni
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mt-1">
          Yeni Tema Düzeni Oluştur
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Sıfırdan başlayın ya da mevcut bir temadan kopyalayın.
        </p>
      </div>
      <NewPaletteForm existingPalettes={palettes} />
    </div>
  )
}
