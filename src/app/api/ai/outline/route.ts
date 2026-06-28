// ═══════════════════════════════════════════════════════════
// POST /api/ai/outline
//   Input:  { title: string }
//   Output: { ok: true, outline: Outline }
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateOutline } from "@/lib/ai/blog-pipeline"
import {
  requireAdmin,
  checkRateLimit,
  rateLimitResponse,
  auditAI,
  jsonError,
} from "@/lib/ai/api-utils"

const bodySchema = z.object({
  title: z.string().min(4, "Başlık en az 4 karakter olmalı.").max(300),
  model: z.string().optional(),
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
    const { title, model } = parsed.data
    const outline = await generateOutline(title, model)
    auditAI({
      user:   gate.ctx,
      action: "ai.outline.generate",
      stage:  "outline",
      responseText: JSON.stringify(outline),
      meta:   { title, model, sections: outline.outline.length },
    })
    return NextResponse.json({ ok: true, outline })
  } catch (err) {
    console.error("[ai/outline] error:", err)
    return jsonError(
      err instanceof Error ? err.message : "Taslak üretilemedi.",
      500
    )
  }
}
