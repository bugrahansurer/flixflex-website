import NextTopLoader from "nextjs-toploader"
import { FlixFlexFooter, AppointmentModal, ParallaxProvider } from "@/components/public"
import { ThemedNavbar } from "@/components/public/navbar/themed-navbar"
import { PageTransition } from "@/components/shared/page-transition"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { MaintenanceScreen } from "@/components/shared/maintenance-screen"
import { prisma } from "@/lib/prisma"
import { getSetting } from "@/lib/settings"
import { auth } from "@/lib/auth"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settingsData = prisma 
    ? await prisma.siteSetting.findMany({
        where: {
          key: { in: ["site_logo", "site_logo_white", "site_logo_height", "site_logo_mobile_height"] }
        }
      })
    : []

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

