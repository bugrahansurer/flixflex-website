// ═══════════════════════════════════════════════════════════
// FlixFlex — E-posta gönderimi (Resend / SMTP / mock)
// Sağlayıcı ve gönderen adresi Admin › Ayarlar › E-posta'dan gelir.
// ═══════════════════════════════════════════════════════════

import nodemailer from "nodemailer"
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"
import type { RenderedEmail } from "./layout"

export interface SendEmailInput {
  to: string | string[]
  subject: string
  body: RenderedEmail
  /** Verilmezse ayarlardaki yanıt adresi (yoksa ilk bildirim alıcısı) */
  replyTo?: string | string[]
}

export interface SendEmailResult {
  success: boolean
  error?: string
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Bildirim alıcıları (Admin › Ayarlar › Bildirimler) */
export async function getNotificationRecipients(): Promise<string[]> {
  const raw = (await getSetting<string>("notifications.recipients", "")) || ""
  return raw
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter((s) => EMAIL_RE.test(s))
}

/** Müşteri e-postalarına verilen yanıtların gideceği adres */
export async function getDefaultReplyTo(): Promise<string | undefined> {
  const configured = ((await getSetting<string>("mail.replyTo", "")) || "").trim()
  if (EMAIL_RE.test(configured)) return configured
  return (await getNotificationRecipients())[0]
}

export async function sendEmail({ to, subject, body, replyTo }: SendEmailInput): Promise<SendEmailResult> {
  const recipients = (Array.isArray(to) ? to : [to]).filter((a) => EMAIL_RE.test(a))
  if (recipients.length === 0) return { success: false, error: "Geçerli alıcı yok." }

  const provider = (await getSetting<string>("mail.provider", "mock")) || "mock"
  const from = (await getSetting<string>("mail.from")) || "FlixFlex <onboarding@resend.dev>"
  const reply = replyTo ?? (await getDefaultReplyTo())
  const replyList = (Array.isArray(reply) ? reply : reply ? [reply] : []).filter((a) => EMAIL_RE.test(a))

  try {
    if (provider === "resend") {
      const apiKey = decryptSecret(await getSetting<string>("mail.resend.key")) || process.env.RESEND_API_KEY
      if (!apiKey) return { success: false, error: "Resend API anahtarı yapılandırılmamış." }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: recipients,
          subject,
          html: body.html,
          text: body.text,
          ...(replyList.length ? { reply_to: replyList } : {}),
        }),
      })
      if (res.ok) return { success: true }
      const json = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: json.message || `Resend API hatası (Kod: ${res.status})` }
    }

    if (provider === "smtp") {
      const host = (await getSetting<string>("mail.smtp.host", "")) || ""
      const port = parseInt((await getSetting<string>("mail.smtp.port", "587")) || "587") || 587
      const user = (await getSetting<string>("mail.smtp.user", "")) || ""
      const pass = decryptSecret(await getSetting<string>("mail.smtp.pass", "")) || ""
      const secure = ((await getSetting<string>("mail.smtp.secure", "false")) || "false") === "true"
      if (!host || !user || !pass) {
        return { success: false, error: "E-posta sunucusu (SMTP) yapılandırması eksik (Host, Kullanıcı veya Şifre boş)." }
      }
      const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
      await transporter.sendMail({
        from,
        to: recipients,
        subject,
        html: body.html,
        text: body.text,
        ...(replyList.length ? { replyTo: replyList } : {}),
      })
      return { success: true }
    }

    return {
      success: false,
      error: "E-posta entegrasyonu pasif (Mock Modu). E-posta gönderilmedi.",
    }
  } catch (err) {
    console.error("[sendEmail] failed:", err)
    return { success: false, error: `E-posta gönderiminde teknik hata: ${err instanceof Error ? err.message : String(err)}` }
  }
}
