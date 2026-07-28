// ═══════════════════════════════════════════════════════════
// Cloudflare R2 storage client (REST API üzerinden)
//
// NOT: R2'nin S3-uyumlu endpoint'i (*.r2.cloudflarestorage.com)
// bazı ISS'lerde SNI seviyesinde engelli (TR'de doğrulandı).
// Bu yüzden nesne yükleme/silme işlemleri api.cloudflare.com
// üzerinden yapılır — dashboard'la aynı altyapı, her yerden erişilir.
// Dosya servis etme tarafı zaten r2.dev / custom domain kullanır.
//
// Gerekli env:
//   CLOUDFLARE_ACCOUNT_ID  hesap ID'si
//   CLOUDFLARE_API_TOKEN   R2 yetkili API token (cfat_...)
//   R2_BUCKET              bucket adı (örn. flixflex-media)
//   R2_PUBLIC_BASE_URL     https://pub-xxxx.r2.dev (sonda / olmadan)
// ═══════════════════════════════════════════════════════════

const API_BASE = "https://api.cloudflare.com/client/v4"

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
  const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/+$/, "")
  return { url: `${base}/${key}` }
}

/**
 * Delete an object from R2 given its public URL.
 * Silently ignores URLs that don't belong to our public base.
 */
export async function r2DeleteByUrl(url: string): Promise<void> {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "")
  if (!base || !url.startsWith(`${base}/`)) return
  const key = decodeURIComponent(url.slice(base.length + 1))
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

/** True when the given URL points at our R2 public bucket. */
export function isR2Url(url: string): boolean {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "")
  return Boolean(base && url.startsWith(`${base}/`))
}
