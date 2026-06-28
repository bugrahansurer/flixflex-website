// ═══════════════════════════════════════════════════════════
// POST /api/ai/full-pipeline
//
// One-shot endpoint that walks the entire blog pipeline and
// streams progress events back to the client as Server-Sent
// Events (SSE). Each line is:
//
//   data: {"stage":"titles","status":"start"}\n\n
//   data: {"stage":"titles","status":"done","titles":[...]}\n\n
//   …
//   data: {"stage":"done","post":{…}}\n\n
//
// Client can use `EventSource` OR read the body chunk-by-chunk
// (Next.js' ReadableStream works in both Edge and Node runtime).
//
// Inputs:
//   { topic: string }            — full pipeline including title pick
//   { title: string }            — skip title generation; use provided title
// ═══════════════════════════════════════════════════════════

import { NextRequest } from "next/server"
import { z } from "zod"
import {
  suggestTitles,
  generateOutline,
  writeArticle,
  suggestImages,
  suggestTemplate,
} from "@/lib/ai/blog-pipeline"
import {
  requireAdmin,
  checkRateLimit,
  rateLimitResponse,
  auditAI,
  jsonError,
} from "@/lib/ai/api-utils"

const bodySchema = z
  .object({
    topic: z.string().min(2).max(200).optional(),
    title: z.string().min(4).max(300).optional(),
  })
  .refine((v) => v.topic || v.title, {
    message: "topic veya title alanlarından biri zorunlu.",
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
    return Response.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  const { topic, title: presetTitle } = parsed.data

  // ── Build the SSE stream ────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        )
      }

      const fail = (stage: string, err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[ai/full-pipeline] ${stage} failed:`, err)
        send({ stage, status: "error", message })
      }

      try {
        let finalTitle = presetTitle ?? ""

        // 1. Titles (only when topic was provided without a chosen title)
        if (!finalTitle && topic) {
          send({ stage: "titles", status: "start" })
          const titles = await suggestTitles(topic)
          finalTitle = titles[0] ?? topic
          auditAI({
            user:   gate.ctx,
            action: "ai.pipeline.titles",
            stage:  "titles",
            meta:   { topic, count: titles.length },
          })
          send({ stage: "titles", status: "done", titles, chosen: finalTitle })
        }

        // 2. Outline
        send({ stage: "outline", status: "start", title: finalTitle })
        const outline = await generateOutline(finalTitle)
        auditAI({
          user:   gate.ctx,
          action: "ai.pipeline.outline",
          stage:  "outline",
          meta:   { sections: outline.outline.length },
        })
        send({ stage: "outline", status: "done", outline })

        // 3. Article
        send({ stage: "write", status: "start" })
        const markdown = await writeArticle({ title: finalTitle, outline })
        auditAI({
          user:   gate.ctx,
          action: "ai.pipeline.write",
          stage:  "write",
          responseText: markdown,
          meta:   { chars: markdown.length },
        })
        send({ stage: "write", status: "done", markdown })

        // 4. Images
        send({ stage: "images", status: "start" })
        const images = await suggestImages(markdown)
        auditAI({
          user:   gate.ctx,
          action: "ai.pipeline.images",
          stage:  "images",
          meta:   { count: images.length },
        })
        send({ stage: "images", status: "done", images })

        // 5. Template
        send({ stage: "template", status: "start" })
        const template = await suggestTemplate(markdown)
        auditAI({
          user:   gate.ctx,
          action: "ai.pipeline.template",
          stage:  "template",
          meta:   { template },
        })
        send({ stage: "template", status: "done", template })

        // 6. Done — return the assembled draft
        send({
          stage:  "done",
          status: "done",
          post: {
            title:    finalTitle,
            outline,
            markdown,
            images,
            template,
          },
        })
      } catch (err) {
        fail("unknown", err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
