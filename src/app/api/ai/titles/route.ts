// ═══════════════════════════════════════════════════════════
// POST /api/ai/titles
//   Input:  { topic: string }
//   Output: { ok: true, titles: string[] }
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { suggestTitles } from "@/lib/ai/blog-pipeline"
import {
  requireAdmin,
  checkRateLimit,
  rateLimitResponse,
  auditAI,
  jsonError,
} from "@/lib/ai/api-utils"

const bodySchema = z.object({
  topic: z.string().min(2, "Konu en az 2 karakter olmalı.").max(200),
  model: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const rate = checkRateLimit(gate.ctx.userId)
  if (!rate.allowed) return rateLimitResponse(rate.retryAfter ?? 60)

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
    const { topic, model } = parsed.data
    const titles = await suggestTitles(topic, model)
    auditAI({
      user:   gate.ctx,
      action: "ai.titles.generate",
      stage:  "titles",
      responseText: titles.join("\n"),
      meta:   { topic, model, count: titles.length },
    })
    return NextResponse.json({ ok: true, titles })
  } catch (err) {
    console.error("[ai/titles] error:", err)
    return jsonError(
      err instanceof Error ? err.message : "Başlık üretilemedi.",
      500
    )
  }
}
