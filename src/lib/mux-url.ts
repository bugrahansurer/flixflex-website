// ═══════════════════════════════════════════════════════════
// FlixFlex — Mux URL yardımcıları (client-safe, saf fonksiyonlar)
// @mux/mux-node (server SDK) İÇERMEZ — hem client component'ler hem
// server tarafı güvenle import edebilir. (lib/mux.ts server SDK'lı;
// client bundle'a sızmaması için helper'lar burada.)
// ═══════════════════════════════════════════════════════════

/** stream.mux.com/{ID}.m3u8 → playbackId. İmzalı (token=) URL'lerde null. */
export function getMuxPlaybackId(url?: string | null): string | null {
  if (!url) return null
  if (url.includes("stream.mux.com/") && !url.includes("token=")) {
    return url.split("stream.mux.com/")[1].split(".m3u8")[0].split("?")[0]
  }
  return null
}

/**
 * URL'den MuxPlayer için playbackId veya doğrudan src ayırt eder.
 * - stream.mux.com playback URL'si (imzasız) → { playbackId }
 * - imzalı / diğer tam URL → { src }
 * - düz string (URL değil) → playbackId kabul edilir
 */
export function getMuxData(url?: string | null): { playbackId: string; src: string } {
  if (!url) return { playbackId: "", src: "" }

  if (url.startsWith("http")) {
    const isSigned = url.includes("token=") || url.includes("signature=")
    if (url.includes("stream.mux.com/") && !isSigned) {
      const playbackId = url.split("stream.mux.com/")[1].split(".m3u8")[0].split("?")[0]
      return { playbackId, src: "" }
    }
    return { playbackId: "", src: url }
  }

  return { playbackId: url, src: "" }
}

/** Mux thumbnail (poster) URL'si. */
export function muxThumbnail(playbackId: string, opts?: { time?: number; width?: number }): string {
  const params = new URLSearchParams()
  if (opts?.time != null) params.set("time", String(opts.time))
  if (opts?.width != null) params.set("width", String(opts.width))
  const q = params.toString()
  return `https://image.mux.com/${playbackId}/thumbnail.webp${q ? `?${q}` : ""}`
}

/**
 * Full-bleed hero poster için duyarlı srcSet. Tarayıcı cihaz genişliğine göre
 * (sizes="100vw") uygun boyutu seçer — mobilde küçük, masaüstünde büyük görsel
 * indirir. Böylece "poster'ı doğru boyutlandır" (overize) uyarısı önlenir.
 */
export function muxPosterSrcSet(playbackId: string): string {
  return [640, 828, 1080, 1600]
    .map((w) => `${muxThumbnail(playbackId, { width: w })} ${w}w`)
    .join(", ")
}
