// ═══════════════════════════════════════════════════════════
// FlixFlex — POST /api/palettes/[id]/activate
//
// Sets the specified palette as active and deactivates all
// others in a single Prisma transaction to ensure uniqueness.
// Auth gated: colors:update permission.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import prisma from "@/lib/prisma"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"

// In-memory fallback (shared with other palette routes)
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

// ── POST /api/palettes/[id]/activate ────────────
export async function POST(
  _req: Request,
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

  if (prisma) {
    try {
      // Verify the target palette exists
      const target = await prisma.colorPalette.findUnique({ where: { id } })
      if (!target) {
        return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
      }

      // Transaction: deactivate all → activate target
      await prisma.$transaction([
        prisma.colorPalette.updateMany({
          where:  { isActive: true },
          data:   { isActive: false },
        }),
        prisma.colorPalette.update({
          where: { id },
          data:  { isActive: true },
        }),
      ])

      const updated = await prisma.colorPalette.findUnique({ where: { id } })
      revalidatePath("/admin/theme", "page")
      revalidatePath("/admin/renkler", "page")
      revalidatePath("/", "layout")
      return NextResponse.json({ palette: updated })
    } catch (err) {
      console.warn("[api/palettes/[id]/activate POST] Prisma error:", err)
    }
  }

  // In-memory fallback
  const store = getStore()
  const target = store.get(id)
  if (!target) {
    return NextResponse.json({ error: "Palet bulunamadı" }, { status: 404 })
  }

  // Deactivate all, then activate target (simulate transaction)
  for (const [key, pal] of store.entries()) {
    store.set(key, { ...pal, isActive: key === id })
  }

  revalidatePath("/admin/theme", "page")
  revalidatePath("/admin/renkler", "page")
  revalidatePath("/", "layout")
  return NextResponse.json({ palette: store.get(id) })
}
