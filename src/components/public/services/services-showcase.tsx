"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — ServicesShowcase
// Her ana hizmet için: üstte o hizmete özel canlı motion design'ın
// oynadığı büyük kart (başlık üzerine bindirilir), hemen altında o
// hizmete bağlı alt hizmetlerin mini kartları. Modüler, motion odaklı.
// Page-builder section'ı ("services-showcase") — admin'den düzenlenebilir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowUpRight, Globe, Search, Target, Film, LayoutGrid, PenTool, Clapperboard,
  Camera, FileText, MessageCircle, Video, TrendingUp, Shapes, BookOpen, Lightbulb,
  Layout, Monitor, Code2, Zap, Sparkles, Scissors, BarChart3, Palette,
  MessageSquare, Fingerprint, type LucideIcon,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { Service } from "@/components/public/sections/services-data"
import { MotionStage, resolveMotionDesign } from "./motion-designs"

const ICONS: Record<string, LucideIcon> = {
  Search, Target, Film, LayoutGrid, PenTool, Clapperboard, Camera, FileText,
  MessageCircle, Video, TrendingUp, Shapes, BookOpen, Lightbulb, Layout, Monitor,
  Code2, Zap, Sparkles, Scissors, Globe, BarChart3, Palette, MessageSquare, Fingerprint,
}

function ServiceIcon({ iconKey, className }: { iconKey?: string; className?: string }) {
  const Comp = (iconKey ? ICONS[iconKey] ?? Globe : Globe) as LucideIcon
  return <Comp className={className} strokeWidth={1.6} />
}

interface ServicesShowcaseProps {
  headline?: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  services?: Service[]
}

const EASE = [0.16, 1, 0.3, 1] as const

export function ServicesShowcase({
  headline = "Markanı büyüten hizmetler",
  subheadline = "Strateji, yaratıcılık ve teknolojiyi tek çatı altında topluyoruz. İhtiyacın olan her şey, bir arada.",
  ctaLabel,
  ctaHref,
  services = [],
}: ServicesShowcaseProps) {
  const reduce = useReducedMotion()
  if (!services.length) return null

  return (
    <section className="relative bg-[var(--background)] py-20 md:py-28 overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px]"
        style={{ background: "radial-gradient(circle, rgba(255,79,216,0.10) 0%, transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-[1180px] px-6 md:px-10 xl:px-16">
        {/* Başlık */}
        <div className="max-w-2xl">
          <h2
            className="font-display font-extrabold tracking-[-0.02em] leading-[1.05] text-[var(--foreground)]"
            style={{ fontSize: "clamp(30px, 3.4vw, 52px)" }}
          >
            {headline}
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed max-w-[58ch]">
            {subheadline}
          </p>
        </div>

        {/* Ana hizmet blokları */}
        <div className="mt-12 md:mt-16 space-y-12 md:space-y-16">
          {services.map((service, i) => {
            const subs = service.subServices ?? []
            const href = `/hizmetler/${service.slug}`
            const design = resolveMotionDesign({
              motionDesign: service.motionDesign,
              title: service.title,
              iconKey: service.iconKey,
            })

            return (
              <motion.div
                key={service.id ?? service.slug}
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {/* ── Ana kart: motion + başlık bindirme ── */}
                <Link
                  href={href}
                  className={cn(
                    "group relative block overflow-hidden ff-shape-container ff-card p-0",
                    "border border-[var(--border)] transition-[border-color,box-shadow] duration-300",
                    "hover:border-[var(--ff-purple)]/45 hover:shadow-[0_18px_60px_rgba(255,79,216,0.14)]",
                  )}
                >
                  <div className="relative h-[210px] sm:h-[240px] md:h-[280px] w-full">
                    {/* Canlı motion design */}
                    <MotionStage design={design} />

                    {/* Alt degrade — başlık okunaklılığı */}
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Üst-sağ: motion etiketi (ince) */}
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70 backdrop-blur-md">
                      <Sparkles className="h-3 w-3" style={{ color: "#FF4FD8" }} />
                      Motion
                    </span>

                    {/* Alt: ikon + başlık + açıklama + Keşfet */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="ff-shape-button flex h-11 w-11 flex-shrink-0 items-center justify-center border border-white/15 bg-white/10 backdrop-blur-md">
                          <ServiceIcon iconKey={service.iconKey} className="h-5 w-5 text-white" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-display text-lg md:text-xl font-bold tracking-tight text-white">
                            {service.title}
                          </h3>
                          <p className="mt-0.5 truncate text-[12px] text-white/70">{service.description}</p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 text-[12px] font-semibold text-white">
                        Keşfet
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* ── Bağlı alt hizmet mini kartları ── */}
                {subs.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
                    {subs.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "group/sub flex items-center gap-2.5 ff-shape-container ff-card px-4 py-3",
                          "border border-[var(--border)] transition-[border-color,transform] duration-200",
                          "hover:-translate-y-0.5 hover:border-[var(--ff-purple)]/45",
                        )}
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center" style={{ background: "rgba(255,79,216,0.10)", borderRadius: 8 }}>
                          <ServiceIcon iconKey={sub.iconKey} className="h-3.5 w-3.5 text-[var(--ff-purple)]" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[var(--foreground)]">
                          {sub.label}
                        </span>
                        <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-[var(--ff-purple)] opacity-0 transition-opacity duration-200 group-hover/sub:opacity-100" />
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Opsiyonel tek CTA */}
        {ctaLabel && ctaHref && (
          <div className="mt-14 flex justify-center">
            <Link
              href={ctaHref}
              className="ff-shape-button group inline-flex items-center gap-1.5 bg-[var(--ff-purple)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[var(--ff-purple-hover)]"
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
