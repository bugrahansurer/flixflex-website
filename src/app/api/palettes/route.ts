// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/palettes  (GET list, POST create)
// Auth gated: colors:read / colors:create
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import prisma from "@/lib/prisma"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import { createPaletteSchema } from "@/lib/validators/palette-schema"
import type { ColorTokens, ThemeSettings } from "@/lib/colors/types"
import { DEFAULT_THEME_SETTINGS } from "@/lib/colors/types"

// TODO: migrate to Prisma when ColorPalette model is in DB and migrated.
// In-memory fallback store for development without a live DB.
declare global {
  var __paletteStore: Map<string, import("@/lib/colors/types").ColorPalette> | undefined
}

function getStore(): Map<string, import("@/lib/colors/types").ColorPalette> {
  if (!globalThis.__paletteStore) {
    globalThis.__paletteStore = new Map(
      DEFAULT_PALETTES.map((p) => [p.id, p])
    )
  }
  return globalThis.__paletteStore
}

// ── GET /api/palettes ────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "colors", "read")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  // Try Prisma first, fall back to in-memory
  if (prisma) {
    try {
      const rows = await prisma.colorPalette.findMany({
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      })

      if (rows.length > 0) {
        return NextResponse.json({ palettes: rows })
      }
    } catch (err) {
      console.warn("[api/palettes GET] Prisma error, falling back to in-memory:", err)
    }
  }

  // In-memory fallback
  const palettes = Array.from(getStore().values())
  return NextResponse.json({ palettes })
}

// ── POST /api/palettes ───────────────────────────
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "colors", "create")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi" }, { status: 400 })
  }

  const parsed = createPaletteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Try Prisma
  if (prisma) {
    try {
      const palette = await prisma.colorPalette.create({
        data: {
          name:        data.name,
          description: data.description ?? null,
          isActive:    data.isActive ?? false,
          isSystem:    false, // user-created palettes are never system
          colors:      data.colors as object,
          settings:    (data.settings ?? {}) as object,
          fontDisplay: data.fontDisplay,
          fontBody:    data.fontBody,
          createdBy:   (session.user as { id?: string }).id ?? null,
        },
      })
      revalidatePath("/admin/theme", "page")
      revalidatePath("/admin/renkler", "page")
      return NextResponse.json({ palette }, { status: 201 })
    } catch (err) {
      console.warn("[api/palettes POST] Prisma error, falling back to in-memory:", err)
    }
  }

  // In-memory fallback
  const id = `pal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  const newPalette: import("@/lib/colors/types").ColorPalette = {
    id,
    name:        data.name,
    description: data.description ?? undefined,
    isActive:    data.isActive ?? false,
    isSystem:    false,
    colors:      data.colors as ColorTokens,
    settings:    (data.settings ?? DEFAULT_THEME_SETTINGS) as ThemeSettings,
    fontDisplay: data.fontDisplay ?? "Outfit",
    fontBody:    data.fontBody ?? "Inter",
    updatedAt:   now,
  }
  getStore().set(id, newPalette)
  return NextResponse.json({ palette: newPalette }, { status: 201 })
}
