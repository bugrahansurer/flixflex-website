// ═══════════════════════════════════════════════════════════
// Cloudflare R2 storage client (S3 API, aws4fetch ile imzalı)
//
// Tüm medya (görsel, video, belge) tek bir R2 bucket'ında tutulur.
//
// NOT 1: Medya, bucket'a bağlı özel alan adından (R2_PUBLIC_BASE_URL,
// örn. https://cdn.flixflex.com.tr) Cloudflare kenarından servis
// edilir — Range destekli, önbellekli, Vercel bant genişliği harcamaz.
// Eski `/media-cdn/<key>` yolları app/media-cdn/[...key]/route.ts
// tarafından public adrese yönlendirilir (geriye dönük uyumluluk).
//
// NOT 2: Büyük dosyalar (video) Vercel'in 4.5 MB istek sınırına
// takılmasın diye tarayıcıdan doğrudan R2'ye, sunucunun ürettiği
// kısa ömürlü imzalı (presigned) PUT URL'si ile yüklenir. Bucket
// CORS'u bu PUT'a yalnızca site origin'lerinden izin verir.
//
// Gerekli env:
//   CLOUDFLARE_ACCOUNT_ID  hesap ID'si
//   R2_BUCKET              bucket adı (örn. flixflex-media)
//   R2_ACCESS_KEY_ID       R2 S3 Access Key ID
//   R2_SECRET_ACCESS_KEY   R2 S3 Secret Access Key
//   R2_PUBLIC_BASE_URL     bucket'ın public adresi, sonda / olmadan
//                          (https://cdn.flixflex.com.tr)
// ═══════════════════════════════════════════════════════════

import { AwsClient } from "aws4fetch"

/** Site-yerel medya yolu ön eki. */
export const MEDIA_CDN_PREFIX = "/media-cdn"

/** True when every R2 env var required for storage is present. */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  )
}

let client: AwsClient | null = null
function s3(): AwsClient {
  client ??= new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  })
  return client
}

/** S3 endpoint origin — CSP connect-src ve presigned PUT için. */
export function r2S3Origin(): string {
  return `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
}

function objectUrl(key: string): string {
  // Her segmenti ayrı encode et — "/" ayracı korunur, özel karakterler kaçar.
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  return `${r2S3Origin()}/${process.env.R2_BUCKET}/${encodedKey}`
}

/** Bucket'ın public adresi (sonda / olmadan); tanımlı değilse site-yerel proxy. */
export function r2PublicBase(): string {
  return process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "") || MEDIA_CDN_PREFIX
}

/** Nesnenin public URL'si — DB'ye bu yazılır. */
export function r2PublicUrl(key: string): string {
  return `${r2PublicBase()}/${key.split("/").map(encodeURIComponent).join("/")}`
}

/**
 * Upload a buffer to R2 and return its public URL.
 * Key MUST already be sanitized by the caller (see safeMediaKey).
 */
export async function r2Put(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<{ url: string }> {
  const res = await s3().fetch(objectUrl(key), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`R2 PUT failed (${res.status}): ${text.slice(0, 300)}`)
  }
  return { url: r2PublicUrl(key) }
}

/**
 * Tarayıcının doğrudan R2'ye yükleyebilmesi için imzalı PUT URL'si.
 * İstemci aynı Content-Type başlığıyla PUT etmek zorundadır.
 */
export async function r2PresignPut(key: string, contentType: string, expiresSec = 900): Promise<string> {
  const signed = await s3().sign(`${objectUrl(key)}?X-Amz-Expires=${expiresSec}`, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    aws: { signQuery: true },
  })
  return signed.url
}

/** Nesnenin boyut/tip bilgisi; yoksa null. */
export async function r2Head(key: string): Promise<{ size: number; contentType: string | null } | null> {
  const res = await s3().fetch(objectUrl(key), { method: "HEAD" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`R2 HEAD failed (${res.status})`)
  return {
    size: Number(res.headers.get("content-length") ?? 0),
    contentType: res.headers.get("content-type"),
  }
}

/** Nesneyi getirir; `range` verilirse kısmi (206) yanıt döner. */
export async function r2Get(key: string, range?: string | null): Promise<Response> {
  return s3().fetch(objectUrl(key), { headers: range ? { Range: range } : {} })
}

/** Nesneyi anahtarıyla siler. 404 = zaten yok, idempotent. */
export async function r2Delete(key: string): Promise<void> {
  const res = await s3().fetch(objectUrl(key), { method: "DELETE" })
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "")
    throw new Error(`R2 DELETE failed (${res.status}): ${text.slice(0, 300)}`)
  }
}

/**
 * Extract the R2 object key from a stored media URL.
 * Supports the public base, legacy site-local paths (/media-cdn/<key>)
 * and legacy r2.dev URLs. Returns null for foreign URLs.
 */
export function r2KeyFromUrl(url: string): string | null {
  const prefixes = [`${MEDIA_CDN_PREFIX}/`, `${r2PublicBase()}/`]
  for (const p of prefixes) {
    if (url.startsWith(p)) return decodeURIComponent(url.slice(p.length).split("?")[0]) || null
  }
  const legacy = url.match(/^https:\/\/pub-[a-z0-9]+\.r2\.dev\/([^?]+)/)
  return legacy ? decodeURIComponent(legacy[1]) : null
}

/**
 * Delete an object from R2 given its stored media URL.
 * Silently ignores URLs that don't belong to R2.
 */
export async function r2DeleteByUrl(url: string): Promise<void> {
  const key = r2KeyFromUrl(url)
  if (key) await r2Delete(key)
}

/** True when the given URL points at an R2 object (current or legacy form). */
export function isR2Url(url: string): boolean {
  return r2KeyFromUrl(url) !== null
}

/**
 * Güvenli, çakışmasız nesne anahtarı: media/<tarih>/<uuid>-<ad>.<uzantı>
 * Proxy yalnızca "media/" ön ekini servis eder.
 */
export function safeMediaKey(fileName: string, ext: string): string {
  const sanitizedBase = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "upload"
  const sanitizedExt = ext ? `.${ext.toLowerCase().replace(/[^a-z0-9]/g, "")}` : ""
  const date = new Date().toISOString().slice(0, 10)
  return `media/${date}/${crypto.randomUUID()}-${sanitizedBase}${sanitizedExt}`
}
