import type { Metadata } from "next"
import { ArrowLeft } from "@/lib/icons"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { EmailSettingsForm } from "./email-settings-form"

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
    ]

    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { in: keys },
      },
    })

    const map: Record<string, string> = {}
    settings.forEach((s) => {
      map[s.key] = s.value
    })
    return map
  } catch (err) {
    console.error("[getEmailSettings] Prisma query failed:", err)
    return {}
  }
}

async function saveEmailSettings(formData: FormData) {
  "use server"

  if (!prisma) return

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
    ]

    for (const key of keys) {
      const value = formData.get(key)
      if (typeof value === "string") {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "string" },
        })
      }
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
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] mb-2">
            E-posta <span className="text-[#ff4fd8]">Entegrasyonu</span>
          </h1>
          <p className="text-[#666666] text-sm max-w-xl">
            Sistem randevu onay bildirimlerini ve otomatik Google Meet toplantı davetlerini buradaki e-posta kanalı üzerinden iletir.
          </p>
        </div>
        <Link href="/admin/ayarlar" className="ff-btn bg-[#FF4FD8] text-white hover:bg-[#e041c0] text-[12px] h-10 px-4">
          <ArrowLeft size={14} className="mr-2" />
          Geri Dön
        </Link>
      </header>

      <EmailSettingsForm initialSettings={settings} saveAction={saveEmailSettings} />
    </div>
  )
}
