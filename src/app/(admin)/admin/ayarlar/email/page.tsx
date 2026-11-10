import type { Metadata } from "next"
import { ArrowLeft } from "@/lib/icons"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { EmailSettingsForm } from "./email-settings-form"
import { requirePermission } from "@/lib/ai/api-utils"
import { encryptSecret, isEncrypted } from "@/lib/crypto"

/** Şifreli saklanan, tarayıcıya hiç gönderilmeyen ayarlar */
const SECRET_KEYS = ["mail.resend.key", "mail.smtp.pass"]

/** Resend bu alan adlarından gönderemez (alan adı sahibi doğrulanamaz) */
const FREE_MAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "hotmail.com", "outlook.com", "live.com",
  "yahoo.com", "icloud.com", "me.com", "yandex.com", "yandex.com.tr", "msn.com",
])

export const metadata: Metadata = {
  title: "E-posta Ayarları | FlixFlex Admin",
}

async function getEmailSettings() {
  if (!prisma) return {}
  try {
    const keys = [
      "mail.provider",
      "mail.from",
      "mail.resend.key",
      "mail.smtp.host",
      "mail.smtp.port",
      "mail.smtp.user",
      "mail.smtp.pass",
      "mail.smtp.secure",
      "mail.replyTo",
      "appointments.meetingUrl",
    ]

    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { in: keys },
      },
    })

    // Gizli değerler tarayıcıya gönderilmez; form yalnızca kayıtlı olup
    // olmadığını bilir.
    const map: Record<string, string> = {}
    settings.forEach((s) => {
      if (SECRET_KEYS.includes(s.key)) {
        if (s.value) map[`${s.key}.stored`] = "1"
      } else {
        map[s.key] = s.value
      }
    })
    return map
  } catch (err) {
    console.error("[getEmailSettings] Prisma query failed:", err)
    return {}
  }
}

async function saveEmailSettings(formData: FormData): Promise<{ error?: string } | void> {
  "use server"

  // Server action doğrudan POST ile çağrılabilir — sayfanın görünmesi yetmez,
  // ayarları değiştirme yetkisi burada ayrıca doğrulanır.
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return { error: "Bu ayarları değiştirme yetkiniz yok." }
  if (!prisma) return

  // ── Doğrulama ──
  const field = (k: string) => {
    const v = formData.get(k)
    return typeof v === "string" ? v.trim() : ""
  }
  const provider = field("mail.provider")
  const fromDomain = (field("mail.from").match(/@([^>\s]+)/)?.[1] ?? "").toLowerCase()
  if (provider === "resend" && FREE_MAIL_DOMAINS.has(fromDomain)) {
    return {
      error: `Resend ${fromDomain} adresinden gönderemez. Gönderen adresi doğrulanmış alan adından olmalı, örn: FlixFlex <bildirim@flixflex.com.tr>`,
    }
  }
  const replyTo = field("mail.replyTo")
  if (replyTo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(replyTo)) {
    return { error: "Yanıt adresi geçerli bir e-posta olmalı." }
  }
  const meetingUrl = field("appointments.meetingUrl")
  if (meetingUrl && !/^https:\/\/\S+$/i.test(meetingUrl)) {
    return { error: "Görüşme linki https:// ile başlayan bir adres olmalı." }
  }

  try {
    const plainKeys = [
      "mail.provider",
      "mail.from",
      "mail.smtp.host",
      "mail.smtp.port",
      "mail.smtp.user",
      "mail.smtp.secure",
      "mail.replyTo",
      "appointments.meetingUrl",
    ]

    for (const key of plainKeys) {
      const value = formData.get(key)
      if (typeof value === "string") {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "string" },
        })
      }
    }

    // Gizli değerler şifreli saklanır. Alan boş gelirse kayıtlı değer korunur
    // (form kayıtlı anahtarı hiç görmez); eski şifresiz kayıt bu sırada şifrelenir.
    for (const key of SECRET_KEYS) {
      const submitted = formData.get(key)
      const incoming = typeof submitted === "string" ? submitted.trim() : ""
      const stored = (await prisma.siteSetting.findUnique({ where: { key } }))?.value ?? ""
      // Boş alan + zaten şifreli kayıt: hiç dokunma (başka ortamın anahtarıyla
      // şifrelenmişse burada çözülemez; çözmeye çalışmak kaydı silerdi).
      if (!incoming && (!stored || isEncrypted(stored))) continue
      const value = encryptSecret(incoming || stored)
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: "string" },
      })
    }

    revalidatePath("/admin/ayarlar/email")
    revalidatePath("/admin/ayarlar")
  } catch (err) {
    console.error("[saveEmailSettings] Prisma upsert failed:", err)
    throw new Error("E-posta ayarları kaydedilemedi.")
  }
}

export default async function EmailSettingsPage() {
  const settings = await getEmailSettings()

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      {/* ── Breadcrumbs ────────────────────────── */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-semibold text-[#666666]">
        <Link href="/admin/ayarlar" className="hover:text-[#FF4FD8] transition-colors">
          Ayarlar
        </Link>
        <span>/</span>
        <span className="text-[#666666]">E-posta Ayarları</span>
      </nav>

      {/* ── Header ────────────────────────────── */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] mb-2">
            E-posta <span className="text-[#ff4fd8]">Entegrasyonu</span>
          </h1>
          <p className="text-[#666666] text-sm max-w-xl">
            Sistem randevu onay bildirimlerini ve otomatik Google Meet toplantı davetlerini buradaki e-posta kanalı üzerinden iletir.
          </p>
        </div>
        <Link href="/admin/ayarlar" className="ff-btn self-start text-[#FF4FD8] text-[12px] hover:text-[#dc2db6] transition-all duration-300 h-10 px-4">
          <ArrowLeft size={14} className="-mr-1" />
          Geri Dön
        </Link>
      </header>

      <EmailSettingsForm initialSettings={settings} saveAction={saveEmailSettings} />
    </div>
  )
}
