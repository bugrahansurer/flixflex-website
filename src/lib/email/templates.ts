// ═══════════════════════════════════════════════════════════
// FlixFlex — E-posta şablonları
// Müşteriye: randevu alındı / onaylandı / iptal, iletişim mesajı alındı
// Yönetime: yeni randevu / yeni mesaj bildirimi · Ayarlar: bağlantı testi
// ═══════════════════════════════════════════════════════════

import { formatTrDate, renderEmail, SITE_URL, type EmailDetail, type RenderedEmail } from "./layout"

export interface TemplateResult {
  subject: string
  body: RenderedEmail
}

const MEETING_MINUTES = 30

interface AppointmentInfo {
  name: string
  subject: string
  date: Date
}

/** Google Takvim'e "etkinlik ekle" linki (hesap bağlantısı gerektirmez) */
function googleCalendarLink(a: AppointmentInfo, meetLink: string | null): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const end = new Date(a.date.getTime() + MEETING_MINUTES * 60_000)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `FlixFlex ön görüşme — ${a.subject}`,
    dates: `${fmt(a.date)}/${fmt(end)}`,
    details: meetLink ? `Görüşme bağlantısı: ${meetLink}` : "Görüşme bağlantısı ayrıca iletilecek.",
    ...(meetLink ? { location: meetLink } : {}),
    ctz: "Europe/Istanbul",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const appointmentDetails = (a: AppointmentInfo): EmailDetail[] => [
  { label: "Görüşme konusu", value: a.subject },
  { label: "Tarih ve saat", value: `${formatTrDate(a.date)} (TSİ)` },
  { label: "Süre", value: `${MEETING_MINUTES} dakika · Online` },
]

// ── Müşteriye ────────────────────────────────────────────

export async function appointmentReceivedEmail(a: AppointmentInfo): Promise<TemplateResult> {
  const when = formatTrDate(a.date)
  return {
    subject: `Randevu talebiniz alındı — ${when}`,
    body: await renderEmail({
      audience: "customer",
      preheader: `${when} için ön görüşme talebinizi aldık; onaylandığında haber vereceğiz.`,
      eyebrow: "Talep alındı",
      title: "Randevu talebinizi aldık",
      greetingName: a.name,
      paragraphs: [
        "FlixFlex ile ön görüşme talebiniz bize ulaştı. Ekibimiz uygunluğu kontrol edip talebinizi onaylayacak.",
        "Onaylandığında görüşme bağlantısını içeren ayrı bir e-posta alacaksınız.",
      ],
      details: appointmentDetails(a),
      note: "Bu saat size artık uymuyorsa bu e-postayı yanıtlayarak bize bildirebilirsiniz.",
    }),
  }
}

export async function appointmentApprovedEmail(
  a: AppointmentInfo & { meetLink: string | null }
): Promise<TemplateResult> {
  const when = formatTrDate(a.date)
  return {
    subject: `Randevunuz onaylandı — ${when}`,
    body: await renderEmail({
      audience: "customer",
      preheader: `${when} ön görüşmeniz onaylandı.`,
      eyebrow: "Randevu onaylandı",
      title: "Görüşmemiz onaylandı",
      greetingName: a.name,
      paragraphs: [
        a.meetLink
          ? "Ön görüşme randevunuz onaylandı. Görüşme Google Meet üzerinden yapılacak; saatinde aşağıdaki butonla katılabilirsiniz."
          : "Ön görüşme randevunuz onaylandı. Görüşme bağlantısını görüşmeden önce ayrıca ileteceğiz.",
      ],
      details: appointmentDetails(a),
      cta: a.meetLink ? { label: "Görüşmeye katıl", href: a.meetLink } : undefined,
      secondaryLink: { label: "Google Takvim'e ekle", href: googleCalendarLink(a, a.meetLink) },
      note: "Saati değiştirmeniz gerekirse bu e-postayı yanıtlayarak bize yazabilirsiniz.",
    }),
  }
}

export async function appointmentCancelledEmail(a: AppointmentInfo): Promise<TemplateResult> {
  const when = formatTrDate(a.date)
  return {
    subject: `Randevunuz iptal edildi — ${when}`,
    body: await renderEmail({
      audience: "customer",
      preheader: `${when} tarihli ön görüşme randevunuz iptal edildi.`,
      eyebrow: "Randevu iptal edildi",
      title: "Randevunuz iptal edildi",
      greetingName: a.name,
      paragraphs: [
        "Aşağıdaki ön görüşme randevunuz iptal edildi. Size uygun başka bir saat için web sitemizden yeniden randevu alabilirsiniz.",
      ],
      details: appointmentDetails(a),
      cta: { label: "Yeni randevu al", href: `${SITE_URL}/iletisim` },
      note: "Bir hata olduğunu düşünüyorsanız bu e-postayı yanıtlayarak bize ulaşabilirsiniz.",
    }),
  }
}

export async function contactReceivedEmail(c: { name: string; service?: string }): Promise<TemplateResult> {
  return {
    subject: "Mesajınızı aldık — FlixFlex",
    body: await renderEmail({
      audience: "customer",
      preheader: "Mesajınız bize ulaştı; en kısa sürede dönüş yapacağız.",
      eyebrow: "Mesaj alındı",
      title: "Mesajınız bize ulaştı",
      greetingName: c.name,
      paragraphs: [
        "FlixFlex'e yazdığınız için teşekkürler. Mesajınızı inceleyip en geç 1 iş günü içinde size dönüş yapacağız.",
        "Eklemek istediğiniz bir şey olursa bu e-postayı yanıtlamanız yeterli.",
      ],
      details: c.service ? [{ label: "İlgilendiğiniz hizmet", value: c.service }] : undefined,
      cta: { label: "Çalışmalarımıza göz atın", href: `${SITE_URL}/portfolio` },
    }),
  }
}

// ── Yönetime ─────────────────────────────────────────────

export async function adminNotificationEmail(n: {
  kind: "appointment" | "contact"
  title: string
  rows: EmailDetail[]
  customerName: string
  dateLabel?: string
}): Promise<TemplateResult> {
  const subject =
    n.kind === "appointment"
      ? `Yeni randevu talebi: ${n.customerName}${n.dateLabel ? ` — ${n.dateLabel}` : ""}`
      : `Yeni iletişim mesajı: ${n.customerName}`
  return {
    subject,
    body: await renderEmail({
      audience: "admin",
      preheader: subject,
      eyebrow: n.kind === "appointment" ? "Yeni randevu talebi" : "Yeni iletişim mesajı",
      title: n.title,
      paragraphs: [
        n.kind === "appointment"
          ? "Randevu onay bekliyor. Onayladığında müşteriye görüşme bilgileri otomatik gönderilir."
          : "Bu e-postayı yanıtladığında yanıtın doğrudan müşteriye gider.",
      ],
      details: n.rows,
      cta: {
        label: n.kind === "appointment" ? "Randevuları aç" : "Mesajları aç",
        href: `${SITE_URL}/admin/${n.kind === "appointment" ? "randevular" : "mesajlar"}`,
      },
    }),
  }
}

export async function connectionTestEmail(): Promise<TemplateResult> {
  return {
    subject: "FlixFlex E-posta Entegrasyon Testi",
    body: await renderEmail({
      audience: "admin",
      preheader: "E-posta ayarlarınız çalışıyor.",
      eyebrow: "Bağlantı testi",
      title: "Bağlantı başarılı",
      paragraphs: [
        "FlixFlex e-posta ayarlarınız çalışıyor. Randevu onayları, müşteri bilgilendirmeleri ve yönetim bildirimleri bu kanaldan gönderilecek.",
      ],
    }),
  }
}
