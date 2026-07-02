// ═══════════════════════════════════════════════════════════
// /api/blog/[slug]
//   GET    — read a single post
//   PATCH  — update by id (slug is used to locate it)
//   DELETE — delete by id
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import {
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
} from "@/lib/ai/blog-store"
import { logAudit } from "@/lib/audit"

const TEMPLATE = z.enum(["classic", "editorial", "visual"])
const STATUS   = z.enum(["draft", "published"])

const patchSchema = z.object({
  title:        z.string().min(4).max(300).optional(),
  slug:         z.string().min(1).optional(),
  excerpt:      z.string().max(500).optional(),
  content:      z.string().min(20).optional(),
  coverImage:   z.string().optional().nullable(),
  coverGradient: z.string().optional(),
  template:     TEMPLATE.optional(),
  category:     z.string().optional(),
  tags:         z.array(z.string()).optional(),
  status:       STATUS.optional(),
})

// Helper: accept either an id or a slug
async function lookup(slugOrId: string) {
  return (await getPostById(slugOrId)) ?? (await getPostBySlug(slugOrId))
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const gate = await requirePermission("blog", "read")
  if (!gate.ok) return gate.response

  const { slug } = await params
  const post = await lookup(slug)
  if (!post) return jsonError("Yazı bulunamadı.", 404)
  return NextResponse.json({ ok: true, post })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const gate = await requirePermission("blog", "update")
  if (!gate.ok) return gate.response

  const { slug } = await params
  const post = await lookup(slug)
  if (!post) return jsonError("Yazı bulunamadı.", 404)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonError("Geçersiz JSON gövdesi.", 400)
  }
  const parsed = patchSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const updated = await updatePost(post.id, parsed.data)
  void logAudit({ userId: gate.ctx.userId, action: parsed.data.status === "published" ? "publish" : "update", resource: "blog", resourceId: post.id, metadata: { title: updated?.title ?? post.title } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, post: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const gate = await requirePermission("blog", "delete")
  if (!gate.ok) return gate.response

  const { slug } = await params
  const post = await lookup(slug)
  if (!post) return jsonError("Yazı bulunamadı.", 404)

  const removed = await deletePost(post.id)
  void logAudit({ userId: gate.ctx.userId, action: "delete", resource: "blog", resourceId: post.id, metadata: { title: post.title } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: removed })
}
