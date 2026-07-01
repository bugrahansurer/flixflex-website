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
import { listPublishedMainServices } from "@/lib/content-store"
import type { MegaMenuService } from "./services-mega-menu"
import prisma from "@/lib/prisma"

export async function ThemedNavbar() {
  const theme = await getActiveTheme()

  // Resilience: a DB hiccup must not crash the navbar (and thus the whole
  // public site). Fall back to empty settings → logo defaults to text mark.
  let settingsData: { key: string; value: string }[] = []
  if (prisma) {
    try {
      settingsData = await prisma.siteSetting.findMany({
        where: {
          key: { in: ["site_logo", "site_logo_white", "site_logo_transparent", "site_logo_height", "site_logo_mobile_height"] }
        }
      })
    } catch (err) {
      console.error("[ThemedNavbar] site settings load failed, using defaults:", err)
    }
  }

  const siteSettings = settingsData.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)

  // Fetch published main services for the mega menu; strip everything except
  // what crosses the Server→Client boundary (plain serialisable objects only).
  let megaMenuServices: MegaMenuService[] = []
  try {
    const raw = await listPublishedMainServices()
    megaMenuServices = raw.map((s) => ({
      id:          s.id ?? s.slug,
      slug:        s.slug,
      title:       s.title,
      description: s.description,
      iconKey:     s.iconKey,
      subServices: (s.subServices ?? []).map((sub) => ({
        label:       sub.label,
        href:        sub.href,
        iconKey:     sub.iconKey,
        description: sub.description,
      })),
    }))
  } catch {
    // Non-critical — mega menu falls back to plain link in DesktopNav
    megaMenuServices = []
  }

  const isHamburger = theme.settings.headerVariant === "hamburger"

  return (
    <>
      {isHamburger ? (
        <HamburgerNavbar siteSettings={siteSettings} />
      ) : (
        <FlixFlexNavbar siteSettings={siteSettings} megaMenuServices={megaMenuServices} />
      )}
      {theme.settings.mobileNavbar && (
        <MobileNavbar variant={theme.settings.mobileNavbarVariant} />
      )}
    </>
  )
}
