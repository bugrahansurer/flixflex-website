// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/media/upload
// Küçük dosyalar (≤4 MB) için: dosya sunucudan geçer, görseller
// sharp ile WebP'ye sıkıştırılır ve R2'ye yazılır. Büyük dosyalar
// (video vb.) /api/media/upload-url ile doğrudan R2'ye yüklenir.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { r2Put, isR2Configured, safeMediaKey } from "@/lib/r2"
import { ALLOWED_MIMES, MAX_SERVER_UPLOAD_BYTES, mediaTypeOf, processMedia } from "@/lib/media-upload"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { prisma } from "@/lib/prisma"
import { checkLimit, getClientIp, rateLimitResponse, MEDIA_UPLOAD } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    // ── AuthZ ────────────────────────────────────────────────
    const session = await auth().catch(err => {
      console.error("[media/upload AUTH_FATAL]", err)
      return null
    })
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "media", "create")) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    // ── Rate limit (per authenticated user IP) ───────────────
    // Prevents a valid credential from being used to trigger
    // repeated in-memory sharp decode cycles (DoS amplification).
    const rlResult = await checkLimit(MEDIA_UPLOAD, getClientIp(req))
    if (!rlResult.allowed) return rateLimitResponse(rlResult)

    // ── Parse body ───────────────────────────────────────────
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 })
    }

    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string | null
    if (!file) {
      return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 })
    }

    // ── Validate folderId format ─────────────────────────────
    // cuid / cuid2 range; rejects path-traversal or injection-shaped strings.
    const folderIdValue = folderId && folderId.trim() !== "" ? folderId.trim() : null
    if (folderIdValue !== null && !/^[a-z0-9]{20,40}$/i.test(folderIdValue)) {
      return NextResponse.json({ error: "Geçersiz klasör." }, { status: 400 })
    }

    // ── Validate mime / size ─────────────────────────────────
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: `Desteklenmeyen dosya türü: ${file.type}.` }, { status: 415 })
    }
    if (file.size > MAX_SERVER_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Dosya bu yöntem için çok büyük; doğrudan yükleme kullanılmalı." },
        { status: 413 },
      )
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "Cloudflare R2 depolama yapılandırılmamış." }, { status: 503 })
    }

    // ── Compress / process with sharp ────────────────────────
    const processed = await processMedia(Buffer.from(await file.arrayBuffer()), file.type, file.name)

    // ── Upload to Cloudflare R2 ──────────────────────────────
    let blob: { url: string }
    try {
      blob = await r2Put(safeMediaKey(file.name, processed.ext), processed.buffer, processed.mimeType)
    } catch (err) {
      // Never expose storage internals (may contain endpoint URLs) to the client.
      console.error("[media/upload R2_ERROR]", err)
      return NextResponse.json({ error: "Depolama servisi şu an kullanılamıyor." }, { status: 503 })
    }

    const type = mediaTypeOf(file.type)

    if (!prisma) {
      return NextResponse.json({
        success: true,
        warning: "Veritabanı bağlantısı yok, kayıt oluşturulamadı ancak dosya yüklendi.",
        data: { id: "mock-db-id", title: file.name, url: blob.url, type },
      })
    }

    const media = await prisma.media.create({
      data: {
        title:       file.name,
        type,
        mimeType:    processed.mimeType,
        size:        processed.buffer.length,
        url:         blob.url,
        thumbnail:   type === "image" ? blob.url : null,
        folderId:    folderIdValue,
        width:       processed.width,
        height:      processed.height,
        blurDataUrl: processed.blurDataUrl,
      },
    })

    void logAudit({
      userId:     session.user.id,
      action:     "create",
      resource:   "media",
      resourceId: media.id,
      metadata:   { title: file.name, type, size: processed.buffer.length },
    })

    return NextResponse.json({ success: true, data: media })
  } catch (err) {
    // Log full error server-side; return only a generic message to the client.
    console.error("[media/upload GLOBAL_FATAL_ERROR]", err)
    return NextResponse.json({ error: "Sistemde kritik bir hata oluştu." }, { status: 500 })
  }
}
