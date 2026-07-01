import NextTopLoader from "nextjs-toploader"
import { FlixFlexFooter, AppointmentModal, ParallaxProvider } from "@/components/public"
import { ThemedNavbar } from "@/components/public/navbar/themed-navbar"
import { PageTransition } from "@/components/shared/page-transition"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { MaintenanceScreen } from "@/components/shared/maintenance-screen"
import { prisma } from "@/lib/prisma"
import { getSetting } from "@/lib/settings"
import { auth } from "@/lib/auth"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"
import { SitePixels } from "@/components/analytics/site-pixels"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resilience: never let a DB hiccup (e.g. a paused free-tier database)
  // crash the entire public site. On error we fall back to empty settings —
  // the site renders with sane defaults instead of a 500.
  let settingsData: { key: string; value: string }[] = []
  if (prisma) {
    try {
      settingsData = await prisma.siteSetting.findMany({
        where: {
          key: { in: [
            "site_logo", "site_logo_white", "site_logo_height", "site_logo_mobile_height",
            "site_name", "site_tagline", "site_email", "site_phone", "site_address",
            "site_social_links",
            "analytics.google.ga4", "analytics.google.gtm", "analytics.meta.pixel",
          ] }
        }
      })
    } catch (err) {
      console.error("[PublicLayout] site settings load failed, using defaults:", err)
    }
  }

  const siteSettings = settingsData.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)

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
      <LoadingScreen
        logoUrl={siteSettings.site_logo_white || siteSettings.site_logo}
        logoHeight={siteSettings.site_logo_height ? parseInt(siteSettings.site_logo_height) : undefined}
      />
      <ThemedNavbar />
      <PageTransition>
        <main id="content" className="relative">
          {children}
        </main>
      </PageTransition>
      <FlixFlexFooter siteSettings={siteSettings} />
      <AppointmentModal />
    </ParallaxProvider>
  )
}

