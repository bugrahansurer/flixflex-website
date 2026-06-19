import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "@/lib/icons"
import { MaintenanceForm } from "@/components/admin/settings/maintenance-form"
import { getSetting } from "@/lib/settings"

export const metadata: Metadata = {
  title: "Bakım Modu",
}

export default async function BakimPage() {
  const initialData = {
    enabled: (await getSetting<boolean>("maintenance.enabled", false)) ?? false,
    title: (await getSetting<string>("maintenance.title", "")) ?? "",
    message: (await getSetting<string>("maintenance.message", "")) ?? "",
  }

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      <header className="mb-10">
        <Link
          href="/admin/ayarlar"
          className="inline-flex items-center gap-1 text-[12px] text-[#666666] hover:text-[#ff4fd8] transition-colors mb-2"
        >
          <ChevronLeft size={13} />
          Ayarlar&apos;a Geri Dön
        </Link>
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-[#333333] mb-3">
          Bakım <span className="text-[#FF4FD8]">Modu</span>
        </h1>
        <p className="text-[#666666] text-sm max-w-2xl leading-relaxed">
          Siteyi geçici olarak ziyaretçilere kapatın. Açıkken yalnızca giriş yapmış
          adminler siteyi görüntüleyebilir.
        </p>
      </header>

      <MaintenanceForm initialData={initialData} />
    </div>
  )
}
