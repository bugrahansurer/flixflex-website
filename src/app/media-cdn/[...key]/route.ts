// ═══════════════════════════════════════════════════════════
// /media-cdn/<key> — R2 medya proxy'si
//
// Medya dosyalarını sitenin KENDİ adresinden servis eder. Tarayıcı
// hiçbir zaman r2.dev'e bağlanmaz; çünkü:
//   1. r2.dev bazı ISS'lerde engelli (TR mobil operatörleri),
//   2. r2.dev IPv6 üzerinden hatalı 404 dönebiliyor (doğrulandı).
// Nesne, her yerden erişilebilen api.cloudflare.com üzerinden
// çekilir ve immutable cache header'ıyla döndürülür — Vercel CDN
// yanıtı kenarda önbellekler, R2'ye istek nadiren gider.
// ═══════════════════════════════════════════════════════════

export const runtime = "nodejs"

const API_BASE = "https://api.cloudflare.com/client/v4"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params

  // safeBlobPath her anahtarı "media/" altına yazar; proxy'nin token'lı
  // erişimi yalnızca bu ön eke açılır (bucket'ta başka veri olursa
  // dışarı sızmasın).
  const key = segments.join("/")
  if (!key.startsWith("media/") || key.includes("..")) {
    return new Response("Not found", { status: 404 })
  }

  const acc = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  const bucket = process.env.R2_BUCKET
  if (!acc || !token || !bucket) {
    return new Response("Storage not configured", { status: 503 })
  }

  const encodedKey = segments.map(encodeURIComponent).join("/")
  const upstream = await fetch(
    `${API_BASE}/accounts/${acc}/r2/buckets/${bucket}/objects/${encodedKey}`,
    { headers: { Authorization: `Bearer ${token}` } },
  ).catch(() => null)

  if (!upstream || !upstream.ok) {
    return new Response("Not found", {
      status: upstream?.status === 404 ? 404 : 502,
      // Silinmiş/eksik dosya için kısa negatif cache — yeniden yüklenirse
      // birkaç dakika içinde düzelsin, ama CDN 404 fırtınasını da emsin.
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      // Anahtarlar UUID'li ve değişmez → süresiz önbellek güvenli.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
