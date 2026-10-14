// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/media/upload-complete
// POST: tarayıcı dosyayı imzalı URL ile R2'ye yükledikten sonra
// çağrılır. Nesnenin gerçekten var olduğunu ve sınırlar içinde
// olduğunu doğrular, görselleri sıkıştırır ve medya kaydını oluşturur.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { r2Delete, r2Get, r2Head, r2Put, r2PublicUrl, safeMediaKey } from "@/lib/r2"
import { ALLOWED_MIMES, MAX_PROCESS_IMAGE_BYTES, maxDirectBytes, mediaTypeOf, processMedia } from "@/lib/media-upload"

export const runtime = "nodejs"
export const maxDuration = 60

const bodySchema = z.object({
  // safeMediaKey biçimi: media/YYYY-MM-DD/<uuid>-<ad>[.<uzantı>]
  key: z.string().regex(/^media\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}-[a-z0-9_-]+(\.[a-z0-9]+)?$/),
  title: z.string().min(1).max(255),
  folderId: z.string().regex(/^[a-z0-9]{20,40}$/i).nullable().optional(),
  // Videolar için tarayıcının okuduğu meta veriler (opsiyonel)
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  duration: z.number().positive().max(86400).optional(),
})

export async function POST(req: Request) {
  const session = await auth().catch(() => null)
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "media", "create")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }
  if (!prisma) {
    return NextResponse.json({ error: "Veritabanı bağlantısı yok" }, { status: 503 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }
  const { key, title, folderId, width, height, duration } = parsed.data

  try {
    const head = await r2Head(key)
    if (!head) {
      return NextResponse.json({ error: "Yüklenen dosya bulunamadı." }, { status: 404 })
    }
    const mimeType = head.contentType ?? "application/octet-stream"
    // İmzalı URL tipi sabitlediği için bu kontroller savunma amaçlı;
    // sınır dışı bir nesne kalırsa depodan da silinir.
    if (!ALLOWED_MIMES.includes(mimeType) || head.size > maxDirectBytes(mimeType)) {
      await r2Delete(key).catch(() => {})
      return NextResponse.json({ error: "Dosya türü veya boyutu geçersiz." }, { status: 415 })
    }

    const type = mediaTypeOf(mimeType)
    let finalKey = key
    let finalMime = mimeType
    let finalSize = head.size
    let image: { width: number | null; height: number | null; blurDataUrl: string | null } | null = null

    // Büyük görseller de küçükler gibi WebP'ye sıkıştırılır; orijinal silinir.
    if (type === "image" && head.size <= MAX_PROCESS_IMAGE_BYTES) {
      const original = Buffer.from(await (await r2Get(key)).arrayBuffer())
      const processed = await processMedia(original, mimeType, title)
      if (processed.buffer !== original) {
        finalKey = safeMediaKey(title, processed.ext)
        await r2Put(finalKey, processed.buffer, processed.mimeType)
        await r2Delete(key).catch(() => {})
        finalMime = processed.mimeType
        finalSize = processed.buffer.length
      }
      image = processed
    }

    const url = r2PublicUrl(finalKey)
    const media = await prisma.media.create({
      data: {
        title,
        type,
        mimeType:    finalMime,
        size:        finalSize,
        url,
        thumbnail:   type === "image" ? url : null,
        folderId:    folderId ?? null,
        width:       image?.width ?? width ?? null,
        height:      image?.height ?? height ?? null,
        blurDataUrl: image?.blurDataUrl ?? null,
        duration:    duration ?? null,
      },
    })

    void logAudit({
      userId:     session.user.id,
      action:     "create",
      resource:   "media",
      resourceId: media.id,
      metadata:   { title, type, size: finalSize },
    })

    return NextResponse.json({ success: true, data: media })
  } catch (err) {
    console.error("[media/upload-complete]", err)
    return NextResponse.json({ error: "Yükleme tamamlanamadı." }, { status: 500 })
  }
}
