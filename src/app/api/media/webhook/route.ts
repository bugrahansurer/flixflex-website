// ═══════════════════════════════════════════════════════════
// FlixFlex — Mux Webhook Receiver (Fail-Safe)
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mux } from "@/lib/mux"
import { env } from "@/lib/env"

export const runtime = "nodejs"

interface MuxWebhookData {
  id: string
  asset_id?: string
  playback_ids?: Array<{ id: string }>
  duration?: number
  tracks?: Array<{ width?: number; height?: number }>
}

interface MuxWebhookBody {
  type: string
  data: MuxWebhookData
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const secret = env.MUX_WEBHOOK_SECRET

    if (secret) {
      try {
        await mux.webhooks.verifySignature(rawBody, req.headers, secret)
      } catch (err) {
        console.warn("[MUX_WEBHOOK] signature verification failed:", err)
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody) as MuxWebhookBody
    const { type, data } = body

    console.log("[MUX_WEBHOOK]", type, data.id)

    // ── Database Safety ────────────────────────────────────
    if (!prisma) {
      console.error("[MUX_WEBHOOK ERROR] Database is offline. Webhook data lost:", type, data.id)
      // Return 503 so Mux will retry later when DB is back online
      return NextResponse.json({ error: "Database offline" }, { status: 503 })
    }

    try {
      if (type === "video.upload.completed") {
        await prisma.media.updateMany({
          where: { muxUploadId: data.id },
          data:  { muxAssetId: data.asset_id }
        })
      }

      if (type === "video.asset.ready") {
        const playbackId = data.playback_ids?.[0]?.id
        await prisma.media.updateMany({
          where: { muxAssetId: data.id },
          data: {
            muxPlaybackId: playbackId,
            muxStatus:     "ready",
            url:           `https://stream.mux.com/${playbackId}.m3u8`,
            thumbnail:     `https://image.mux.com/${playbackId}/thumbnail.jpg`,
            duration:      data.duration,
            width:         data.tracks?.[0]?.width,
            height:        data.tracks?.[0]?.height
          }
        })
      }

      if (type === "video.asset.errored") {
        await prisma.media.updateMany({
          where: { muxAssetId: data.id },
          data:  { muxStatus: "error" }
        })
      }
    } catch (dbErr: any) {
      console.error("[MUX_WEBHOOK DB_WRITE_ERROR]", dbErr)
      return NextResponse.json({ error: "DB write failed" }, { status: 503 })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("[MUX_WEBHOOK FATAL_ERROR]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
