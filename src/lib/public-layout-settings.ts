import { prisma } from "@/lib/prisma"

const PUBLIC_LAYOUT_SETTING_KEYS = [
  "site_logo", "site_logo_white", "site_logo_height", "site_logo_mobile_height",
  "site_name", "site_tagline", "site_email", "site_phone", "site_address",
  "site_social_links", "site_working_hours",
  "analytics.google.ga4", "analytics.google.gtm", "analytics.meta.pixel",
]

/**
 * Site layout'unun (menü, alt bilgi, pikseller) kullandığı ayarlar.
 * Veritabanı hatasında boş döner; site varsayılanlarla açılır, 500 vermez.
 */
export async function getPublicLayoutSettings(): Promise<Record<string, string>> {
  if (!prisma) return {}
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: PUBLIC_LAYOUT_SETTING_KEYS } },
    })
    return rows.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)
  } catch (err) {
    console.error("[PublicLayout] site settings load failed, using defaults:", err)
    return {}
  }
}
