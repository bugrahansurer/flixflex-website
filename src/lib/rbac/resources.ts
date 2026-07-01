// ═══════════════════════════════════════════════════════════
// FlixFlex — RBAC Resources & Actions
// ═══════════════════════════════════════════════════════════

export const RESOURCES = {
  BLOG:         "blog",
  PAGES:        "pages",
  PORTFOLIO:    "portfolio",
  SERVICES:     "services",
  COLORS:       "colors",
  ROLES:        "roles",
  USERS:        "users",
  SETTINGS:     "settings",
  AI:           "ai",
  MEDIA:        "media",
  APPOINTMENTS: "appointments",
  ANALYTICS:    "analytics",
} as const

export const ACTIONS = {
  READ:    "read",
  CREATE:  "create",
  UPDATE:  "update",
  DELETE:  "delete",
  PUBLISH: "publish",
  MANAGE:  "manage",
} as const

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES]
export type Action   = (typeof ACTIONS)[keyof typeof ACTIONS]

// ── İnsan-okur Türkçe etiketler (tek kaynak) ──────
// Tüm RESOURCES değerleri burada karşılığını bulmalı; eksik bırakılmaz.
export const RESOURCE_LABELS: Record<string, string> = {
  [RESOURCES.BLOG]:         "Blog",
  [RESOURCES.PAGES]:        "Sayfalar",
  [RESOURCES.PORTFOLIO]:    "Portföy",
  [RESOURCES.SERVICES]:     "Hizmetler",
  [RESOURCES.COLORS]:       "Renkler",
  [RESOURCES.ROLES]:        "Roller",
  [RESOURCES.USERS]:        "Kullanıcılar",
  [RESOURCES.SETTINGS]:     "Ayarlar",
  [RESOURCES.AI]:           "Yapay Zeka",
  [RESOURCES.MEDIA]:        "Medya",
  [RESOURCES.APPOINTMENTS]: "Randevular",
  [RESOURCES.ANALYTICS]:    "Raporlar & Analitik",
}

export const ACTION_LABELS: Record<string, string> = {
  [ACTIONS.READ]:    "Görüntüle",
  [ACTIONS.CREATE]:  "Oluştur",
  [ACTIONS.UPDATE]:  "Düzenle",
  [ACTIONS.DELETE]:  "Sil",
  [ACTIONS.PUBLISH]: "Yayınla",
  [ACTIONS.MANAGE]:  "Yönet",
}

// ── Default Role Definitions ──────────────────────
export interface RoleConfig {
  name:        string
  description: string
  isSystem:    boolean
  permissions: { resource: string; action: string }[]
}

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    name:        "Super Admin",
    description: "Tüm sisteme tam erişim — sadece kurucu",
    isSystem:    true,
    permissions: [
      // Wildcard — tüm kaynaklar, tüm işlemler
      { resource: RESOURCES.BLOG,      action: ACTIONS.MANAGE },
      { resource: RESOURCES.PAGES,     action: ACTIONS.MANAGE },
      { resource: RESOURCES.PORTFOLIO, action: ACTIONS.MANAGE },
      { resource: RESOURCES.SERVICES,  action: ACTIONS.MANAGE },
      { resource: RESOURCES.COLORS,    action: ACTIONS.MANAGE },
      { resource: RESOURCES.ROLES,     action: ACTIONS.MANAGE },
      { resource: RESOURCES.USERS,     action: ACTIONS.MANAGE },
      { resource: RESOURCES.SETTINGS,  action: ACTIONS.MANAGE },
      { resource: RESOURCES.AI,        action: ACTIONS.MANAGE },
      { resource: RESOURCES.MEDIA,     action: ACTIONS.MANAGE },
      { resource: RESOURCES.APPOINTMENTS, action: ACTIONS.MANAGE },
      { resource: RESOURCES.ANALYTICS, action: ACTIONS.MANAGE },
    ],
  },
  {
    name:        "Admin",
    description: "Kullanıcı ve rol yönetimi hariç tam erişim",
    isSystem:    true,
    permissions: [
      { resource: RESOURCES.BLOG,      action: ACTIONS.MANAGE },
      { resource: RESOURCES.PAGES,     action: ACTIONS.MANAGE },
      { resource: RESOURCES.PORTFOLIO, action: ACTIONS.MANAGE },
      { resource: RESOURCES.SERVICES,  action: ACTIONS.MANAGE },
      { resource: RESOURCES.COLORS,    action: ACTIONS.MANAGE },
      { resource: RESOURCES.AI,           action: ACTIONS.MANAGE },
      { resource: RESOURCES.MEDIA,        action: ACTIONS.MANAGE },
      { resource: RESOURCES.APPOINTMENTS, action: ACTIONS.MANAGE },
      { resource: RESOURCES.USERS,        action: ACTIONS.READ },
      { resource: RESOURCES.SETTINGS,     action: ACTIONS.READ },
      { resource: RESOURCES.ANALYTICS,    action: ACTIONS.READ },
    ],
  },
  {
    name:        "Editor",
    description: "Blog ve içerik oluşturma/düzenleme",
    isSystem:    false,
    permissions: [
      { resource: RESOURCES.BLOG,  action: ACTIONS.READ },
      { resource: RESOURCES.BLOG,  action: ACTIONS.CREATE },
      { resource: RESOURCES.BLOG,  action: ACTIONS.UPDATE },
      { resource: RESOURCES.AI,    action: ACTIONS.READ },
      { resource: RESOURCES.AI,    action: ACTIONS.CREATE },
      { resource: RESOURCES.MEDIA, action: ACTIONS.CREATE },
      { resource: RESOURCES.MEDIA, action: ACTIONS.READ },
    ],
  },
  {
    name:        "Graphic Designer",
    description: "Renk, tema ve görsel düzenleme",
    isSystem:    false,
    permissions: [
      { resource: RESOURCES.COLORS,    action: ACTIONS.READ },
      { resource: RESOURCES.COLORS,    action: ACTIONS.UPDATE },
      { resource: RESOURCES.PAGES,     action: ACTIONS.READ },
      { resource: RESOURCES.PAGES,     action: ACTIONS.UPDATE },
      { resource: RESOURCES.MEDIA,     action: ACTIONS.MANAGE },
      { resource: RESOURCES.BLOG,      action: ACTIONS.READ },
      { resource: RESOURCES.PORTFOLIO, action: ACTIONS.READ },
      { resource: RESOURCES.PORTFOLIO, action: ACTIONS.UPDATE },
      { resource: RESOURCES.SERVICES,  action: ACTIONS.READ },
      { resource: RESOURCES.SERVICES,  action: ACTIONS.UPDATE },
    ],
  },
  {
    name:        "Viewer",
    description: "Sadece görüntüleme yetkisi",
    isSystem:    false,
    permissions: [
      { resource: RESOURCES.BLOG,      action: ACTIONS.READ },
      { resource: RESOURCES.PAGES,     action: ACTIONS.READ },
      { resource: RESOURCES.PORTFOLIO, action: ACTIONS.READ },
    ],
  },
]

// ── Permission Check Helper (client-side) ─────────
export function hasPermission(
  userPermissions: { resource: string; action: string }[],
  resource: Resource,
  action: Action
): boolean {
  return userPermissions.some(
    (p) =>
      (p.resource === resource || p.resource === "*") &&
      (p.action === action || p.action === ACTIONS.MANAGE || p.action === "*")
  )
}
