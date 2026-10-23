// ═══════════════════════════════════════════════════════════
// Site geneli yapılandırılmış veri (JSON-LD) — sunucuda render edilir
// Google'a FlixFlex'in bir reklam ajansı (ProfessionalService) olduğunu,
// adresini, iletişim bilgilerini, çalışma saatlerini ve sosyal hesaplarını
// bildirir; marka adıyla yapılan aramalarda bilgi kartı ve yerel arama
// sonuçları için temel sinyaldir. Tüm değerler admin site ayarlarından gelir.
// ═══════════════════════════════════════════════════════════

import { JsonLd, SITE_URL } from "./json-ld"
const BRAND = "FlixFlex"

/** "Kırklarsırtı Mh. Celal Bayar Cd. , Tarsus · Mersin" → sokak / ilçe / il */
function parseAddress(raw: string) {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean)
  const last = parts.length > 1 ? parts.pop()! : ""
  const [locality, region] = last.split(/[·/-]/).map((p) => p.trim())
  return {
    "@type": "PostalAddress",
    streetAddress: parts.join(", ") || raw,
    ...(locality ? { addressLocality: locality } : {}),
    ...(region ? { addressRegion: region } : {}),
    addressCountry: "TR",
  }
}

/** "Pzt - Cum: 09:00 - 18:00" → OpeningHoursSpecification (yalnızca bu kalıp) */
function parseHours(raw: string) {
  const time = raw.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
  if (!time) return undefined
  const weekdays = /pzt\s*-\s*cum/i.test(raw)
  const days = weekdays
    ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    : /pzt\s*-\s*cmt/i.test(raw)
      ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      : null
  if (!days) return undefined
  return [{ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: time[1], closes: time[2] }]
}

function parseSocial(raw?: string): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as { url?: string }[]
    return Array.isArray(arr) ? arr.map((s) => s.url).filter((u): u is string => !!u && /^https?:\/\//.test(u)) : []
  } catch {
    return []
  }
}

export function SiteJsonLd({ settings }: { settings: Record<string, string> }) {
  const logo = settings.site_logo || `${SITE_URL}/logo/flixflex-logo-green.webp`
  const sameAs = parseSocial(settings.site_social_links)
  const hours = settings.site_working_hours ? parseHours(settings.site_working_hours) : undefined

  const organization = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    alternateName: ["Flixflex", "FlixFlex Reklam Ajansı", "FlixFlex Dijital Pazarlama Ajansı"],
    description:
      settings.site_tagline ||
      "Tarsus, Mersin merkezli yeni nesil reklam ve dijital pazarlama ajansı.",
    url: SITE_URL,
    logo,
    image: logo,
    ...(settings.site_email ? { email: settings.site_email } : {}),
    ...(settings.site_phone ? { telephone: settings.site_phone.replace(/\s+/g, " ") } : {}),
    ...(settings.site_address ? { address: parseAddress(settings.site_address) } : {}),
    ...(hours ? { openingHoursSpecification: hours } : {}),
    areaServed: [
      { "@type": "City", name: "Tarsus" },
      { "@type": "AdministrativeArea", name: "Mersin" },
      { "@type": "Country", name: "Türkiye" },
    ],
    knowsAbout: [
      "Dijital pazarlama",
      "Performans pazarlaması",
      "Google Ads yönetimi",
      "Meta reklamları",
      "TikTok reklamları",
      "Sosyal medya yönetimi",
      "Marka kimliği",
      "Web sitesi tasarımı",
      "E-ticaret",
      "SEO",
    ],
    ...(sameAs.length ? { sameAs } : {}),
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND,
    inLanguage: "tr-TR",
    publisher: { "@id": `${SITE_URL}/#organization` },
  }

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
    </>
  )
}
