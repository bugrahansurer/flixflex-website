"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Briefcase, FileText, Mail, Sparkles } from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { MobileNavbarVariant } from "@/lib/colors/types"

import { useUIStore } from "@/lib/ui-store"

// ═══════════════════════════════════════════════════════════
// Modern bottom mobile navbar — two variants
//
// "dock"    — icon + label (more discoverable, taller)
// "minimal" — icon only (cleaner, slimmer)
//
// Renders only on small screens (`md:hidden`). Activated by
// active theme `settings.mobileNavbar === true`.
//
// 5 entries — Ana sayfa, İşler, Blog, AI Sohbet (lead capture
// stand-in via /iletisim), İletişim. Active state highlights
// the matching pathname.
// ═══════════════════════════════════════════════════════════

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const ITEMS: NavItem[] = [
  { label: "Ana", href: "/", icon: Home },
  { label: "Portfolyo", href: "/portfolio", icon: Briefcase },
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Hizmet", href: "/hizmetler", icon: Sparkles },
  { label: "İletişim", href: "/iletisim", icon: Mail },
]

export function MobileNavbar({
  variant = "dock",
}: {
  variant?: MobileNavbarVariant
}) {
  const pathname = usePathname()
  const { isMobileDockVisible } = useUIStore()

  // Hide the dock once the footer scrolls into view — it slides back down
  // so it never overlaps the footer's content / CTAs.
  const [footerVisible, setFooterVisible] = React.useState(false)
  React.useEffect(() => {
    const footer = document.querySelector("footer")
    if (!footer) return
    const io = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    io.observe(footer)
    return () => io.disconnect()
  }, [pathname])

  const show = isMobileDockVisible && !footerVisible

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <motion.nav
      role="navigation"
      aria-label="Mobil alt navigasyon"
      initial={{ y: 80, opacity: 0 }}
      animate={{
        y: show ? 0 : 80,
        opacity: show ? 1 : 0,
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "md:hidden fixed inset-x-0 bottom-0 z-40",
        "bg-[var(--background)]/90 backdrop-blur-lg",
        "border-t border-[var(--border)]",
        // Add safe-area inset padding for iOS bottom bar
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      {/* Subtle top accent line — slightly purple */}
      <div
        aria-hidden
        className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--ff-purple)] to-transparent opacity-40"
      />

      <ul
        className={cn(
          "relative grid grid-cols-5",
          variant === "dock" ? "pt-2 pb-0" : "pt-1.5 pb-0"
        )}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1",
                  "transition-colors duration-200",
                  variant === "dock" ? "py-2" : "py-1.5",
                  active
                    ? "text-[var(--ff-purple)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                {/* Active indicator pill */}
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-3 top-0 h-[2px] bg-[var(--ff-purple)] rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon — wrapped in a small "chip" with subtle bg when active */}
                <span
                  className={cn(
                    "ff-shape-button",
                    "flex items-center justify-center transition-colors duration-200",
                    variant === "dock" ? "w-8 h-8" : "w-10 h-10",
                    active && "bg-[rgba(255, 79, 216,0.1)]"
                  )}
                >
                  <Icon size={variant === "dock" ? 17 : 19} strokeWidth={1.75} />
                </span>

                {/* Label (dock only) */}
                {variant === "dock" && (
                  <span
                    className={cn(
                      "text-[9px] font-medium uppercase tracking-[0.08em]",
                      "leading-none"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </motion.nav>
  )
}
