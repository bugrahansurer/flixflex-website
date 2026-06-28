import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import sharp from "sharp"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { prisma } from "@/lib/prisma"
import { checkLimit, getClientIp, rateLimitResponse, MEDIA_UPLOAD } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

// ── Pixel-bomb / decompression-bomb guard ───────────────────────────────────
// A 20 MB PNG/GIF can advertise billions of decoded pixels (e.g. 50000×50000).
// libvips allocates the full decoded frame before any resize logic runs, so the
// byte-size cap above does NOT bound RAM. 100 MP (100 000 000 pixels) ≈ 400 MB
// RGBA at worst — hard ceiling well above any legitimate photo at 2 560 px.
// The constant is passed to every sharp() constructor in this file.
const SHARP_PIXEL_LIMIT = 100_000_000 // 100 megapixels

// ── Per-IP upload rate limit ─────────────────────────────────────────────────
// Authenticated callers can still exhaust server RAM by flooding uploads that
// each trigger a full in-memory libvips decode.  10 uploads/min is generous for
// normal use and prevents runaway scripts.
// 10 uploads per IP per minute. Applies AFTER auth/RBAC to avoid leaking
// rate-limit state to unauthenticated callers.

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

const RASTER_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/tiff",
])

interface ProcessedImage {
  buffer: Buffer
  mimeType: string
  ext: string
  width: number | null
  height: number | null
  blurDataUrl: string | null
}

/**
 * Compress an image buffer with sharp.
 * Returns the compressed result, or falls back to the original on any error.
 */
async function processImage(
  buf: Buffer,
  mimeType: string,
  originalName: string,
): Promise<ProcessedImage> {
  // ── SVG: hard rejection — stored XSS prevention ──────────────────────────
  // SVGs can embed <script> and event handlers. Even though ALLOWED_MIMES
  // blocks SVG at the route boundary, this guard ensures that no future
  // caller can bypass that check and reach Blob storage. The throw propagates
  // to the caller (POST handler) which catches it via the outer try/catch and
  // returns a 500, but see the special-case guard in POST that prevents the
  // fallback-to-original path from re-trying an SVG buffer.
  if (mimeType === "image/svg+xml") {
    throw new Error("SVG girişi desteklenmiyor.")
  }

  // ── GIF: animated-aware → WebP ─────────────────────────────────────────
  if (mimeType === "image/gif") {
    try {
      // limitInputPixels rejects pixel-bomb GIFs before libvips allocates
      // the full decoded frame buffer.  This must appear on every sharp()
      // constructor — including the metadata-only instance below.
      const sharpOpts = { animated: true, limitInputPixels: SHARP_PIXEL_LIMIT }
      const pipeline = sharp(buf, sharpOpts).webp({ quality: 75 })
      const [compressed, meta] = await Promise.all([
        pipeline.toBuffer(),
        sharp(buf, sharpOpts).metadata(),
      ])

      const blurDataUrl = await generateBlur(buf)

      return {
        buffer: compressed,
        mimeType: "image/webp",
        ext: "webp",
        width: meta.width ?? null,
        height: meta.height ?? null,
        blurDataUrl,
      }
    } catch (err) {
      console.error("[media/upload SHARP_GIF_ERROR]", (err as Error).message)
      // Fallback: return original GIF
      return {
        buffer: buf,
        mimeType: "image/gif",
        ext: "gif",
        width: null,
        height: null,
        blurDataUrl: null,
      }
    }
  }

  // ── Other raster images: rotate → resize → WebP ─────────────────────────
  if (RASTER_MIMES.has(mimeType)) {
    try {
      // limitInputPixels must be set at construction time; it cannot be
      // applied after the input is already bound to a pipeline.
      const sharpOpts = { limitInputPixels: SHARP_PIXEL_LIMIT }
      const pipeline = sharp(buf, sharpOpts)
        .rotate()                               // respect EXIF orientation
        .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })

      const [compressed, meta] = await Promise.all([
        pipeline.toBuffer(),
        sharp(buf, sharpOpts).rotate().metadata(),
      ])

      const blurDataUrl = await generateBlur(buf)

      return {
        buffer: compressed,
        mimeType: "image/webp",
        ext: "webp",
        width: meta.width ?? null,
        height: meta.height ?? null,
        blurDataUrl,
      }
    } catch (err) {
      console.error("[media/upload SHARP_RASTER_ERROR]", (err as Error).message)
      // Fallback: return original buffer with original mime
      const originalExt = originalName.includes(".")
        ? originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? ""
        : ""
      return {
        buffer: buf,
        mimeType,
        ext: originalExt,
        width: null,
        height: null,
        blurDataUrl: null,
      }
    }
  }

  // ── Non-image (video, pdf, documents): pass through unchanged ───────────
  const originalExt = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? ""
    : ""
  return {
    buffer: buf,
    mimeType,
    ext: originalExt,
    width: null,
    height: null,
    blurDataUrl: null,
  }
}

/**
 * Generate a tiny 16×16 WebP base64 blur placeholder.
 * Returns null on failure — never throws.
 */
async function generateBlur(buf: Buffer): Promise<string | null> {
  try {
    // Use the same pixel-limit guard here: generateBlur creates a second
    // independent sharp instance on the same (already-validated) buffer.
    // Without the guard a pixel-bomb that somehow survived (e.g. fallback
    // path) could still exhaust RAM during blur generation.
    const tiny = await sharp(buf, { limitInputPixels: SHARP_PIXEL_LIMIT })
      .resize(16, 16, { fit: "inside" })
      .webp({ quality: 50 })
      .toBuffer()
    return `data:image/webp;base64,${tiny.toString("base64")}`
  } catch {
    return null
  }
}

function safeBlobPath(baseName: string, ext: string): string {
  const sanitizedBase = baseName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "upload"
  const sanitizedExt = ext ? `.${ext}` : ""
  const date = new Date().toISOString().slice(0, 10)
  return `media/${date}/${crypto.randomUUID()}-${sanitizedBase}${sanitizedExt}`
}

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
    // MediaFolder.id uses Prisma's cuid() default (26-char alphanumeric).
    // We accept the broader /^[a-z0-9]{20,40}$/i range to cover both
    // cuid (clxxxxxxxx, 25 chars) and cuid2 (24 chars), while rejecting
    // path-traversal or injection-shaped strings.
    // Empty / null folderId is valid and resolves to NULL (no folder).
    const folderIdValue = folderId && folderId.trim() !== "" ? folderId.trim() : null
    if (folderIdValue !== null && !/^[a-z0-9]{20,40}$/i.test(folderIdValue)) {
      return NextResponse.json({ error: "Geçersiz klasör." }, { status: 400 })
    }

    // ── Validate mime ────────────────────────────────────────
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: `Desteklenmeyen dosya türü: ${file.type}.` },
        { status: 415 }
      )
    }

    // ── Validate size ────────────────────────────────────────
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Dosya 20MB sınırını aşıyor." },
        { status: 413 }
      )
    }

    // ── Blob token check ─────────────────────────────────────
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Vercel Blob token yapılandırılmamış." },
        { status: 503 }
      )
    }

    // ── Read file into buffer ────────────────────────────────
    const rawBuffer = Buffer.from(await file.arrayBuffer())

    // ── SVG pre-check: belt-and-suspenders before processImage ──────────────
    // ALLOWED_MIMES already blocks SVGs at the route boundary. This second
    // check ensures that even if processImage is ever called directly (e.g.
    // from a future code path that bypasses ALLOWED_MIMES), an SVG buffer
    // will NEVER reach Blob storage. We check here rather than relying solely
    // on the throw inside processImage so the 400 response is explicit.
    if (file.type === "image/svg+xml") {
      return NextResponse.json({ error: "SVG dosyaları desteklenmiyor." }, { status: 415 })
    }

    // ── Compress / process with sharp ────────────────────────
    const processed = await processImage(rawBuffer, file.type, file.name)

    // ── Upload compressed buffer to Vercel Blob ──────────────
    const blobPath = safeBlobPath(file.name, processed.ext)
    let blob: Awaited<ReturnType<typeof put>>
    try {
      blob = await put(blobPath, processed.buffer, {
        access:          "public",
        addRandomSuffix: false,
        contentType:     processed.mimeType,
      })
    } catch (blobErr) {
      // Log full error server-side only; never expose blob SDK internals
      // (may contain storage endpoint URLs or token fragments) to the client.
      console.error("[media/upload BLOB_ERROR]", blobErr)
      return NextResponse.json(
        { error: "Depolama servisi şu an kullanılamıyor." },
        { status: 503 }
      )
    }

    // ── Determine media type ─────────────────────────────────
    let type = "document"
    if (file.type.startsWith("image/")) type = "image"
    else if (file.type.startsWith("video/")) type = "video"
    else if (file.type === "application/pdf") type = "pdf"

    // ── Persist record in DB ─────────────────────────────────
    if (!prisma) {
      console.warn("[media/upload DB_WARNING] Prisma not available, returning blob-only response.")
      return NextResponse.json({
        success: true,
        warning: "Veritabanı bağlantısı yok, kayıt oluşturulamadı ancak dosya yüklendi.",
        data: {
          id:    "mock-db-id",
          title: file.name,
          url:   blob.url,
          type,
        },
      })
    }

    try {
      const media = await prisma.media.create({
        data: {
          title:       file.name,
          type:        type,
          mimeType:    processed.mimeType,
          size:        processed.buffer.length,
          url:         blob.url,
          thumbnail:   blob.url,
          muxStatus:   "ready",
          folderId:    folderIdValue,
          width:       processed.width,
          height:      processed.height,
          blurDataUrl: processed.blurDataUrl,
        },
      })

      // ── Audit log (fire-and-forget; never throws per logAudit contract) ───
      void logAudit({
        userId:     session.user.id,
        action:     "create",
        resource:   "media",
        resourceId: media.id,
        metadata:   { title: file.name, type, size: processed.buffer.length },
      })

      return NextResponse.json({ success: true, data: media })
    } catch (dbErr) {
      console.error("[media/upload DB_WRITE_ERROR]", dbErr)
      return NextResponse.json({
        success: true,
        warning: "Dosya yüklendi fakat veritabanı kaydı sırasında hata oluştu.",
        data: {
          id:    "temp-id",
          title: file.name,
          url:   blob.url,
          type,
        },
      })
    }
  } catch (err) {
    // Log full error server-side (includes sharp/libvips messages, Prisma
    // stack traces, etc.); return only a generic message to the client.
    console.error("[media/upload GLOBAL_FATAL_ERROR]", err)
    return NextResponse.json(
      { error: "Sistemde kritik bir hata oluştu." },
      { status: 500 }
    )
  }
}
