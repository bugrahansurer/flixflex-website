// ═══════════════════════════════════════════════════════════
// FlixFlex — Admin aktivite (AuditLog) biçimlendirme yardımcıları
//
// Hem sunucu (bildirimler sayfası) hem istemci (bildirim paneli,
// dashboard "Son Aktiviteler") tarafında paylaşılır. Sunucuya özgü
// import içermez — saf yardımcı fonksiyonlar.
// ═══════════════════════════════════════════════════════════

import { RESOURCE_LABELS } from "@/lib/rbac/resources"

// Makine anahtarı fiillerini (create/update/…) Türkçe'ye çevir.
const VERB: Record<string, string> = {
  create: "oluşturuldu",
  update: "güncellendi",
  delete: "silindi",
  read: "görüntülendi",
  publish: "yayınlandı",
  login: "giriş yapıldı",
  logout: "çıkış yapıldı",
}

/**
 * AuditLog action+resource ikilisini okunur bir Türkçe cümleye çevirir.
 * Eski kayıtlar zaten insan cümlesi (boşluk içerir) → aynen gösterilir.
 */
export function humanizeAudit(action: string, resource: string): string {
  if (/\s/.test(action)) return action

  const parts = action.split(".")
  const last = parts[parts.length - 1]
  const resLabel = RESOURCE_LABELS[resource] || resource

  if (parts[0] === "ai") return "AI içerik üretildi"
  if (VERB[last]) return `${resLabel} ${VERB[last]}`
  return `${resLabel}: ${action}`
}

/** İsimden baş harfleri (en fazla 2) üretir. */
export function initialsOf(name?: string | null): string {
  return (
    (name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

// Kaynak → admin liste sayfası. Bildirim/arama sonucuna tıklayınca gidilecek yer.
const RESOURCE_HREF: Record<string, string> = {
  blog: "/admin/blog",
  pages: "/admin/sayfalar",
  portfolio: "/admin/portfolyo",
  services: "/admin/hizmetler",
  colors: "/admin/renkler",
  roles: "/admin/roller",
  users: "/admin/kullanicilar",
  settings: "/admin/ayarlar",
  ai: "/admin/ai",
  media: "/admin/medya",
  appointments: "/admin/randevular",
  analytics: "/admin/raporlar",
  messages: "/admin/mesajlar",
}

/** Bir kaynak için admin sayfası linkini döndürür (yoksa null). */
export function resourceHref(resource: string): string | null {
  return RESOURCE_HREF[resource] ?? null
}
