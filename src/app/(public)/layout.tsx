import NextTopLoader from "nextjs-toploader"
import { FlixFlexFooter } from "@/components/public/footer"
import { AppointmentModalLazy as AppointmentModal } from "@/components/public/appointment-modal-lazy"
import { ParallaxProvider } from "@/components/public/parallax-provider"
import { ThemedNavbar } from "@/components/public/navbar/themed-navbar"
import { PageTransition } from "@/components/shared/page-transition"
import { MaintenanceScreen } from "@/components/shared/maintenance-screen"
import { getSetting } from "@/lib/settings"
import { getPublicLayoutSettings } from "@/lib/public-layout-settings"
import { auth } from "@/lib/auth"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"
import { SitePixels } from "@/components/analytics/site-pixels"
import { CookieConsent } from "@/components/analytics/cookie-consent"
import { SiteJsonLd } from "@/components/seo/site-json-ld"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // DB hatasında boş ayarlarla açılır (500 vermez) — bkz. getPublicLayoutSettings
  const siteSettings = await getPublicLayoutSettings()

  // ── Maintenance mode gate ──────────────────────────────
  // When enabled, public visitors see a maintenance notice. Logged-in
  // admins bypass it so they can keep working on the site.
  const maintenanceEnabled = await getSetting<boolean>("maintenance.enabled", false)
  if (maintenanceEnabled) {
    const session = await auth()
    if (!session?.user) {
      const [mTitle, mMessage] = await Promise.all([
        getSetting<string>("maintenance.title", ""),
        getSetting<string>("maintenance.message", ""),
      ])
      return <MaintenanceScreen title={mTitle} message={mMessage} />
    }
  }

  return (
    <ParallaxProvider>
      {/* Yapılandırılmış veri: ajans, adres, iletişim, sosyal hesaplar */}
      <SiteJsonLd settings={siteSettings} />
      {/* First-party analytics + ad-platform pixels (only what's configured) */}
      <AnalyticsTracker />
      <SitePixels
        gaId={siteSettings["analytics.google.ga4"]}
        gtmId={siteSettings["analytics.google.gtm"]}
        pixelId={siteSettings["analytics.meta.pixel"]}
      />
      {/* Route progress bar — fills on navigation (Vercel/Linear style) */}
      <NextTopLoader
        color="#FF4FD8"
        height={2}
        showSpinner={false}
        shadow="0 0 12px #FF4FD8, 0 0 6px #FF4FD8"
        speed={300}
        easing="cubic-bezier(0.16, 1, 0.3, 1)"
        crawlSpeed={180}
      />
      <ThemedNavbar />
      <PageTransition>
        <main id="content" className="relative">
          {children}
        </main>
      </PageTransition>
      <FlixFlexFooter siteSettings={siteSettings} />
      <AppointmentModal />
      <CookieConsent />
    </ParallaxProvider>
  )
}

