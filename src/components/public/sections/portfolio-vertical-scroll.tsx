"use client"

import * as React from "react"
import { useMemo, useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness } from "@/lib/icons"
import { cn } from "@/lib/utils"

interface PortfolioItem {
  id?: string
  slug: string
  title: string
  client: string
  clientLogo?: string | null
  coverImage?: string
  category?: string
  [key: string]: any
}

interface PortfolioVerticalScrollSectionProps {
  headline?: string
  subheadline?: string
  direction?: "left" | "right"
  speed?: "slow" | "normal" | "fast"
  pauseOnHover?: boolean
  maxItems?: number
  hideMobileDock?: boolean
  items?: PortfolioItem[]
}

const DEFAULT_ITEMS: PortfolioItem[] = [
  {
    slug: "lumino-brand-identity",
    title: "Marka Kimliği Yenileme",
    client: "Lumino Gıda",
    category: "Branding",
    coverImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&fit=crop&q=80",
    clientLogo: null,
  },
  {
    slug: "nexwave-performance",
    title: "ROAS 9.2x Büyüme Stratejisi",
    client: "NexWave Teknoloji",
    category: "Performance",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&fit=crop&q=80",
    clientLogo: null,
  },
  {
    slug: "orion-web",
    title: "Kurumsal Web Sitesi Tasarımı",
    client: "Orion Yapı",
    category: "Web",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&fit=crop&q=80",
    clientLogo: null,
  },
  {
    slug: "pulse-content-series",
    title: "12 Aylık İçerik Serisi",
    client: "Pulse Fintech",
    category: "Content",
    coverImage: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&fit=crop&q=80",
    clientLogo: null,
  },
  {
    slug: "zest-brand-launch",
    title: "Sıfırdan Marka Lansmanı",
    client: "Zest Kozmetik",
    category: "Branding",
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&fit=crop&q=80",
    clientLogo: null,
  },
  {
    slug: "apex-ecommerce",
    title: "E-ticaret Deneyimi",
    client: "Apex Spor",
    category: "Web",
    coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop&q=80",
    clientLogo: null,
  },
]

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop&q=80",
]

function Card({ item, index }: { item: PortfolioItem; index: number }) {
  const coverImage = item.coverImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className={cn(
        "group relative flex-shrink-0 w-[260px] md:w-[300px] aspect-[5/8]",
        "ff-shape-container border border-[var(--border)]/40 cursor-pointer select-none",
        "snap-center transition-all duration-300 hover:shadow-xl"
      )}
    >
      {/* Background Cover Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={coverImage}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Dark contrast gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent transition-opacity duration-300" />
      </div>

      {/* Card Content / Metadata */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white">
        {/* Logo + title — flush to the bottom by default */}
        <div className="flex flex-col gap-2.5">
          {/* Logo & Client */}
          <div className="flex items-center w-fit p-1 gap-2 bg-background/10 backdrop-blur-sm rounded-full border border-border/30">
            {item.clientLogo ? (
              <img
                src={item.clientLogo}
                alt={item.client}
                className="w-6 h-6 rounded-full object-contain"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--ff-purple)]/20 border border-[var(--ff-purple)]/40 flex items-center justify-center text-[10px] font-bold text-[var(--ff-purple)]">
                {item.client ? item.client.charAt(0) : "P"}
              </div>
            )}
            <span className="text-sm font-bold text-white/80 pr-1">
              {item.client}
            </span>
          </div>

          {/* Project Title */}
          <h3 className="font-display text-base md:text-md font-bold leading-snug group-hover:text-[var(--ff-purple)] transition-colors duration-300">
            {item.title}
          </h3>
        </div>

        {/* "Projeyi İncele" — collapsed (0 height) by default so logo+title
            sit at the bottom; on hover it expands BELOW them, and because the
            column is justify-end the logo+title slide up while the button
            appears at the bottom edge. */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
          <div className="overflow-hidden min-h-0">
            <span className="inline-flex items-center gap-1 pt-2.5 text-[11px] font-bold text-[var(--ff-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              Projeyi İncele <ArrowRight size={12} className="ml-0.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function PortfolioVerticalScrollSection({
  headline = "Seçili İşlerimiz",
  subheadline = "FlixFlex imzalı yüksek dönüşümlü kreatif tasarımlar",
  speed = "normal",
  pauseOnHover = true,
  maxItems = 12,
  items,
}: PortfolioVerticalScrollSectionProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollWidth, setScrollWidth] = useState(0)

  // Marquee state kept in refs (no re-renders): paused = hover, drag = active grab.
  const pausedRef = useRef(false)
  const dragRef = useRef({ active: false, captured: false, startX: 0, startScroll: 0, moved: false })
  const dirRef = useRef(1)

  // Slice raw items to maxItems size
  const displayItems = useMemo(() => {
    const rawItems = items && items.length > 0 ? items : DEFAULT_ITEMS
    return rawItems.slice(0, maxItems)
  }, [items, maxItems])

  useEffect(() => {
    if (!containerRef.current || !viewportRef.current) return

    const calculateScrollWidth = () => {
      const containerW = containerRef.current!.scrollWidth
      const viewportW = viewportRef.current!.clientWidth
      const diff = containerW - viewportW
      setScrollWidth(diff > 0 ? diff : 0)
    }

    // Short delay to ensure browser layout and fonts are fully loaded
    const timer = setTimeout(calculateScrollWidth, 100)

    window.addEventListener("resize", calculateScrollWidth)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", calculateScrollWidth)
    }
  }, [displayItems])

  // Auto-scroll driven in JS (so it coexists with manual drag). The track
  // ping-pongs across the overflow and pauses while hovering or dragging.
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || scrollWidth <= 0) return

    const pxPerSec = speed === "slow" ? 25 : speed === "fast" ? 180 : 60
    let raf = 0
    let last = 0

    const step = (ts: number) => {
      if (!last) last = ts
      const dt = Math.min((ts - last) / 1000, 0.05) // clamp big frame gaps
      last = ts

      if (!pausedRef.current && !dragRef.current.active) {
        const max = vp.scrollWidth - vp.clientWidth
        let next = vp.scrollLeft + pxPerSec * dt * dirRef.current
        if (next >= max) { next = max; dirRef.current = -1 }
        else if (next <= 0) { next = 0; dirRef.current = 1 }
        vp.scrollLeft = next
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [scrollWidth, speed])

  return (
    <section className="relative bg-[var(--background)] text-[var(--foreground)] py-16 md:py-20 overflow-hidden">
      {/* Subtle background texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      {/* Header */}
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 mb-12 md:mb-16">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="ff-shape-container inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/20 text-[11px] font-semibold text-[var(--ff-purple)] mb-4">
            <BriefcaseBusiness size={11} />
            Portfolyolarımız
          </span>
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-extrabold leading-[1.15] tracking-tight max-w-2xl text-[var(--foreground)]">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-1 text-[var(--foreground-muted)] text-base md:text-sm max-w-xl leading-relaxed">
              {subheadline}
            </p>
          )}
          <button className="inline-flex items-center gap-1.5 px-3 py-1 underline text-[11px] font-semibold text-[var(--foreground)] hover:text-[var(--ff-purple)] transition-colors mt-2">
            Tüm İşlerimiz
            <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Desktop marquee — auto-scroll + click-drag to scroll manually */}
      <div
        ref={viewportRef}
        onPointerEnter={() => { if (pauseOnHover) pausedRef.current = true }}
        onPointerLeave={() => { pausedRef.current = false }}
        onPointerDown={(e) => {
          const vp = viewportRef.current
          if (!vp) return
          // Don't capture yet — a plain click must reach the card link.
          dragRef.current = { active: true, captured: false, startX: e.clientX, startScroll: vp.scrollLeft, moved: false }
        }}
        onPointerMove={(e) => {
          const d = dragRef.current
          if (!d.active) return
          const vp = viewportRef.current
          if (!vp) return
          const dx = e.clientX - d.startX
          if (!d.moved && Math.abs(dx) > 6) {
            // A real drag started — NOW capture the pointer so it keeps
            // tracking even off the element. Plain clicks never reach here.
            d.moved = true
            vp.setPointerCapture?.(e.pointerId)
            d.captured = true
          }
          if (d.moved) vp.scrollLeft = d.startScroll - dx
        }}
        onPointerUp={(e) => {
          const d = dragRef.current
          if (d.captured) {
            viewportRef.current?.releasePointerCapture?.(e.pointerId)
            d.captured = false
          }
          d.active = false
        }}
        onPointerCancel={() => {
          dragRef.current.active = false
          dragRef.current.captured = false
        }}
        // Swallow the click that follows a drag so cards don't navigate accidentally.
        onClickCapture={(e) => {
          if (dragRef.current.moved) {
            e.preventDefault()
            e.stopPropagation()
            dragRef.current.moved = false
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        className="hidden md:block relative w-full overflow-x-auto scrollbar-none select-none cursor-grab active:cursor-grabbing"
      >
        <div ref={containerRef} className="flex gap-6 my-4 px-6 w-max">
          {displayItems.map((item, index) => (
            <Card key={`desktop-${item.slug}-${index}`} item={item} index={index} />
          ))}
        </div>
      </div>

      {/* Mobile touch scroll */}
      <div className="block md:hidden relative w-full">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-6 px-6 scroll-smooth">
          {displayItems.map((item, index) => (
            <Card key={`mobile-${item.slug}-${index}`} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
