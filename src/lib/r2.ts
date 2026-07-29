// ═══════════════════════════════════════════════════════════
// Cloudflare R2 storage client (REST API üzerinden)
//
// NOT 1: R2'nin S3-uyumlu endpoint'i (*.r2.cloudflarestorage.com)
// bazı ISS'lerde SNI seviyesinde engelli (TR'de doğrulandı).
// Bu yüzden nesne yükleme/silme işlemleri api.cloudflare.com
// üzerinden yapılır — dashboard'la aynı altyapı, her yerden erişilir.
//
// NOT 2: r2.dev bazı ISS'lerde engelli ve IPv6 üzerinden hatalı 404
// dönebiliyor. Bu yüzden medya URL'leri site-yerel `/media-cdn/<key>`
// biçiminde üretilir; app/media-cdn/[...key]/route.ts bu isteği
// api.cloudflare.com üzerinden karşılar. Tarayıcı hiçbir zaman
// r2.dev'e doğrudan bağlanmaz.
//
// Gerekli env:
//   CLOUDFLARE_ACCOUNT_ID  hesap ID'si
//   CLOUDFLARE_API_TOKEN   R2 yetkili API token (cfat_...)
//   R2_BUCKET              bucket adı (örn. flixflex-media)
//   R2_PUBLIC_BASE_URL     https://pub-xxxx.r2.dev (rewrite hedefi,
//                          sonda / olmadan)
// ═══════════════════════════════════════════════════════════

const API_BASE = "https://api.cloudflare.com/client/v4"

/** Site-yerel medya yolu ön eki (next.config rewrite kaynağıyla aynı). */
export const MEDIA_CDN_PREFIX = "/media-cdn"

/** True when every R2 env var required for uploads is present. */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE_URL
  )
}

function objectApiUrl(key: string): string {
  const acc = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucket = process.env.R2_BUCKET
  // Her segmenti ayrı encode et — "/" ayracı korunur, özel karakterler kaçar.
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  return `${API_BASE}/accounts/${acc}/r2/buckets/${bucket}/objects/${encodedKey}`
}

/**
 * Upload a buffer to R2 and return its public URL.
 * Key MUST already be sanitized by the caller (see safeBlobPath).
 */
export async function r2Put(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<{ url: string }> {
  const res = await fetch(objectApiUrl(key), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`R2 PUT failed (${res.status}): ${text.slice(0, 300)}`)
  }
  // Site-yerel yol döndürülür (ISS engellerinden bağımsız); rewrite
  // bunu r2.dev'e proxy'ler. DB'ye de bu göreli yol yazılır.
  return { url: `${MEDIA_CDN_PREFIX}/${key}` }
}

/**
 * Extract the R2 object key from a stored media URL.
 * Supports both current site-local paths (/media-cdn/<key>) and
 * legacy absolute r2.dev URLs written before the proxy migration.
 * Returns null for foreign URLs (e.g. Vercel Blob, Mux).
 */
function keyFromUrl(url: string): string | null {
  if (url.startsWith(`${MEDIA_CDN_PREFIX}/`)) {
    return decodeURIComponent(url.slice(MEDIA_CDN_PREFIX.length + 1)) || null
  }
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "")
  if (base && url.startsWith(`${base}/`)) {
    return decodeURIComponent(url.slice(base.length + 1)) || null
  }
  return null
}

/**
 * Delete an object from R2 given its stored media URL.
 * Silently ignores URLs that don't belong to R2.
 */
export async function r2DeleteByUrl(url: string): Promise<void> {
  const key = keyFromUrl(url)
  if (!key) return
  const res = await fetch(objectApiUrl(key), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
  })
  // 404 = zaten yok — silme idempotent kabul edilir.
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "")
    throw new Error(`R2 DELETE failed (${res.status}): ${text.slice(0, 300)}`)
  }
}

/** True when the given URL points at an R2 object (current or legacy form). */
export function isR2Url(url: string): boolean {
  return keyFromUrl(url) !== null
}
