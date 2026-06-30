// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/theme  — Color Palette List (Server)
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { FFBadge } from "@/components/ui"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import { checkWCAG } from "@/lib/utils"
import { PaletteListActions } from "@/components/admin/colors/palette-list-actions"
import { SwatchRow } from "@/components/admin/colors/swatch-row"
import prisma from "@/lib/prisma"
import type { ColorPalette } from "@/lib/colors/types"
import { Plus } from "@/lib/icons"
import { getCan } from "@/lib/rbac/server-can"

export const metadata: Metadata = { title: "Tema Düzeni" }

// Force dynamic so the active palette always reflects DB state
export const dynamic = "force-dynamic"

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
          fontDisplay: (r.fontDisplay as string | null | undefined) ?? "Outfit",
          fontBody: (r.fontBody as string | null | undefined) ?? "Inter",
          updatedAt: (r.updatedAt as Date).toISOString(),
        }))
      }
    } catch {
      // fall through to default
    }
  }
  return DEFAULT_PALETTES
}

// 8 swatch colors extracted from a palette's ColorTokens
function swatchColors(p: ColorPalette): string[] {
  const c = p.colors
  return [
    c.primary,
    c.secondary,
    c.background,
    c.surface,
    c.foreground,
    c.success,
    c.warning,
    c.error,
  ]
}

export default async function ThemePage() {
  const palettes = await fetchPalettes()
  const can = await getCan()

  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] mb-2">
            Tema Düzeni
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Temalarınızı oluşturun ve yönetin.
          </p>
        </div>
        {can("colors", "create") && (
          <Link
            href="/admin/theme/yeni"
            className="ff-btn ff-btn-primary text-[13px]"
          >
            <Plus size={14} />
            Tema Oluştur
          </Link>
        )}
      </div>

      {/* Palette grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {palettes.map((palette) => {
          const swatches = swatchColors(palette)
          const wcag = checkWCAG(palette.colors.primary, palette.colors.background)

          return (
            <div
              key={palette.id}
              className="ff-card hover:shadow-xs p-4 relative flex flex-col gap-4"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {palette.isActive && (
                  <FFBadge variant="success" dot>
                    Aktif
                  </FFBadge>
                )}
                {palette.isSystem && (
                  <FFBadge variant="charcoal">
                    Sistem
                  </FFBadge>
                )}
              </div>

              {/* Name + description */}
              <div>
                <h2 className="font-display text-base font-bold text-[#0d0d0d]">
                  {palette.name}
                </h2>
                {palette.description && (
                  <p className="text-xs text-[#888888] mt-0.5 leading-relaxed">
                    {palette.description}
                  </p>
                )}
              </div>

              {/* Swatch row */}
              <SwatchRow swatches={swatches} />

              {/* WCAG badge */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#010000] font-medium">
                  Ana Renk:
                </span>
                {wcag.aaa ? (
                  <FFBadge variant="success">AAA {wcag.ratio}:1</FFBadge>
                ) : wcag.aa ? (
                  <FFBadge variant="warning">AA {wcag.ratio}:1</FFBadge>
                ) : (
                  <FFBadge variant="error">Başarısız {wcag.ratio}:1</FFBadge>
                )}
              </div>

              {/* Actions — client component handles interactivity */}
              <PaletteListActions palette={palette} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
