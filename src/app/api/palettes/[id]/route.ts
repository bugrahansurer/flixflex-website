// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/palettes/[id]  (GET, PATCH, DELETE)
// Auth gated: colors:read / colors:update / colors:delete
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import prisma from "@/lib/prisma"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import { updatePaletteSchema } from "@/lib/validators/palette-schema"
import type { ColorTokens, ThemeSettings } from "@/lib/colors/types"

// In-memory fallback (shared with /api/palettes/route.ts via globalThis)
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

// ── GET /api/palettes/[id] ───────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "colors", "read")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  const { id } = await params

  if (prisma) {
    try {
      const palette = await prisma.colorPalette.findUnique({ where: { id } })
      if (palette) return NextResponse.json({ palette })
    } catch (err) {
      console.warn("[api/palettes/[id] GET] Prisma error:", err)
    }
  }

  // In-memory fallback
  const palette = getStore().get(id)
  if (!palette) {
    return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
  }
  return NextResponse.json({ palette })
}

// ── PATCH /api/palettes/[id] ─────────────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "colors", "update")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi" }, { status: 400 })
  }

  const parsed = updatePaletteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  if (prisma) {
    try {
      const existing = await prisma.colorPalette.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
      }

      // System palettes: only block name/isSystem changes; allow
      // colors/description/settings to be customized fully.
      const update = {
        ...(data.name !== undefined && !existing.isSystem && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.colors !== undefined && { colors: data.colors as object }),
        ...(data.settings !== undefined && { settings: data.settings as object }),
        ...(data.fontDisplay !== undefined && { fontDisplay: data.fontDisplay }),
        ...(data.fontBody !== undefined && { fontBody: data.fontBody }),
      }

      const updated = await prisma.colorPalette.update({
        where: { id },
        data: update,
      })
      revalidatePath("/admin/theme", "page")
      revalidatePath("/admin/theme/[id]", "page")
      revalidatePath("/admin/renkler", "page")
      return NextResponse.json({ palette: updated })
    } catch (err) {
      console.warn("[api/palettes/[id] PATCH] Prisma error:", err)
    }
  }

  // In-memory fallback
  const store = getStore()
  const existing = store.get(id)
  if (!existing) {
    return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
  }

  const updated = {
    ...existing,
    // System palettes can't rename; everything else editable
    ...(data.name !== undefined && !existing.isSystem && { name: data.name }),
    ...(data.description !== undefined && { description: data.description ?? undefined }),
    ...(data.colors !== undefined && { colors: data.colors as ColorTokens }),
    ...(data.settings !== undefined && { settings: data.settings as ThemeSettings }),
    ...(data.fontDisplay !== undefined && { fontDisplay: data.fontDisplay }),
    ...(data.fontBody !== undefined && { fontBody: data.fontBody }),
    updatedAt: new Date().toISOString(),
  }
  store.set(id, updated)
  revalidatePath("/admin/theme", "page")
  revalidatePath("/admin/theme/[id]", "page")
  revalidatePath("/admin/renkler", "page")
  return NextResponse.json({ palette: updated })
}

// ── DELETE /api/palettes/[id] ────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "colors", "delete")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  const { id } = await params

  if (prisma) {
    try {
      const existing = await prisma.colorPalette.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
      }
      if (existing.isSystem) {
        return NextResponse.json(
          { error: "Sistem paletleri silinemez" },
          { status: 403 }
        )
      }
      if (existing.isActive) {
        return NextResponse.json(
          { error: "Aktif tema silinemez. Önce başka bir temayı aktive edin." },
          { status: 409 }
        )
      }
      await prisma.colorPalette.delete({ where: { id } })
      revalidatePath("/admin/theme", "page")
      revalidatePath("/admin/renkler", "page")
      return NextResponse.json({ success: true })
    } catch (err) {
      console.warn("[api/palettes/[id] DELETE] Prisma error:", err)
    }
  }

  // In-memory fallback
  const store = getStore()
  const existing = store.get(id)
  if (!existing) {
    return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
  }
  if (existing.isSystem) {
    return NextResponse.json({ error: "Sistem paletleri silinemez" }, { status: 403 })
  }
  if (existing.isActive) {
    return NextResponse.json(
      { error: "Aktif tema silinemez. Önce başka bir temayı aktive edin." },
      { status: 409 }
    )
  }
  store.delete(id)
  revalidatePath("/admin/theme", "page")
  revalidatePath("/admin/renkler", "page")
  return NextResponse.json({ success: true })
}
