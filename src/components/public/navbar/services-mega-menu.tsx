"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  ArrowRight,
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
  label:   string
  href:    string
  iconKey: string
}

export interface MegaMenuService {
  id:          string
  slug:        string
  title:       string
  description: string
  iconKey?:    string
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
  link:        NavLink
  services:    MegaMenuService[]
  transparent: boolean
  /** index in the nav list (for stagger animation) */
  index:       number
}

// ── Component ─────────────────────────────────────
export function ServicesMegaMenuTrigger({
  link,
  services,
  transparent,
  index,
}: ServicesMegaMenuTriggerProps) {
  const pathname    = usePathname()
  const isActive    = pathname.startsWith(link.href)
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const timerRef    = React.useRef<ReturnType<typeof setTimeout> | null>(null)

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
              // Header is h-20 (80px) at top, h-14 (56px) when scrolled
              style={{ top: transparent ? 80 : 56 }}
              className={cn(
                // Full-bleed: fixed, spans the entire viewport width
                "fixed inset-x-0 z-[55]",
                // Visual — solid background even when the navbar is transparent
                "bg-[var(--background)]/95 backdrop-blur-xl",
                "border-y border-[var(--border)]",
                "shadow-[0_24px_80px_rgba(0,0,0,0.22)]",
              )}
            >
              {/* Inner content aligned to the site grid; background stays full-width */}
              <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-8">
                <div className="flex gap-10">
                  {/* Services grid */}
                  <div className="flex-1 min-w-0 grid grid-cols-3 gap-x-8 gap-y-4 divide-x divide-[var(--border)]">
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
    <div className="flex flex-col gap-0 p-4">
      {/* Column header = parent service link */}
      <Link
        href={`/hizmetler/${service.slug}`}
        className={cn(
          "group flex items-center gap-2 mb-3",
          "text-[11px] font-semibold tracking-[0.08em] uppercase",
          "text-[var(--foreground-muted)]",
          "transition-colors duration-200 hover:text-[var(--ff-purple)]",
        )}
      >
        <span
          className={cn(
            "ff-shape-container flex h-6 w-6 shrink-0 items-center justify-center",
            "bg-[var(--ff-purple-muted)] text-[var(--ff-purple)]",
            "transition-colors duration-200 group-hover:bg-[var(--ff-purple)] group-hover:text-white",
          )}
        >
          <Icon iconKey={service.iconKey} size={12} />
        </span>
        <span>{service.title}</span>
        <ArrowUpRight
          size={11}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
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
function SubServiceItem({ sub }: { sub: MegaMenuSubService }) {
  return (
    <li>
      <Link
        href={sub.href}
        className={cn(
          "group/sub flex items-center gap-2 px-1 py-1.5",
          "text-[11px] text-[var(--foreground-muted)]",
          "transition-colors duration-200 hover:text-[var(--foreground)]",
          "focus-visible:outline-[var(--ff-purple)] focus-visible:outline-2 focus-visible:outline-offset-1 rounded-sm",
        )}
      >
        <span
          className={cn(
            "ff-shape-container flex h-5 w-5 shrink-0 items-center justify-center",
            "bg-[var(--background-alt)] text-[var(--foreground-faint)]",
            "transition-colors duration-200",
            "group-hover/sub:bg-[var(--ff-purple-muted)] group-hover/sub:text-[var(--ff-purple)]",
          )}
        >
          <Icon iconKey={sub.iconKey} size={10} />
        </span>
        <span className="truncate">{sub.label}</span>
        <ArrowRight
          size={10}
          className={cn(
            "ml-auto shrink-0 opacity-0 -translate-x-1",
            "transition-all duration-200",
            "group-hover/sub:opacity-60 group-hover/sub:translate-x-0",
          )}
        />
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
