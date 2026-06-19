// ═══════════════════════════════════════════════════════════
// ThemedNavbar — Server Component
//
// Reads the active theme and renders the correct header
// variant + optional mobile bottom navbar.
//
// • headerVariant "classic"   → FlixFlexNavbar
// • headerVariant "hamburger" → HamburgerNavbar
// • settings.mobileNavbar     → renders MobileNavbar (md:hidden)
//
// Falls back to FlixFlex Default at module-load if DB unavailable.
// ═══════════════════════════════════════════════════════════

import { getActiveTheme } from "@/lib/colors/palette-provider"
import { FlixFlexNavbar } from "./index"
import { HamburgerNavbar } from "./hamburger-navbar"
import { MobileNavbar } from "./mobile-navbar"
import prisma from "@/lib/prisma"

export async function ThemedNavbar() {
  const theme = await getActiveTheme()
  const HeaderComponent =
    theme.settings.headerVariant === "hamburger" ? HamburgerNavbar : FlixFlexNavbar

  const settingsData = prisma 
    ? await prisma.siteSetting.findMany({
        where: {
          key: { in: ["site_logo", "site_logo_white", "site_logo_transparent", "site_logo_height", "site_logo_mobile_height"] }
        }
      })
    : []

  const siteSettings = settingsData.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)

  return (
    <>
      <HeaderComponent siteSettings={siteSettings} />
      {theme.settings.mobileNavbar && (
        <MobileNavbar variant={theme.settings.mobileNavbarVariant} />
      )}
    </>
  )
}
