import { NextResponse } from "next/server"
import { video } from "@/lib/mux"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"

export async function POST() {
  console.log("[media/sync-mux] Senkronizasyon başlatıldı...")
  
  try {
    // ── AuthZ (Safe Access) ──────────────────────────────────
    const session = await auth().catch(err => {
      console.error("[media/sync-mux AUTH_FATAL]", err)
      return null
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "media", "update")) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    // ── Database Check ───────────────────────────────────────
    if (!prisma) {
      return NextResponse.json({ 
        error: "Veritabanı bağlantısı yok, senkronizasyon şu an yapılamaz.",
        status: "maintenance"
      }, { status: 503 })
    }

    // 1. Fetch assets from Mux
    console.log("[media/sync-mux] Mux'tan asset listesi çekiliyor...")
    let assets = []
    try {
      const response = await video.assets.list({ limit: 100 })
      assets = Array.isArray(response) ? response : (response as any).data || []
    } catch (muxErr: any) {
      console.error("[media/sync-mux MUX_ERROR]", muxErr)
      return NextResponse.json({ 
        error: "Mux servisine ulaşılamıyor.", 
        details: muxErr.message 
      }, { status: 502 })
    }
    
    console.log(`[media/sync-mux] Mux'ta ${assets.length} adet asset bulundu.`)
    
    let createdCount = 0
    let updatedCount = 0

    for (const asset of assets) {
      try {
        const playbackId = asset.playback_ids?.[0]?.id
        if (!playbackId) continue

        // Check if already in DB
        const existing = await prisma.media.findFirst({
          where: {
            OR: [
              { muxAssetId: asset.id },
              { muxPlaybackId: playbackId }
            ]
          }
        })

        // Çözünürlük bilgisini çek (tracks içinden video track'ini bul)
        const videoTrack = asset.tracks?.find((t: any) => t.type === "video")
        const width = videoTrack?.width || 0
        const height = videoTrack?.height || 0

        const mediaData = {
          title:         existing?.title || `Mux Video ${asset.id.slice(-4)}`,
          type:          "video",
          mimeType:      "video/hls",
          url:           `https://stream.mux.com/${playbackId}.m3u8`,
          thumbnail:     `https://image.mux.com/${playbackId}/thumbnail.jpg`,
          muxAssetId:    asset.id,
          muxPlaybackId: playbackId,
          muxStatus:     asset.status,
          duration:      asset.duration || 0,
          width:         width || ((asset as any).max_stored_resolution === "HD" ? 1920 : 0),
          height:        height || ((asset as any).max_stored_resolution === "HD" ? 1080 : 0),
          size:          existing?.size || 0 
        }

        if (existing) {
          await prisma.media.update({
            where: { id: existing.id },
            data: mediaData
          })
          updatedCount++
        } else {
          await prisma.media.create({
            data: mediaData
          })
          createdCount++
        }
      } catch (assetErr) {
        console.error(`[media/sync-mux] Asset ${asset.id} işlenirken hata:`, assetErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdCount} yeni video eklendi, ${updatedCount} video güncellendi.`,
      createdCount,
      updatedCount
    })
  } catch (err: any) {
    console.error("[media/sync-mux GLOBAL_ERROR]", err)
    return NextResponse.json({ 
      error: "Sistemde kritik bir hata oluştu", 
      details: err.message 
    }, { status: 500 })
  }
}
