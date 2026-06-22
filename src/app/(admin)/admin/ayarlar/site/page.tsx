import type { Metadata } from "next"
import { ArrowLeft } from "@/lib/icons"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { SiteSettingsForm } from "./site-settings-form"

export const metadata: Metadata = {
  title: "Site Ayarları | FlixFlex Admin",
}

async function getSettings() {
  if (!prisma) return {}
  try {
    const settings = await prisma.siteSetting.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s: { key: string; value: string }) => {
      map[s.key] = s.value
    })
    return map
  } catch (err) {
    console.error("[getSettings] Prisma query failed:", err)
    return {}
  }
}

async function saveSettings(formData: FormData) {
  "use server"

  if (!prisma) return

  const entries = Array.from(formData.entries())

  // Keys whose values are JSON-encoded (parsed back on read via getSetting).
  const jsonKeys = new Set(["site_social_links"])

  try {
    for (const [key, value] of entries) {
      if (typeof value === "string") {
        const type = jsonKeys.has(key) ? "json" : "string"
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value, type },
          create: { key, value, type },
        })
      }
    }
    revalidatePath("/admin/ayarlar/site")
    revalidatePath("/", "layout")
  } catch (err) {
    console.error("[saveSettings] Prisma upsert failed:", err)
  }
}

export default async function SiteAyarlariPage() {
  const settings = await getSettings()

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      {/* ── Breadcrumbs ────────────────────────── */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-semibold text-[#666666]">
        <Link href="/admin/ayarlar" className="hover:text-[#FF4FD8] transition-colors">
          Ayarlar
        </Link>
        <span>/</span>
        <span className="text-[#666666]">Site Ayarları</span>
      </nav>

      {/* ── Header ────────────────────────────── */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] mb-2">
            Site <span className="text-[#ff4fd8]">Kimliği</span>
          </h1>
          <p className="text-[#666666] text-sm max-w-xl">
            Markanızın dijital dünyadaki görünümünü buradan yönetin. Logo, başlık ve SEO ayarları tüm siteyi etkiler.
          </p>
        </div>
        <Link href="/admin/ayarlar" className="ff-btn self-start text-[#FF4FD8] text-[12px] hover:text-[#e041c0] transition-all duration-300 h-10 px-4">
          <ArrowLeft size={14} className="-mr-1" />
          Geri Dön
        </Link>
      </header>

      <SiteSettingsForm initialSettings={settings} saveAction={saveSettings} />
    </div>
  )
}
