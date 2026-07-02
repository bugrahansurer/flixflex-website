"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"
import { Menu, X, ArrowUpRight } from "@/lib/icons"
import { ThemeToggle } from "@/components/ui"
import { cn } from "@/lib/utils"
import { FlixFlexLogo } from "./logo"
import { NAV_LINKS } from "./nav-data"
import { useUIStore } from "@/lib/ui-store"
import { useTheme } from "@/components/shared/theme-provider"


// ═══════════════════════════════════════════════════════════
// HamburgerNavbar — alternative public navbar variant
//
// Logo on the left, single hamburger button on the right.
// Tap the hamburger → full-screen overlay menu with mega
// type links, theme toggle, and primary CTA.
//
// Selected via active theme's `settings.headerVariant === "hamburger"`.
// ═══════════════════════════════════════════════════════════

interface HamburgerNavbarProps {
  siteSettings?: Record<string, string | undefined>
}

export function HamburgerNavbar({ siteSettings = {} }: HamburgerNavbarProps) {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()
  const setAppointmentModalOpen = useUIStore((state) => state.setAppointmentModalOpen)
  const headerTone = useUIStore((state) => state.headerTone)
  const { resolvedTheme } = useTheme()

  // Transparent (un-scrolled) text colour follows the hero background behind it.
  const tone: "light" | "dark" = headerTone === "theme" ? resolvedTheme : headerTone
  const darkBg = tone === "dark" // dark background → white text/buttons


  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12))

  // Lock body scroll while overlay is open
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Close on Esc
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Close on route change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route change side effect
    setOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        initial={false}
        className={cn(
          "fixed top-0 inset-x-0 z-50",
          "transition-all duration-300",
          scrolled
            ? "bg-[var(--background)]/65 backdrop-blur-md border-b border-[var(--border)]"
            : "bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]"
        )}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div
            className={cn(
              "flex items-center justify-between gap-6",
              "transition-[height] duration-300",
              scrolled ? "h-14" : "h-16 md:h-20"
            )}
          >
            <FlixFlexLogo
              size={scrolled ? "sm" : "md"}
              logoUrl={(scrolled || !darkBg) ? siteSettings.site_logo : (siteSettings.site_logo_transparent || siteSettings.site_logo_white)}
              logoHeight={siteSettings.site_logo_height ? parseInt(siteSettings.site_logo_height) : undefined}
              transparent={!scrolled}
              tone={tone}
            />

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Menüyü aç"
              aria-expanded={open}
              className={cn(
                "ff-shape-button",
                "inline-flex items-center justify-center gap-2",
                "h-9 px-5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300",
                scrolled
                  ? "border border-[var(--foreground-muted)] text-[var(--foreground-muted)] hover:bg-[var(--foreground-muted)] hover:text-[var(--background)]"
                  : darkBg
                    ? "border border-white/20 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/40 bg-white/5"
                    : "border border-black/20 text-black/80 hover:bg-black/10 hover:text-black hover:border-black/40 bg-black/5"
              )}
            >
              <span className="hidden sm:inline">Menü</span>
              <Menu size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="ham-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Tam ekran navigasyon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "fixed inset-0 z-[60]",
              "bg-[var(--background)] text-[var(--foreground)]"
            )}
          >
            {/* Purple aura */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at top right, rgba(255, 79, 216,0.18) 0%, transparent 60%)",
              }}
            />
            {/* Grid pattern */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />

            <div className="relative h-full flex flex-col">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 md:px-10 xl:px-16 h-16 md:h-20 border-b border-[var(--border)]">
                <FlixFlexLogo
                  logoUrl={siteSettings.site_logo}
                  logoHeight={siteSettings.site_logo_height ? parseInt(siteSettings.site_logo_height) : undefined}
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Menüyü kapat"
                  className={cn(
                    "ff-shape-button",
                    "w-11 h-11 flex items-center justify-center",
                    "border border-[var(--foreground)] text-[var(--foreground)]",
                    "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
                    "transition-colors duration-200"
                  )}
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {/* Mega menu */}
              <nav className="flex-1 overflow-y-auto px-6 md:px-10 xl:px-16 py-6 md:py-10">
                <ul className="space-y-2 md:space-y-4">
                  {NAV_LINKS.map((link, i) => {
                    const active =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href)
                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 + i * 0.06,
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "group flex items-baseline gap-2 py-2 md:py-3",
                            "border-b border-[var(--border)]",
                            "font-display font-extrabold tracking-tight leading-none",
                            "transition-colors duration-200",
                            active
                              ? "text-[var(--ff-purple)]"
                              : "text-[var(--foreground)] hover:text-[var(--ff-purple)]"
                          )}
                          style={{
                            fontSize: "clamp(24px, 3vw, 32px)",
                          }}
                        >
                          <span className="text-[10px] md:text-xs font-mono font-bold text-[var(--foreground-faint)] tabular-nums tracking-widest self-start mt-3">
                            0{i + 1}
                          </span>
                          <span className="flex-1">{link.label}</span>
                          <ArrowUpRight
                            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 self-start mt-3 shrink-0"
                            size={32}
                            strokeWidth={1.5}
                          />
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>
              </nav>

              {/* Footer */}
              <div className="border-t border-[var(--border)] px-6 md:px-10 xl:px-16 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setAppointmentModalOpen(true)}
                    }
                    className={cn(
                      "ff-shape-button h-11 group inline-flex items-center justify-center gap-2.5 cursor-pointer",
                      "px-6 py-3 text-[12px] font-medium",
                      "bg-[var(--ff-purple-strong)] text-white border border-[var(--ff-purple-strong)]",
                      "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]",
                      "transition-colors duration-200"
                    )}
                  >
                    Randevu Oluştur
                    <ArrowUpRight size={14} />
                  </button>
                  <ThemeToggle />
                </div>
                <p className="text-[11px] tracking-[0.2em] text-[var(--foreground-faint)]">
                  © {siteSettings.site_name || 'FlixFlex'} {new Date().getFullYear()} | {siteSettings.site_address || 'Turkey'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
