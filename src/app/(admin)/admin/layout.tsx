import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { AdminLayoutShell } from "@/components/admin/layout/admin-layout-shell"
import type { SessionUser } from "@/lib/auth/types"
import { prisma } from "@/lib/prisma"

// Server-rendered gate. The middleware (src/middleware.ts) already
// redirects unauthenticated /admin/* requests to /giris — this
// in-layout check is a defence-in-depth fallback for any request
// that slips past the matcher (e.g. RSC payload prefetch).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/giris")
  }

  // The session.user shape is augmented in @/lib/auth to include
  // roleName/permissions/initials — cast through unknown because
  // the local SessionUser type pre-dates NextAuth integration.
  const user = session.user as unknown as SessionUser

  // Fetch site settings for logos (Safe Access)
  let settingsData: any[] = []
  if (prisma) {
    try {
      settingsData = await prisma.siteSetting.findMany({
        where: {
          key: { in: ["site_logo", "site_logo_white", "site_logo_height", "site_logo_mobile_height"] }
        }
      })
    } catch (err) {
      console.error("[AdminLayout] Prisma query failed:", err)
    }
  }
  
  const settings = settingsData.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)

  return (
    <AdminLayoutShell 
      user={user} 
      siteLogo={settings.site_logo_white || settings.site_logo}
      logoHeight={settings.site_logo_height ? parseInt(settings.site_logo_height) : 32}
    >
      {children}
    </AdminLayoutShell>
  )
}
