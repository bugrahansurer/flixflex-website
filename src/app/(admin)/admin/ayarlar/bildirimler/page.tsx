import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "@/lib/icons"
import { NotificationsForm } from "@/components/admin/settings/notifications-form"
import { getSetting } from "@/lib/settings"

export const metadata: Metadata = {
  title: "Bildirimler",
}

export default async function BildirimlerPage() {
  const initialData = {
    contactEnabled: (await getSetting<boolean>("notifications.contact.enabled", false)) ?? false,
    appointmentEnabled: (await getSetting<boolean>("notifications.appointment.enabled", false)) ?? false,
    recipients: (await getSetting<string>("notifications.recipients", "")) ?? "",
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
          <span className="text-[#FF4FD8]">Bildirim</span> Tercihleri
        </h1>
        <p className="text-[#666666] text-sm max-w-2xl leading-relaxed">
          Hangi olaylarda e-posta bildirimi alacağınızı ve bu bildirimlerin kimlere
          gönderileceğini belirleyin.
        </p>
      </header>

      <NotificationsForm initialData={initialData} />
    </div>
  )
}
