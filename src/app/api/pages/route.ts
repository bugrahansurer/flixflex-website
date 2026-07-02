// ═══════════════════════════════════════════════════════════
// FlixFlex — Pages API  GET /api/pages  POST /api/pages
// Uses Prisma Page model (exists in schema).
// Falls back to globalThis in-memory store if DB not available.
//
// Auth gated:
//   GET  → pages:read
//   POST → pages:create
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { createPageSchema } from "@/lib/validators/page-schema"
import { logAudit } from "@/lib/audit"
import type { PageData, SectionBlock } from "@/types/page-builder"

// ── In-memory fallback store ──────────────────────
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
  // quick connectivity check
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
    sections:    (p.sections as SectionBlock[]) ?? [],
    status:      p.isPublished ? "published" : "draft",
    updatedAt:   p.updatedAt.toISOString(),
  }
}

// ── GET /api/pages ────────────────────────────────
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "pages", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const db = await getPrisma()
    const pages = await db.page.findMany({ orderBy: { updatedAt: "desc" } })
    return NextResponse.json({ success: true, data: pages.map(prismaPageToPageData) })
  } catch {
    // DB not available — use in-memory
    const pages = Array.from(memStore.values())
    return NextResponse.json({ success: true, data: pages })
  }
}

// ── POST /api/pages ───────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "pages", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi" }, { status: 400 })
  }

  const parsed = createPageSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const body = parsed.data

  try {
    const db = await getPrisma()
    const page = await db.page.create({
      data: {
        title:       body.title,
        slug:        body.slug,
        description: body.description ?? null,
        sections:    [],
        isPublished: false,
      },
    })
    void logAudit({ userId: session.user.id, action: "create", resource: "pages", resourceId: page.id, metadata: { title: page.title } })
    return NextResponse.json({ success: true, data: prismaPageToPageData(page) }, { status: 201 })
  } catch {
    // DB not available — in-memory
    const id  = Math.random().toString(36).slice(2, 10)
    const now = new Date().toISOString()
    const page: PageData = {
      id,
      slug:        body.slug,
      title:       body.title,
      description: body.description,
      sections:    [],
      status:      "draft",
      updatedAt:   now,
    }
    if (memStore.has(page.slug)) {
      return NextResponse.json({ error: "Bu slug zaten mevcut" }, { status: 409 })
    }
    memStore.set(id, page)
    return NextResponse.json({ success: true, data: page }, { status: 201 })
  }
}
