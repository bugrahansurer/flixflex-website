// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/media/upload-url
// POST: creates a Mux direct-upload URL for the authenticated
// admin user. Auth-gated (media:create).
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { video } from "@/lib/mux"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // ── AuthZ (Safe Access) ──────────────────────────────────
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "media", "create")) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    // ── Database Check ───────────────────────────────────────
    if (!prisma) {
      return NextResponse.json({ 
        error: "Veritabanı bağlantısı yok, video yükleme şu an başlatılamaz.",
        status: "maintenance"
      }, { status: 503 })
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Ignored, use defaults
    }
    const { title, type } = body

    if (type !== "video") {
      return NextResponse.json({ error: "Bu endpoint şu an yalnızca video yüklemelerini destekler." }, { status: 400 })
    }

    const corsOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"

    // Check if Mux is configured
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: "Mux entegrasyonu yapılandırılmamış." },
        { status: 500 }
      )
    }

    // Create a direct upload URL from Mux
    let upload;
    try {
      upload = await video.uploads.create({
        new_asset_settings: {
          playback_policy: ["public"],
        },
        cors_origin: corsOrigin,
      })
    } catch (muxErr: any) {
      console.error("[media/upload-url MUX_ERROR]", muxErr)
      return NextResponse.json({ error: "Mux servisine ulaşılamıyor." }, { status: 502 })
    }

    // Create a placeholder record in the DB
    try {
      const media = await prisma.media.create({
        data: {
          title:       title || "Untitled Video",
          type:       "video",
          url:        "",
          muxUploadId: upload.id,
          muxStatus:  "uploading",
        },
      })

      return NextResponse.json({
        success:   true,
        uploadUrl: upload.url,
        uploadId:  upload.id,
        mediaId:   media.id,
      })
    } catch (dbErr: any) {
      console.error("[media/upload-url DB_ERROR]", dbErr)
      // If DB fails here, we still give the upload URL but the user might lose track of the video ID
      return NextResponse.json({
        success:   true,
        warning:   "Veritabanı kaydı oluşturulamadı, ancak yükleme URL'si hazır.",
        uploadUrl: upload.url,
        uploadId:  upload.id,
      })
    }
  } catch (err: any) {
    console.error("[media/upload-url GLOBAL_FATAL]", err)
    return NextResponse.json({ error: "Sunucu hatası", details: err.message }, { status: 500 })
  }
}
