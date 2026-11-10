// Sayfa düzenleyicinin canlı önizleme adresi: /admin/sayfalar/[slug]/onizleme
// Admin altında olsa da site gibi davranır (admin'in açık teması uygulanmaz).
// Edge (middleware) ve istemci tarafında kullanılır; bağımlılık eklemeyin.

const PREVIEW_PATH = /^\/admin\/sayfalar\/[^/]+\/onizleme\/?$/

/** Canlı önizleme her zaman sitenin varsayılan (karanlık) temasıyla açılır */
export const SITE_PREVIEW_THEME = "dark" as const

export function isSitePreviewPath(pathname: string | null | undefined): boolean {
  return !!pathname && PREVIEW_PATH.test(pathname)
}
