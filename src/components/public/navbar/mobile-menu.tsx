"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { X, ArrowUpRight } from "@/lib/icons"
import { ThemeToggle } from "@/components/ui"
import {
  mobileMenuVariants,
  mobileMenuItemVariants,
} from "@/lib/animations"
import { cn } from "@/lib/utils"
import type { NavLink } from "./nav-data"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: NavLink[]
  siteSettings?: Record<string, string>
}

export function MobileMenu({ open, onClose, links, siteSettings = {} }: MobileMenuProps) {
  const pathname = usePathname()

  // Lock body scroll while menu is open
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Focus trap while menu is open
  React.useEffect(() => {
    if (!open) return
    const savedActiveElement = document.activeElement as HTMLElement

    const getFocusableElements = (container: Element) => {
      return Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        const element = el as HTMLElement
        return element.offsetParent !== null && !element.hasAttribute('disabled')
      }) as HTMLElement[]
    }

    const menuElement = document.querySelector('[role="dialog"]')
    if (!menuElement) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const focusableElements = getFocusableElements(menuElement)
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    const firstFocusable = getFocusableElements(menuElement)[0]
    firstFocusable?.focus()

    window.addEventListener("keydown", handleTabKey)
    return () => {
      window.removeEventListener("keydown", handleTabKey)
      savedActiveElement?.focus()
    }
  }, [open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobil navigasyon"
          variants={mobileMenuVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className={cn(
            "fixed inset-0 z-[60] lg:hidden",
            "bg-[var(--background)] text-[var(--foreground)]",
            "flex flex-col"
          )}
        >
          {/* Topbar */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)]">
            <span className="font-display font-extrabold text-lg">
              Flix<span className="text-[var(--ff-purple)]">Flex</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Menüyü kapat"
              className={cn(
                "ff-shape-button w-10 h-10 flex items-center justify-center",
                "border border-[var(--foreground)] text-[var(--foreground)]",
                "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
                "transition-colors duration-200"
              )}
            >
              <X size={18} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto px-6 py-8">
            <ul className="space-y-1">
              {links.map((link, i) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)

                return (
                  <motion.li
                    key={link.href}
                    custom={i}
                    variants={mobileMenuItemVariants}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center justify-between",
                        "py-4 border-b border-[var(--border)]",
                        "font-display text-2xl font-bold tracking-tight",
                        "transition-colors duration-200",
                        isActive
                          ? "text-[var(--ff-purple)]"
                          : "text-[var(--foreground)] hover:text-[var(--ff-purple)]"
                      )}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="text-[10px] font-mono text-[var(--foreground-faint)] tabular-nums tracking-widest">
                          0{i + 1}
                        </span>
                        {link.label}
                      </span>
                      <ArrowUpRight
                        size={22}
                        className="translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                      />
                    </Link>
                  </motion.li>
                )
              })}
            </ul>

            {/* CTA + theme */}
            <motion.div
              custom={links.length}
              variants={mobileMenuItemVariants}
              className="mt-10 space-y-4"
            >
              <Link
                href="/iletisim"
                onClick={onClose}
                className={cn(
                  "ff-shape-container group flex w-full items-center justify-center gap-2.5",
                  "px-8 py-4 text-sm font-medium",
                  "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                  "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]",
                  "transition-colors duration-200"
                )}
              >
                Seninle Büyüyelim
                <ArrowUpRight size={16} />
              </Link>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs uppercase tracking-widest text-[var(--foreground-muted)]">
                  Tema
                </span>
                <ThemeToggle />
              </div>
            </motion.div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-[var(--border)] text-[12px] text-[var(--foreground-faint)] flex items-center justify-between">
            <span>© {siteSettings.site_name || 'FlixFlex'} {new Date().getFullYear()}</span>
            <span className="text-[var(--ff-purple)]">{siteSettings.site_address || 'İstanbul · Türkiye'}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
