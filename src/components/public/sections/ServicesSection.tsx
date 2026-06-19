"use client"

import { useEffect, useRef, useState } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Globe,
  type LucideIcon,
  Search, Target, Film, LayoutGrid, PenTool,
  Clapperboard, Camera, FileText, MessageCircle,
  Video, TrendingUp, Shapes, BookOpen, Lightbulb,
  Layout, Monitor, Code2, Zap, Sparkles, Scissors,
  BarChart3, Palette, MessageSquare, Fingerprint,
  Megaphone, Smartphone, ShoppingCart,
} from "@/lib/icons"
import { StarField } from "@/components/ui/star-field"

// ── Icon map ────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Search, Target, Film, LayoutGrid, PenTool,
  Clapperboard, Camera, FileText, MessageCircle,
  Video, TrendingUp, Shapes, BookOpen, Lightbulb,
  Layout, Monitor, Code2, Zap, Sparkles, Scissors,
  BarChart3, Palette, MessageSquare, Fingerprint,
  Megaphone, Smartphone, ShoppingCart, Globe,
}

// ── Gradient paleti ─────────────────────────────────
const GRADIENTS = [
  "from-[#1A1030] via-[#2D1B4E] to-[#0F0E1A]",
  "from-[#0F1428] via-[#1A2A50] to-[#081228]",
  "from-[#1A0E20] via-[#2D1555] to-[#0F0A18]",
  "from-[#0E1A10] via-[#1A3A28] to-[#0A120E]",
  "from-[#1A0E0E] via-[#3A1A1A] to-[#120A0A]",
]

const ACCENTS = ["#FF4FD8", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444"]

// ── Default static data (DB yoksa fallback) ─────────
const DEFAULT_SERVICES = [
  {
    id: "1",
    slug: "digital-marketing",
    title: "Digital Marketing",
    description: "Hedef kitlenize tam isabet eden performance odaklı dijital pazarlama stratejileri.",
    iconKey: "Target",
    tags: ["Creative Direction", "Content Production", "Social Media", "Performance"],
  },
  {
    id: "2",
    slug: "developing",
    title: "Developing",
    description: "Dönüşüm odaklı, hızlı ve modern web çözümleri. Next.js, React, headless CMS.",
    iconKey: "Code2",
    tags: ["Web Site Building", "Landing Page", "E-Commerce"],
  },
  {
    id: "3",
    slug: "marka-kimligi",
    title: "Brand Identity",
    description: "Sıfırdan marka inşası: logo, renk sistemi, yazı ailesi ve ses tonu.",
    iconKey: "Fingerprint",
    tags: ["Logo Design", "Visual Identity", "Brand Guide"],
  },
  {
    id: "4",
    slug: "web-ve-dijital",
    title: "Web & Digital",
    description: "Dijital vitrin ve deneyim tasarımı — dönüşüm odaklı modern web çözümleri.",
    iconKey: "Layout",
    tags: ["UX/UI", "Prototyping", "Webflow"],
  },
]

interface ServiceItem {
  id: string
  slug: string
  title: string
  description: string
  iconKey?: string
  tags?: string[]
}

interface ServicesSectionProps {
  services?: ServiceItem[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const items = (services && services.length > 0) ? services : DEFAULT_SERVICES

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (isMobile || !sectionRef.current) return

    const panels = sectionRef.current.querySelectorAll<HTMLElement>(".service-panel")

    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      })

      gsap.from(panel, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: panel,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
    })

    return () => ScrollTrigger.getAll().forEach((t: ScrollTrigger) => t.kill())
  }, [isMobile, items])

  return (
    <section ref={sectionRef} className="relative py-24 bg-[var(--background)] overflow-x-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 right-0 w-[50vw] h-[50vh]"
          style={{
            background: "radial-gradient(ellipse at 80% 20%, rgba(255,79,216,0.06) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[40vw] h-[40vh]"
          style={{
            background: "radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.04) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="flex gap-16 lg:gap-24">

          {/* Sol — sticky navigasyon */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-8">
                Hizmetlerimiz
              </p>
              <ul className="space-y-3">
                {items.map((s, i) => {
                  const Icon = s.iconKey ? ICON_MAP[s.iconKey] : null
                  const isActive = active === i
                  return (
                    <li key={s.slug}>
                      <a
                        href={`#service-${s.slug}`}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                          isActive
                            ? "bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/20"
                            : "border border-transparent hover:bg-[var(--surface)]"
                        )}
                      >
                        {/* Numara + İkon */}
                        <span className={cn(
                          "ff-shape-container flex items-center justify-center w-10 h-10 shrink-0 transition-all duration-300",
                          isActive
                            ? "bg-[var(--ff-purple)] text-white shadow-[0_0_20px_rgba(255, 79, 216,0.3)]"
                            : "bg-[var(--surface-elevated)] text-[var(--foreground-muted)] group-hover:text-[var(--ff-purple)]"
                        )}>
                          {Icon ? <Icon size={16} strokeWidth={2} /> : <span className="text-xs font-mono font-bold">{String(i + 1).padStart(2, "0")}</span>}
                        </span>

                        <span className={cn(
                          "text-sm font-medium transition-all duration-300",
                          isActive ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]"
                        )}>
                          {s.title}
                        </span>

                        {/* Active indicator dot */}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--ff-purple)] animate-pulse" />
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Sağ — servis panelleri */}
          <div className="flex-1 py-8">
            {items.map((s, i) => {
              const Icon = s.iconKey ? ICON_MAP[s.iconKey] : Globe
              const gradient = GRADIENTS[i % GRADIENTS.length]
              const accent = ACCENTS[i % ACCENTS.length]
              const tags = s.tags ?? []

              return (
                <div
                  key={s.slug}
                  id={`service-${s.slug}`}
                  className="service-panel mb-32 lg:mb-48 last:mb-0"
                >
                  {/* Görsel kart */}
                  <div className={cn(
                    "relative rounded-2xl overflow-hidden mb-8 p-8 md:p-10",
                    "bg-gradient-to-br", gradient,
                    "border border-white/[0.06]"
                  )}>
                    {/* Decorative glow */}
                    <div
                      className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
                      style={{ background: accent }}
                    />
                    <div
                      className="absolute -bottom-10 left-1/2 w-48 h-48 rounded-full opacity-10 blur-3xl"
                      style={{ background: accent }}
                    />

                    {/* Grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }}
                    />

                    {/* İçerik */}
                    <div className="relative z-10">
                      {/* Numara + ikon */}
                      <div className="flex items-center gap-4 mb-6">
                        <span className="ff-shape-container flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm text-white">
                          <Icon size={24} strokeWidth={1.5} />
                        </span>
                        <span className="text-xs font-mono text-white/40 tracking-widest">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Başlık */}
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {s.title}
                      </h3>

                      {/* Açıklama */}
                      <p className="text-white/70 text-lg leading-relaxed max-w-xl mb-6">
                        {s.description}
                      </p>

                      {/* Tag'ler */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/60 bg-white/5 backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        href={`/hizmetler/${s.slug}`}
                        className="inline-flex items-center gap-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-6 py-3 transition-all duration-300 group/link"
                      >
                        Detaylı İncele
                        <ArrowRight size={15} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}

