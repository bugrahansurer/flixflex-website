"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Search,
  Target,
  Film,
  LayoutGrid,
  PenTool,
  Clapperboard,
  Camera,
  FileText,
  MessageCircle,
  Video,
  TrendingUp,
  Shapes,
  BookOpen,
  Lightbulb,
  Layout,
  Monitor,
  Code2,
  Zap,
  Sparkles,
  Scissors,
  Globe,
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint,
  type LucideIcon,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { NavLink } from "./nav-data"

// ── Types ────────────────────────────────────────
export interface MegaMenuSubService {
  label: string
  href: string
  iconKey: string
  /** Optional one-line description shown under the label */
  description?: string
}

export interface MegaMenuService {
  id: string
  slug: string
  title: string
  description: string
  iconKey?: string
  subServices: MegaMenuSubService[]
}

// ── Minimal icon map (client-safe, no server imports) ─────
const MEGA_ICON_MAP: Record<string, LucideIcon> = {
  Search, Target, Film, LayoutGrid, PenTool, Clapperboard, Camera, FileText,
  MessageCircle, Video, TrendingUp, Shapes, BookOpen, Lightbulb, Layout,
  Monitor, Code2, Zap, Sparkles, Scissors, Globe, BarChart3, Palette,
  MessageSquare, Fingerprint,
}

function Icon({ iconKey, size = 14 }: { iconKey?: string; size?: number }) {
  const Comp = (iconKey ? (MEGA_ICON_MAP[iconKey] ?? Globe) : Globe) as LucideIcon
  return <Comp size={size} strokeWidth={1.75} />
}

// ── Panel variants ────────────────────────────────
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const panelVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
}

// ── Props ─────────────────────────────────────────
interface ServicesMegaMenuTriggerProps {
  link: NavLink
  services: MegaMenuService[]
  transparent: boolean
  /** index in the nav list (for stagger animation) */
  index: number
  /** Current header height in px — panel sits right below it. */
  headerHeight?: number
  /** Reports open/close so the header can drop its transparency while open. */
  onOpenChange?: (open: boolean) => void
}

// ── Component ─────────────────────────────────────
export function ServicesMegaMenuTrigger({
  link,
  services,
  transparent,
  index,
  headerHeight,
  onOpenChange,
}: ServicesMegaMenuTriggerProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(link.href)
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tell the header when we open/close so it can switch to a solid background
  // (and back to transparent on close) while sitting over a hero section.
  React.useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  // Mark mounted (for the body portal) + clear any pending close on unmount
  React.useEffect(() => {
    // SSR-safe portal gate — body portal must only mount on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const scheduleClose = React.useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  const cancelClose = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false)
  }, [])

  return (
    <motion.li
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.06, duration: 0.4 }}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={scheduleClose}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger — identical look to other nav items */}
      <Link
        href={link.href}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "group relative inline-flex items-center px-4 py-2",
          "text-[12px] font-medium tracking-[0.05em]",
          "transition-colors duration-300",
          transparent
            ? isActive
              ? "text-white"
              : "text-white/70 hover:text-white"
            : isActive
              ? "text-[var(--ff-purple)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--ff-purple)]"
        )}
      >
        <span className="relative z-10">{link.label}</span>
        {/* Chevron — signals this item opens a mega menu; flips when open */}
        <ChevronDown
          size={13}
          aria-hidden
          className={cn(
            "relative z-10 ml-1 shrink-0 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute left-4 right-4 bottom-1 h-[2px]",
            "origin-left transition-transform duration-300 ease-out",
            "group-hover:scale-x-100",
            isActive ? "scale-x-100" : "scale-x-0",
            transparent ? "bg-white" : "bg-[var(--ff-purple)]"
          )}
        />
      </Link>

      {/* Mega panel — portaled to <body> to escape the nav's transform context,
          rendered full-bleed (edge-to-edge) fixed below the header bar. */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="mega-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="region"
              aria-label="Hizmetler menüsü"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              // Sit flush under the header — its real height is passed in
              // (80px tall at top, 56px when scrolled). Decoupled from
              // `transparent` so it stays correct when the header goes solid.
              style={{ top: headerHeight ?? (transparent ? 80 : 56) }}
              className={cn(
                // Full-bleed: fixed, spans the entire viewport width
                "fixed inset-x-0 z-[55]",
                // Visual — solid background even when the navbar is transparent
                "bg-[var(--background)]/65 backdrop-blur-md border-b border-[var(--border)]",
                "border-y border-[var(--border)]",
                "shadow-[0_24px_80px_rgba(0,0,0,0.22)]",
              )}
            >
              {/* Inner content aligned to the site grid; background stays full-width */}
              <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-8">
                <div className="flex gap-10">
                  {/* Services grid */}
                  <div className="flex-1 min-w-0 grid grid-cols-3 gap-x-0 divide-x divide-[var(--border)]">
                    {services.map((service) => (
                      <ServiceColumn key={service.id} service={service} />
                    ))}
                  </div>

                  {/* CTA panel */}
                  <CtaPanel />
                </div>
              </div>

              {/* Bottom accent bar */}
              <div className="h-[2px] bg-gradient-to-r from-[var(--ff-purple)] via-[var(--ff-purple)]/50 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.li>
  )
}

// ── Service Column ────────────────────────────────
function ServiceColumn({ service }: { service: MegaMenuService }) {
  return (
    <div className="flex flex-col px-5 first:pl-0 last:pr-0">
      {/* Column header = parent service link */}
      <Link
        href={`/hizmetler/${service.slug}`}
        className="group/col mb-3 flex items-start gap-2.5 pb-3 border-b border-[var(--border)]"
      >
        <span
          className={cn(
            "ff-shape-container mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center",
            "bg-[var(--ff-purple-muted)] text-[var(--ff-purple)]",
            "transition-colors duration-200 group-hover/col:bg-[var(--ff-purple)] group-hover/col:text-white",
          )}
        >
          <Icon iconKey={service.iconKey} size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[13px] font-extrabold text-[var(--foreground)] transition-colors duration-200 group-hover/col:text-[var(--ff-purple)]">
            <span className="truncate">{service.title}</span>
            <ArrowUpRight
              size={11}
              className="shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover/col:translate-x-0 group-hover/col:opacity-100"
            />
          </span>
          {service.description ? (
            <span className="mt-0.5 block text-[10px] leading-snug text-[var(--foreground-faint)] line-clamp-1">
              {service.description}
            </span>
          ) : null}
        </span>
      </Link>

      {/* Sub-services list */}
      {service.subServices.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {service.subServices.map((sub) => (
            <SubServiceItem key={sub.href + sub.label} sub={sub} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

// ── Sub Service Item ──────────────────────────────
// Card-style row: icon tile + title + optional one-line description.
function SubServiceItem({ sub }: { sub: MegaMenuSubService }) {
  return (
    <li>
      <Link
        href={sub.href}
        className={cn(
          "group/sub ff-shape-container flex items-start gap-2.5 p-2",
          "transition-colors duration-200 hover:bg-[var(--background-alt)]",
          "focus-visible:outline-[var(--ff-purple)] focus-visible:outline-2 focus-visible:outline-offset-1",
        )}
      >
        <span
          className={cn(
            "ff-shape-container flex h-8 w-8 shrink-0 items-center justify-center",
            "bg-[var(--background-alt)]/30 border border-[var(--border)] text-[var(--foreground-muted)]",
            "transition-colors duration-200",
            "group-hover/sub:bg-[var(--ff-purple)] group-hover/sub:text-white",
          )}
        >
          <Icon iconKey={sub.iconKey} size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <span className="truncate text-[12px] font-semibold text-[var(--foreground)] transition-colors duration-200 group-hover/sub:text-[var(--ff-purple)]">
              {sub.label}
            </span>
            <ArrowRight
              size={10}
              className={cn(
                "shrink-0 -translate-x-1 opacity-0",
                "transition-all duration-200",
                "group-hover/sub:translate-x-0 group-hover/sub:opacity-60",
              )}
            />
          </span>
          {sub.description ? (
            <span className="mt-0.5 block text-[10px] leading-snug text-[var(--foreground-faint)] line-clamp-2">
              {sub.description}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  )
}

// ── CTA Panel ─────────────────────────────────────
function CtaPanel() {
  return (
    <div
      className={cn(
        "ff-shape-container flex flex-col justify-between w-[320px] shrink-0 p-6",
        "bg-gradient-to-br from-[var(--ff-purple-muted)] to-[var(--background)]",
        "border border-[var(--border)]",
      )}
    >
      {/* Top: icon accent */}
      <div>
        <div
          className={cn(
            "ff-shape-container inline-flex items-center justify-center w-9 h-9 mb-4",
            "bg-[var(--ff-purple)] text-white",
          )}
        >
          <Sparkles size={16} strokeWidth={1.75} />
        </div>

        <p
          className={cn(
            "text-[13px] font-bold tracking-[-0.01em] leading-tight mb-2",
            "text-[var(--foreground)]",
          )}
        >
          Projeni<br />Konuşalım
        </p>

        <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed mb-5">
          Hangi hizmete ihtiyacın olduğundan emin değil misin? Sana en doğru çözümü bulalım.
        </p>
      </div>

      {/* CTA button */}
      <Link
        href="/iletisim"
        className={cn(
          "ff-shape-button",
          "group inline-flex items-center justify-center gap-1.5",
          "w-full px-3 py-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase",
          "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
          "transition-all duration-200",
          "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]",
          "hover:shadow-[0_6px_24px_rgba(255,79,216,0.4)]",
          "focus-visible:outline-2 focus-visible:outline-[var(--ff-purple)] focus-visible:outline-offset-2",
        )}
      >
        Form Doldur
        <ArrowUpRight
          size={13}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>

      {/* Secondary link */}
      <Link
        href="/hizmetler"
        className={cn(
          "group mt-2 inline-flex items-center justify-center gap-1",
          "text-[10px] text-[var(--foreground-faint)] tracking-[0.04em]",
          "transition-colors duration-200 hover:text-[var(--ff-purple)]",
        )}
      >
        Tüm hizmetleri gör
        <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
