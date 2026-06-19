// ═══════════════════════════════════════════════════════════
// FlixFlex — Admin notification helper
//
// Sends transactional notification e-mails to the site admins when
// configured events happen (new contact message, new appointment).
// Recipients + per-event on/off live in SiteSetting (notifications.*).
//
// Provider resolution mirrors lib/mail.ts (resend / smtp / mock) but
// is generic over subject + html so any event can reuse it.
// ═══════════════════════════════════════════════════════════

import nodemailer from "nodemailer"
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"

export type NotificationKind = "contact" | "appointment"

interface SendEmailResult {
  success: boolean
  error?: string
}

// ── Low-level generic sender ──────────────────────────────
async function sendEmail(to: string[], subject: string, html: string): Promise<SendEmailResult> {
  if (to.length === 0) return { success: false, error: "Alıcı yok" }

  const provider = (await getSetting<string>("mail.provider", "mock")) || "mock"
  const from = (await getSetting<string>("mail.from")) || "FlixFlex <onboarding@resend.dev>"

  try {
    if (provider === "smtp") {
      const host = (await getSetting<string>("mail.smtp.host", "")) || ""
      const port = parseInt((await getSetting<string>("mail.smtp.port", "587")) || "587") || 587
      const user = (await getSetting<string>("mail.smtp.user", "")) || ""
      const pass = decryptSecret(await getSetting<string>("mail.smtp.pass", "")) || ""
      const secure = ((await getSetting<string>("mail.smtp.secure", "false")) || "false") === "true"
      if (!host || !user || !pass) return { success: false, error: "SMTP yapılandırması eksik" }

      const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
      await transporter.sendMail({ from, to, subject, html })
      return { success: true }
    }

    if (provider === "resend") {
      const apiKey = decryptSecret(await getSetting<string>("mail.resend.key")) || process.env.RESEND_API_KEY
      if (!apiKey) return { success: false, error: "Resend API anahtarı yok" }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, html }),
      })
      if (res.ok) return { success: true }
      const json = await res.json().catch(() => ({}))
      return { success: false, error: json.message || `Resend hatası (${res.status})` }
    }

    return { success: false, error: "E-posta sağlayıcısı pasif (mock)" }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ── Resolve configured recipients ─────────────────────────
async function getRecipients(): Promise<string[]> {
  const raw = (await getSetting<string>("notifications.recipients", "")) || ""
  return raw
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s))
}

function rowsToHtml(title: string, rows: { label: string; value: string }[]): string {
  const items = rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0;color:#888;font-size:12px;font-weight:600">${r.label}</td><td style="padding:6px 0;color:#fff;font-size:13px;font-weight:700;text-align:right">${r.value}</td></tr>`
    )
    .join("")
  return `<!DOCTYPE html><html><body style="margin:0;background:#0A0A0A;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <div style="background:#121212;border:1px solid #222;border-top:4px solid #A134FF;padding:32px">
        <div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px">Flix<span style="color:#A134FF">Flex</span></div>
        <h1 style="font-size:17px;color:#fff;margin:16px 0 20px">${title}</h1>
        <table style="width:100%;border-collapse:collapse">${items}</table>
        <p style="margin-top:24px;font-size:10px;color:#444;letter-spacing:0.08em">© ${new Date().getFullYear()} FLIXFLEX — Yönetim bildirimi</p>
      </div>
    </div></body></html>`
}

// ── Public: notify admins of an event ─────────────────────
export async function notifyAdmins(
  kind: NotificationKind,
  payload: { title: string; rows: { label: string; value: string }[] }
): Promise<SendEmailResult> {
  try {
    const enabled = (await getSetting<boolean>(`notifications.${kind}.enabled`, false)) ?? false
    if (!enabled) return { success: false, error: "Bu bildirim türü kapalı" }

    const recipients = await getRecipients()
    if (recipients.length === 0) return { success: false, error: "Alıcı tanımlı değil" }

    const subjectPrefix = kind === "contact" ? "Yeni İletişim Mesajı" : "Yeni Randevu Talebi"
    return await sendEmail(recipients, `${subjectPrefix} — FlixFlex`, rowsToHtml(payload.title, payload.rows))
  } catch (err) {
    console.error("[notifyAdmins]", err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
