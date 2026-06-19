import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

const ALLOWED_MIMES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  // image/svg+xml intentionally NOT allowed — SVGs can embed <script>
  // and would be served same-origin-ish, enabling stored XSS.
  "image/tiff",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed"
]

function safeBlobPath(fileName: string): string {
  const extension = fileName.includes(".")
    ? `.${fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")}`
    : ""
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "upload"
  const date = new Date().toISOString().slice(0, 10)

  return `media/${date}/${crypto.randomUUID()}-${baseName}${extension}`
}

export async function POST(req: Request) {
  try {
    // ── AuthZ (Inside try-catch for maximum safety) ─────────
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

    // ── Process Body ────────────────────────────────────────
    let formData;
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

    // ── Validate mime ──────────────────────────────────────
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: `Desteklenmeyen dosya türü: ${file.type}.` },
        { status: 415 }
      )
    }

    // ── Validate size ──────────────────────────────────────
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Dosya 20MB sınırını aşıyor." },
        { status: 413 }
      )
    }

    // ── Upload to Vercel Blob ──────────────────────────────
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Vercel Blob token yapılandırılmamış." },
        { status: 503 }
      )
    }

    let blob;
    try {
      blob = await put(safeBlobPath(file.name), file, {
        access:          "public",
        addRandomSuffix: false,
      })
    } catch (blobErr: any) {
      console.error("[media/upload BLOB_ERROR]", blobErr)
      return NextResponse.json({ 
        error: "Depolama servisi şu an kullanılamıyor.", 
        details: blobErr.message 
      }, { status: 503 })
    }

    let type = "document"
    if (file.type.startsWith("image/")) type = "image"
    else if (file.type.startsWith("video/")) type = "video"
    else if (file.type === "application/pdf") type = "pdf"

    // ── Create record in DB (Safe Access) ─────────────────
    if (!prisma) {
      console.warn("[media/upload DB_WARNING] Prisma not available, returning blob-only response.")
      return NextResponse.json({ 
        success: true, 
        warning: "Veritabanı bağlantısı yok, kayıt oluşturulamadı ancak dosya yüklendi.",
        data: {
          id: "mock-db-id",
          title: file.name,
          url: blob.url,
          type
        }
      })
    }

    try {
      const media = await prisma.media.create({
        data: {
          title:     file.name,
          type:      type,
          mimeType:  file.type,
          size:      file.size,
          url:       blob.url,
          thumbnail: blob.url,
          muxStatus: "ready",
          folderId:  folderId || null,
        },
      })
      return NextResponse.json({ success: true, data: media })
    } catch (dbErr: any) {
      console.error("[media/upload DB_WRITE_ERROR]", dbErr)
      return NextResponse.json({ 
        success: true, 
        warning: "Dosya yüklendi fakat veritabanı kaydı sırasında hata oluştu.",
        data: {
          id: "temp-id",
          title: file.name,
          url: blob.url,
          type
        }
      })
    }
  } catch (err: any) {
    console.error("[media/upload GLOBAL_FATAL_ERROR]", err)
    return NextResponse.json({ 
      error: "Sistemde kritik bir hata oluştu", 
      details: err.message 
    }, { status: 500 })
  }
}
