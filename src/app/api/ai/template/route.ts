// ═══════════════════════════════════════════════════════════
// POST /api/ai/template
//   Input:  { article: string, model?: string }
//   Output: { ok: true, template: "classic" | "editorial" | "visual" }
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { suggestTemplate } from "@/lib/ai/blog-pipeline"
import {
  requireAdmin,
  checkRateLimit,
  rateLimitResponse,
  auditAI,
  jsonError,
} from "@/lib/ai/api-utils"

const bodySchema = z.object({
  article: z.string().min(200).max(20_000),
  model:   z.string().optional(),
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
    const { article, model } = parsed.data
    const template = await suggestTemplate(article, model)
    auditAI({
      user:   gate.ctx,
      action: "ai.template.suggest",
      stage:  "template",
      responseText: template,
      meta:   { template, model },
    })
    return NextResponse.json({ ok: true, template })
  } catch (err) {
    console.error("[ai/template] error:", err)
    return jsonError(
      err instanceof Error ? err.message : "Şablon önerisi üretilemedi.",
      500
    )
  }
}
