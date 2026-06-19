// ═══════════════════════════════════════════════════════════
// /api/blog
//   GET   — list all posts (admin)
//   POST  — create new draft / published post
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import { listPosts, createPost } from "@/lib/ai/blog-store"

const TEMPLATE = z.enum(["classic", "editorial", "visual"])
const STATUS   = z.enum(["draft", "published"])

const createSchema = z.object({
  title:        z.string().min(4).max(300),
  slug:         z.string().min(1).optional(),
  excerpt:      z.string().max(500).optional(),
  content:      z.string().min(20),
  coverImage:   z.string().optional().nullable(),
  coverGradient: z.string().optional(),
  template:     TEMPLATE.optional(),
  category:     z.string().optional(),
  tags:         z.array(z.string()).optional(),
  status:       STATUS.optional(),
  aiGenerated:  z.boolean().optional(),
  aiOutline:    z.unknown().optional(),
  author: z
    .object({
      name:     z.string(),
      role:     z.string(),
      initials: z.string().max(3),
    })
    .optional(),
})

// ── GET — list ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const gate = await requirePermission("blog", "read")
  if (!gate.ok) return gate.response

  const url      = new URL(req.url)
  const status   = url.searchParams.get("status") as "draft" | "published" | null
  const category = url.searchParams.get("category")
  const aiOnly   = url.searchParams.get("ai")

  const posts = await listPosts({
    status:      status   ?? undefined,
    category:    category && category !== "Tümü" ? category : undefined,
    aiGenerated: aiOnly === "1" ? true : aiOnly === "0" ? false : undefined,
  })

  return NextResponse.json({ ok: true, posts })
}

// ── POST — create ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const gate = await requirePermission("blog", "create")
  if (!gate.ok) return gate.response

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonError("Geçersiz JSON gövdesi.", 400)
  }

  const parsed = createSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const post = await createPost(parsed.data)
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, post }, { status: 201 })
}
