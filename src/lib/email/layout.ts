// ═══════════════════════════════════════════════════════════
// FlixFlex — E-posta iskeleti
// Tablo tabanlı, satır içi stilli HTML: Gmail/Outlook/Apple Mail'de aynı
// görünür (<style> bloğu ve flex kullanılmaz). Tüm metinler burada HTML'den
// arındırılır — çağıran taraf düz metin verir.
// ═══════════════════════════════════════════════════════════

import { getPublicLayoutSettings } from "@/lib/public-layout-settings"

/** E-postadaki linkler ve görseller her zaman canlı siteye gider */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://flixflex.com.tr").replace(/\/$/, "")
const LOGO_URL = "https://flixflex.com.tr/email/flixflex-logo.png"

const C = {
  bg: "#0A0A0A",
  card: "#141414",
  line: "#262626",
  text: "#FFFFFF",
  muted: "#A3A3A3",
  faint: "#6B6B6B",
  accent: "#FF4FD8",
  onAccent: "#0A0A0A",
}
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Randevu tarihi Türkiye saatiyle — sunucu UTC'de çalışır */
export function formatTrDate(date: Date): string {
  return date.toLocaleString("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  })
}

export interface EmailDetail {
  label: string
  value: string
}

export interface EmailContent {
  /** Gelen kutusunda konunun yanında görünen kısa özet */
  preheader: string
  eyebrow: string
  title: string
  /** "Merhaba <ad>," satırı */
  greetingName?: string
  paragraphs: string[]
  details?: EmailDetail[]
  cta?: { label: string; href: string }
  secondaryLink?: { label: string; href: string }
  /** Kartın altında küçük not */
  note?: string
  audience: "customer" | "admin"
}

export interface RenderedEmail {
  html: string
  text: string
}

const safeHref = (href: string) => (/^https?:\/\//i.test(href) ? escapeHtml(href) : "#")

export async function renderEmail(content: EmailContent): Promise<RenderedEmail> {
  const s = await getPublicLayoutSettings()
  const siteName = s.site_name && s.site_name.toLowerCase() !== "flixflex" ? s.site_name : "FlixFlex"
  const phone = s.site_phone || ""
  const address = s.site_address || ""

  const p = (t: string) =>
    `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.muted}">${escapeHtml(t)}</p>`

  const greeting = content.greetingName
    ? `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.text}">Merhaba ${escapeHtml(content.greetingName)},</p>`
    : ""

  const details = content.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;border:1px solid ${C.line};border-radius:10px;background:${C.bg}">
        ${content.details
          .map(
            (d, i) => `<tr>
              <td style="padding:12px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${C.faint};vertical-align:top;width:38%">${escapeHtml(d.label)}</td>
              <td style="padding:12px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:14px;font-weight:600;color:${C.text};vertical-align:top;white-space:pre-wrap;word-break:break-word">${escapeHtml(d.value)}</td>
            </tr>`
          )
          .join("")}
      </table>`
    : ""

  const cta = content.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px">
        <tr><td bgcolor="${C.accent}" style="border-radius:999px">
          <a href="${safeHref(content.cta.href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:14px;font-weight:700;color:${C.onAccent};text-decoration:none;border-radius:999px">${escapeHtml(content.cta.label)}</a>
        </td></tr>
      </table>`
    : ""

  const secondary = content.secondaryLink
    ? `<p style="margin:12px 0 0;font-family:${FONT};font-size:13px"><a href="${safeHref(content.secondaryLink.href)}" target="_blank" style="color:${C.accent};text-decoration:underline">${escapeHtml(content.secondaryLink.label)}</a></p>`
    : ""

  const note = content.note
    ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C.line};font-family:${FONT};font-size:13px;line-height:1.6;color:${C.faint}">${escapeHtml(content.note)}</p>`
    : ""

  const footerReason =
    content.audience === "customer"
      ? `Bu e-postayı ${escapeHtml(siteName)} web sitesinden yaptığınız talep nedeniyle aldınız. Sorularınız için bu e-postayı yanıtlayabilirsiniz.`
      : "Yönetim bildirimi · Bildirim ayarları: Admin › Ayarlar › Bildirimler"

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${escapeHtml(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg}">
  <tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
      <tr><td style="padding:0 4px 20px">
        <a href="${SITE_URL}" target="_blank" style="text-decoration:none">
          <img src="${LOGO_URL}" width="40" height="40" alt="${escapeHtml(siteName)}" style="display:inline-block;vertical-align:middle;border:0">
          <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:${FONT};font-size:20px;font-weight:800;letter-spacing:-0.02em;color:${C.text}">Flix<span style="color:${C.accent}">Flex</span></span>
        </a>
      </td></tr>
      <tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:32px 28px">
        <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.accent}">${escapeHtml(content.eyebrow)}</p>
        <h1 style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-0.02em;color:${C.text}">${escapeHtml(content.title)}</h1>
        ${greeting}
        ${content.paragraphs.map(p).join("")}
        ${details}
        ${cta}
        ${secondary}
        ${note}
      </td></tr>
      <tr><td style="padding:24px 8px 0;font-family:${FONT};font-size:12px;line-height:1.7;color:${C.faint}">
        <strong style="color:${C.muted}">${escapeHtml(siteName)}</strong>${address ? ` · ${escapeHtml(address)}` : ""}<br>
        ${phone ? `${escapeHtml(phone)} · ` : ""}<a href="${SITE_URL}" target="_blank" style="color:${C.muted};text-decoration:underline">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</a><br>
        ${footerReason}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  // Düz metin sürümü: spam filtreleri ve metin tabanlı istemciler için
  const text = [
    content.title,
    "",
    content.greetingName ? `Merhaba ${content.greetingName},` : "",
    ...content.paragraphs,
    "",
    ...(content.details ?? []).map((d) => `${d.label}: ${d.value}`),
    content.cta ? `\n${content.cta.label}: ${content.cta.href}` : "",
    content.secondaryLink ? `${content.secondaryLink.label}: ${content.secondaryLink.href}` : "",
    content.note ? `\n${content.note}` : "",
    "",
    `— ${siteName}${phone ? ` · ${phone}` : ""} · ${SITE_URL}`,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n")
    .trim()

  return { html, text }
}
