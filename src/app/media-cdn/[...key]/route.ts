// ═══════════════════════════════════════════════════════════
// /media-cdn/<key> — eski medya yolu (geriye dönük uyumluluk)
//
// Medya artık bucket'ın public adresinden (R2_PUBLIC_BASE_URL,
// örn. https://cdn.flixflex.com.tr) Cloudflare kenarından servis
// ediliyor. Bu rota, DB'de/içerikte kalmış eski `/media-cdn/...`
// linklerini oraya kalıcı olarak yönlendirir.
//
// Public adres tanımlı değilse (örn. lokal geliştirme) nesneyi
// R2'den Range destekli akıtır — video ileri/geri sarma çalışır.
// ═══════════════════════════════════════════════════════════

import { isR2Configured, r2Get, r2PublicBase, r2PublicUrl, MEDIA_CDN_PREFIX } from "@/lib/r2"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params

  // Yalnızca "media/" ön ekine izin ver — bucket'ta başka veri olursa dışarı sızmasın.
  const key = segments.map(decodeURIComponent).join("/")
  if (!key.startsWith("media/") || key.includes("..")) {
    return new Response("Not found", { status: 404 })
  }

  if (r2PublicBase() !== MEDIA_CDN_PREFIX) {
    return Response.redirect(r2PublicUrl(key), 308)
  }

  if (!isR2Configured()) {
    return new Response("Storage not configured", { status: 503 })
  }

  const range = req.headers.get("range")
  const upstream = await r2Get(key, range).catch(() => null)

  if (!upstream || !(upstream.ok || upstream.status === 206)) {
    return new Response("Not found", {
      status: upstream?.status === 404 ? 404 : 502,
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    })
  }

  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    // Anahtarlar UUID'li ve değişmez → süresiz önbellek güvenli.
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  })
  for (const h of ["content-length", "content-range", "etag", "last-modified"]) {
    const v = upstream.headers.get(h)
    if (v) headers.set(h, v)
  }

  return new Response(upstream.body, { status: upstream.status, headers })
}
