// ═══════════════════════════════════════════════════════════
// FlixFlex — Canlı önizleme layout'u (yalnızca düzenleyicideki iframe)
// Site layout'unun aynısı; analitik, piksel, çerez bandı ve ilerleme çubuğu
// yoktur — admin önizlemeleri ziyaret olarak sayılmaz.
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import { FlixFlexFooter } from "@/components/public/footer"
import { AppointmentModalLazy as AppointmentModal } from "@/components/public/appointment-modal-lazy"
import { ParallaxProvider } from "@/components/public/parallax-provider"
import { ThemedNavbar } from "@/components/public/navbar/themed-navbar"
import { PreviewBridge } from "@/components/admin/page-builder/preview-bridge"
import { getPublicLayoutSettings } from "@/lib/public-layout-settings"

export const metadata: Metadata = {
  title: "Önizleme",
  robots: { index: false, follow: false },
}

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await getPublicLayoutSettings()

  return (
    <PreviewBridge>
      <ParallaxProvider>
        <ThemedNavbar />
        <main id="content" className="relative">
          {children}
        </main>
        <FlixFlexFooter siteSettings={siteSettings} />
        <AppointmentModal />
      </ParallaxProvider>
    </PreviewBridge>
  )
}
