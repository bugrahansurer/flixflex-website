// ═══════════════════════════════════════════════════════════
// FlixFlex — Yönetim ve müşteri bildirimleri
//
// Yönetim: yeni iletişim mesajı / randevu talebi (Admin › Ayarlar ›
// Bildirimler'deki alıcılar, olay bazında açık/kapalı).
// Müşteri: talep alındı e-postası (e-posta sağlayıcısı açıksa her zaman).
// ═══════════════════════════════════════════════════════════

import { getSetting } from "@/lib/settings"
import { getNotificationRecipients, sendEmail, type SendEmailResult } from "@/lib/email/send"
import { adminNotificationEmail, type TemplateResult } from "@/lib/email/templates"
import type { EmailDetail } from "@/lib/email/layout"

export type NotificationKind = "contact" | "appointment"

export async function notifyAdmins(
  kind: NotificationKind,
  payload: {
    title: string
    rows: EmailDetail[]
    customerName: string
    /** Yanıtla → müşteriye gider */
    customerEmail: string
    dateLabel?: string
  }
): Promise<SendEmailResult> {
  try {
    const enabled = (await getSetting<boolean>(`notifications.${kind}.enabled`, false)) ?? false
    if (!enabled) return { success: false, error: "Bu bildirim türü kapalı" }

    const recipients = await getNotificationRecipients()
    if (recipients.length === 0) return { success: false, error: "Alıcı tanımlı değil" }

    const { subject, body } = await adminNotificationEmail({ kind, ...payload })
    return await sendEmail({ to: recipients, subject, body, replyTo: payload.customerEmail })
  } catch (err) {
    console.error("[notifyAdmins]", err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Müşteriye şablon e-postası gönderir; hata yalnızca loglanır */
export async function notifyCustomer(to: string, template: Promise<TemplateResult>): Promise<SendEmailResult> {
  try {
    const { subject, body } = await template
    const res = await sendEmail({ to, subject, body })
    if (!res.success) console.warn("[notifyCustomer]", res.error)
    return res
  } catch (err) {
    console.error("[notifyCustomer]", err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
