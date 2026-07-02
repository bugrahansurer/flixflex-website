// ═══════════════════════════════════════════════════════════
// FlixFlex — Pages API  GET|PATCH|DELETE /api/pages/[id]
//
// Auth gated:
//   GET    → pages:read
//   PATCH  → pages:update
//   DELETE → pages:delete
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { updatePageSchema } from "@/lib/validators/page-schema"
import { logAudit } from "@/lib/audit"
import type { PageData, SectionBlock } from "@/types/page-builder"

// ── In-memory fallback (shared via globalThis) ────
const g = globalThis as typeof globalThis & {
  _pageStore?: Map<string, PageData>
}
if (!g._pageStore) {
  g._pageStore = new Map<string, PageData>([
    [
      "home",
      {
        id:          "home",
        slug:        "/",
        title:       "Ana Sayfa",
        description: "FlixFlex ana sayfası",
        sections:    [],
        status:      "published",
        updatedAt:   new Date().toISOString(),
      },
    ],
  ])
}
const memStore = g._pageStore!

// ── Prisma helper ─────────────────────────────────
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma")
  if (!prisma) throw new Error("Prisma unavailable")
  await prisma.$queryRaw`SELECT 1`
  return prisma
}

function prismaPageToPageData(p: {
  id: string
  slug: string
  title: string
  description: string | null
  sections: unknown
  isPublished: boolean
  updatedAt: Date
}): PageData {
  return {
    id:          p.id,
    slug:        p.slug,
    title:       p.title,
    description: p.description ?? undefined,
    sections:    (p.sections as unknown as SectionBlock[]) ?? [],
    status:      p.isPublished ? "published" : "draft",
    updatedAt:   p.updatedAt.toISOString(),
  }
}

type RouteContext = { params: Promise<{ id: string }> }

// ── GET /api/pages/[id] ───────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "pages", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    const db   = await getPrisma()
    const page = await db.page.findUnique({ where: { id } })
    if (!page) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
    return NextResponse.json({ success: true, data: prismaPageToPageData(page) })
  } catch {
    const page = memStore.get(id)
    if (!page) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
    return NextResponse.json({ success: true, data: page })
  }
}

// ── PATCH /api/pages/[id] ─────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "pages", "update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi" }, { status: 400 })
  }

  const parsed = updatePageSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const body = parsed.data

  try {
    const db = await getPrisma()
    const updated = await db.page.update({
      where: { id },
      data: {
        ...(body.title       !== undefined && { title:       body.title }),
        ...(body.slug        !== undefined && { slug:        body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.sections    !== undefined && { sections:    body.sections as any }),
        ...(body.status      !== undefined && {
          isPublished: body.status === "published",
          publishedAt: body.status === "published" ? new Date() : null,
        }),
      },
    })
    void logAudit({ userId: session.user.id, action: body.status !== undefined ? (body.status === "published" ? "publish" : "update") : "update", resource: "pages", resourceId: id, metadata: { title: updated.title } })
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true, data: prismaPageToPageData(updated) })
  } catch {
    const existing = memStore.get(id)
    if (!existing) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })

    const updated: PageData = {
      ...existing,
      ...(body.title       !== undefined && { title:       body.title }),
      ...(body.slug        !== undefined && { slug:        body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      // Zod schema mirrors SectionBlock shape but keeps `type` as a
      // string for forward-compat. Cast to the strict union here.
      ...(body.sections    !== undefined && { sections:    body.sections as SectionBlock[] }),
      ...(body.status      !== undefined && { status:      body.status }),
      updatedAt: new Date().toISOString(),
    }
    memStore.set(id, updated)
    return NextResponse.json({ success: true, data: updated })
  }
}

// ── DELETE /api/pages/[id] ────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "pages", "delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    const db = await getPrisma()
    await db.page.delete({ where: { id } })
    void logAudit({ userId: session.user.id, action: "delete", resource: "pages", resourceId: id })
    return NextResponse.json({ success: true })
  } catch {
    const existed = memStore.has(id)
    if (!existed) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
    memStore.delete(id)
    return NextResponse.json({ success: true })
  }
}
