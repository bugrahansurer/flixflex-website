// ═══════════════════════════════════════════════════════════
// Medya yükleme kuralları + görsel işleme (sunucu tarafı)
// /api/media/upload (küçük dosyalar, sunucudan geçer) ve
// /api/media/upload-url + /api/media/upload-complete (büyük dosyalar,
// tarayıcıdan doğrudan R2'ye) aynı kuralları paylaşır.
// ═══════════════════════════════════════════════════════════

import sharp from "sharp"

export const ALLOWED_MIMES = [
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
  "application/x-zip-compressed",
]

/** Sunucudan geçen (multipart) yüklemelerin sınırı — Vercel istek gövdesi 4.5 MB. */
export const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024
/** Doğrudan R2'ye yüklenen dosyaların sınırı. */
export const MAX_DIRECT_UPLOAD_BYTES = {
  video: 1024 * 1024 * 1024, // 1 GB
  other: 50 * 1024 * 1024,   // 50 MB
}
/** Doğrudan yüklenen görseller bu boyutun altındaysa sıkıştırılır. */
export const MAX_PROCESS_IMAGE_BYTES = 30 * 1024 * 1024

export function maxDirectBytes(mimeType: string): number {
  return mimeType.startsWith("video/") ? MAX_DIRECT_UPLOAD_BYTES.video : MAX_DIRECT_UPLOAD_BYTES.other
}

export function mediaTypeOf(mimeType: string): "image" | "video" | "pdf" | "document" {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType === "application/pdf") return "pdf"
  return "document"
}

export function extOf(fileName: string): string {
  return fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? ""
    : ""
}

// ── Pixel-bomb / decompression-bomb guard ───────────────────────────────────
// A small PNG/GIF can advertise billions of decoded pixels. libvips allocates
// the full decoded frame before any resize logic runs, so the byte-size cap
// does NOT bound RAM. 100 MP ≈ 400 MB RGBA worst case.
const SHARP_PIXEL_LIMIT = 100_000_000

const RASTER_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/tiff"])

export interface ProcessedImage {
  buffer: Buffer
  mimeType: string
  ext: string
  width: number | null
  height: number | null
  blurDataUrl: string | null
}

/** Tiny 16×16 WebP base64 blur placeholder. Returns null on failure — never throws. */
async function generateBlur(buf: Buffer): Promise<string | null> {
  try {
    const tiny = await sharp(buf, { limitInputPixels: SHARP_PIXEL_LIMIT })
      .resize(16, 16, { fit: "inside" })
      .webp({ quality: 50 })
      .toBuffer()
    return `data:image/webp;base64,${tiny.toString("base64")}`
  } catch {
    return null
  }
}

/**
 * Compress an image buffer with sharp (rotate → resize ≤2560 → WebP).
 * Non-images pass through unchanged. Falls back to the original on error.
 */
export async function processMedia(buf: Buffer, mimeType: string, originalName: string): Promise<ProcessedImage> {
  // SVG: hard rejection — stored XSS prevention.
  if (mimeType === "image/svg+xml") throw new Error("SVG girişi desteklenmiyor.")

  const passthrough: ProcessedImage = {
    buffer: buf, mimeType, ext: extOf(originalName), width: null, height: null, blurDataUrl: null,
  }

  if (mimeType === "image/gif") {
    try {
      const opts = { animated: true, limitInputPixels: SHARP_PIXEL_LIMIT }
      const [compressed, meta] = await Promise.all([
        sharp(buf, opts).webp({ quality: 75 }).toBuffer(),
        sharp(buf, opts).metadata(),
      ])
      return {
        buffer: compressed, mimeType: "image/webp", ext: "webp",
        width: meta.width ?? null, height: meta.height ?? null, blurDataUrl: await generateBlur(buf),
      }
    } catch (err) {
      console.error("[media SHARP_GIF_ERROR]", (err as Error).message)
      return passthrough
    }
  }

  if (RASTER_MIMES.has(mimeType)) {
    try {
      const opts = { limitInputPixels: SHARP_PIXEL_LIMIT }
      const [compressed, meta] = await Promise.all([
        sharp(buf, opts)
          .rotate() // respect EXIF orientation
          .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
        sharp(buf, opts).rotate().metadata(),
      ])
      return {
        buffer: compressed, mimeType: "image/webp", ext: "webp",
        width: meta.width ?? null, height: meta.height ?? null, blurDataUrl: await generateBlur(buf),
      }
    } catch (err) {
      console.error("[media SHARP_RASTER_ERROR]", (err as Error).message)
      return passthrough
    }
  }

  return passthrough
}
