// ═══════════════════════════════════════════════════════════
// POST /api/ai/write
//   Input:  { title, outline: Outline, model?: string }
//   Output: { ok: true, markdown: string } (or stream)
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { writeArticle, writeArticleStream } from "@/lib/ai/blog-pipeline"
import {
  requireAdmin,
  checkRateLimit,
  rateLimitResponse,
  auditAI,
  jsonError,
} from "@/lib/ai/api-utils"

const outlineSchema = z.object({
  outline: z
    .array(
      z.object({
        heading: z.string().min(1),
        points:  z.array(z.string()),
      })
    )
    .min(1, "En az bir bölüm bekleniyor."),
  keyArguments: z.array(z.string()).default([]),
  sources: z
    .array(z.object({ title: z.string(), url: z.string() }))
    .default([]),
})

const bodySchema = z.object({
  title:   z.string().min(4).max(300),
  outline: outlineSchema,
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

  const { title, outline, model } = parsed.data

  // Check for stream query param or body flag
  const isStream = req.nextUrl.searchParams.get("stream") === "true"

  if (isStream) {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of writeArticleStream({
            title,
            outline,
            model,
          })) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
          
          // Audit as one final event (estimating tokens)
          auditAI({
            user:   gate.ctx,
            action: "ai.article.generate",
            stage:  "write-stream",
            responseText: "[Streamed content]", 
            meta:   { title, model },
          })
        } catch (err) {
          console.error("[ai/write/stream] error:", err)
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  }

  try {
    const markdown = await writeArticle({
      title,
      outline,
      model,
    })
    auditAI({
      user:   gate.ctx,
      action: "ai.article.generate",
      stage:  "write",
      responseText: markdown,
      meta:   {
        title,
        model,
        sections:      outline.outline.length,
        markdownChars: markdown.length,
      },
    })
    return NextResponse.json({ ok: true, markdown })
  } catch (err) {
    console.error("[ai/write] error:", err)
    return jsonError(
      err instanceof Error ? err.message : "Yazı üretilemedi.",
      500
    )
  }
}
