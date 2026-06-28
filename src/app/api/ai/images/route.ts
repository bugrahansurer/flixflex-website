// ═══════════════════════════════════════════════════════════
// POST /api/ai/images
//   Input:  { article: string, model?: string }
//   Output: { ok: true, images: ImageSuggestion[] }
//
// Image generation itself is stubbed — see src/lib/ai/image-stub.ts
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { suggestImages } from "@/lib/ai/blog-pipeline"
import {
  requireAdmin,
  checkRateLimit,
  rateLimitResponse,
  auditAI,
  jsonError,
} from "@/lib/ai/api-utils"

const bodySchema = z.object({
  article: z.string().min(200, "Yazı en az 200 karakter olmalı.").max(20_000),
  model:   z.string().optional(),
})

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const rate = await checkRateLimit(gate.ctx.userId)
  if (!rate.allowed) return rateLimitResponse(rate)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonError("Geçersiz JSON gövdesi.", 400)
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const { article, model } = parsed.data
    const images = await suggestImages(article, model)
    auditAI({
      user:   gate.ctx,
      action: "ai.images.suggest",
      stage:  "images",
      responseText: JSON.stringify(images),
      meta:   { model, count: images.length, articleChars: article.length },
    })
    return NextResponse.json({ ok: true, images })
  } catch (err) {
    console.error("[ai/images] error:", err)
    return jsonError(
      err instanceof Error ? err.message : "Görsel önerileri üretilemedi.",
      500
    )
  }
}
