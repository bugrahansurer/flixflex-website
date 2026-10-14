// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/media/upload-url
// POST: büyük dosyalar (video, büyük görsel/belge) için kısa ömürlü
// imzalı R2 PUT URL'si üretir. Tarayıcı dosyayı doğrudan R2'ye
// yükler, ardından /api/media/upload-complete ile kaydı oluşturur.
// Auth-gated (media:create).
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { isR2Configured, r2PresignPut, safeMediaKey } from "@/lib/r2"
import { ALLOWED_MIMES, extOf, maxDirectBytes } from "@/lib/media-upload"
import { checkLimit, getClientIp, rateLimitResponse, MEDIA_UPLOAD } from "@/lib/rate-limit"

const bodySchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(128),
  size: z.number().int().positive(),
})

export async function POST(req: Request) {
  const session = await auth().catch(() => null)
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "media", "create")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  const rlResult = await checkLimit(MEDIA_UPLOAD, getClientIp(req))
  if (!rlResult.allowed) return rateLimitResponse(rlResult)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }
  const { fileName, contentType, size } = parsed.data

  if (!ALLOWED_MIMES.includes(contentType)) {
    return NextResponse.json({ error: `Desteklenmeyen dosya türü: ${contentType}.` }, { status: 415 })
  }
  const max = maxDirectBytes(contentType)
  if (size > max) {
    return NextResponse.json(
      { error: `Dosya ${Math.round(max / 1024 / 1024)} MB sınırını aşıyor.` },
      { status: 413 },
    )
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: "Cloudflare R2 depolama yapılandırılmamış." }, { status: 503 })
  }

  try {
    const key = safeMediaKey(fileName, extOf(fileName))
    const uploadUrl = await r2PresignPut(key, contentType)
    return NextResponse.json({ success: true, uploadUrl, key })
  } catch (err) {
    console.error("[media/upload-url PRESIGN_ERROR]", err)
    return NextResponse.json({ error: "Depolama servisi şu an kullanılamıyor." }, { status: 503 })
  }
}
