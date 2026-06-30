"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { NavLink } from "./nav-data"
import { ServicesMegaMenuTrigger, type MegaMenuService } from "./services-mega-menu"

interface DesktopNavProps {
  links:             NavLink[]
  transparent?:      boolean
  /** Background tone behind the transparent header: 'dark' → white text, 'light' → black text. */
  tone?:             "light" | "dark"
  megaMenuServices?: MegaMenuService[]
  /** Real header height (px) so the mega panel sits flush under it. */
  headerHeight?:     number
  /** Bubbles the mega menu open state up to the header. */
  onMegaOpenChange?: (open: boolean) => void
}

export function DesktopNav({ links, transparent, tone = "dark", megaMenuServices, headerHeight, onMegaOpenChange }: DesktopNavProps) {
  const pathname = usePathname()
  const darkBg = tone === "dark" // dark background → white text

  return (
    <ul className="hidden lg:flex items-center gap-1">
      {links.map((link, i) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href)

        // Render mega menu trigger for Hizmetler when services data is available
        if (link.hasMegaMenu && megaMenuServices && megaMenuServices.length > 0) {
          return (
            <ServicesMegaMenuTrigger
              key={link.href}
              link={link}
              services={megaMenuServices}
              transparent={transparent ?? false}
              tone={tone}
              index={i}
              headerHeight={headerHeight}
              onOpenChange={onMegaOpenChange}
            />
          )
        }

        return (
          <motion.li
            key={link.href}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
          >
            <Link
              href={link.href}
              className={cn(
                "group relative inline-flex items-center px-4 py-2",
                "text-[12px] font-medium tracking-[0.05em]",
                "transition-colors duration-300",
                transparent
                  ? isActive
                    ? (darkBg ? "text-white" : "text-black")
                    : (darkBg ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black")
                  : isActive
                    ? "text-[var(--ff-purple)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--ff-purple)]"
              )}
            >
              <span className="relative z-10">{link.label}</span>
              <span
                aria-hidden
                className={cn(
                  "absolute left-4 right-4 bottom-1 h-[2px]",
                  "origin-left transition-transform duration-300 ease-out",
                  "group-hover:scale-x-100",
                  isActive ? "scale-x-100" : "scale-x-0",
                  transparent ? (darkBg ? "bg-white" : "bg-black") : "bg-[var(--ff-purple)]"
                )}
              />
            </Link>
          </motion.li>
        )
      })}
    </ul>
  )
}
