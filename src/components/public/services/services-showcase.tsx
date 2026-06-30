"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — ServicesShowcase
// 3 sütun: her sütun bir ana hizmet kartı (üstte o hizmete özel canlı
// motion design) + hemen altında o hizmete bağlı alt hizmet kartları
// (sağ kenarda mini motion şeridiyle). Kompakt, gruplu, motion odaklı.
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

      <div className="relative mx-auto max-w-[1280px] px-6 md:px-10 xl:px-16">
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

        {/* 3 sütun — her sütun: ana hizmet + altında alt hizmetleri */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
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
                className="flex flex-col gap-3"
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.08, 0.3), ease: EASE }}
              >
                {/* ── Ana hizmet kartı: motion + başlık ── */}
                <Link
                  href={href}
                  className={cn(
                    "group relative block overflow-hidden ff-shape-container ff-card p-0",
                    "border border-[var(--border)] transition-[border-color,box-shadow] duration-300",
                    "hover:border-[var(--ff-purple)]/45 hover:shadow-[0_18px_50px_rgba(255,79,216,0.16)]",
                  )}
                >
                  <div className="relative h-[180px] w-full">
                    <MotionStage design={design} />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-md">
                      <Sparkles className="h-2.5 w-2.5" style={{ color: "#FF4FD8" }} />
                      Motion
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end gap-2.5 p-4">
                      <span className="ff-shape-button flex h-10 w-10 flex-shrink-0 items-center justify-center border border-white/15 bg-white/10 backdrop-blur-md">
                        <ServiceIcon iconKey={service.iconKey} className="h-5 w-5 text-white" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base md:text-lg font-bold tracking-tight text-white leading-tight">
                          {service.title}
                        </h3>
                        <p className="mt-0.5 truncate text-[11px] text-white/65">{service.description}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-white/80 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>

                {/* ── Alt hizmet kartları (sütun içinde, vurgulu) ── */}
                {subs.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {subs.map((sub) => {
                      const subDesign = resolveMotionDesign({ motionDesign: sub.motionDesign, title: sub.label, iconKey: sub.iconKey })
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "group/sub relative flex h-16 items-stretch overflow-hidden ff-shape-container ff-card p-0",
                            "border border-[var(--border)] transition-[border-color,transform] duration-200",
                            "hover:-translate-y-0.5 hover:border-[var(--ff-purple)]/45",
                          )}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-4">
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center" style={{ background: "rgba(255,79,216,0.10)", borderRadius: 8 }}>
                              <ServiceIcon iconKey={sub.iconKey} className="h-3.5 w-3.5 text-[var(--ff-purple)]" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12px] font-semibold text-[var(--foreground)]">{sub.label}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--ff-purple)] opacity-0 transition-opacity duration-200 group-hover/sub:opacity-100">
                                Keşfet <ArrowUpRight className="h-2.5 w-2.5" />
                              </span>
                            </span>
                          </div>
                          <span aria-hidden className="relative w-[88px] flex-shrink-0 overflow-hidden border-l border-[var(--border)]">
                            <MotionStage design={subDesign} />
                            <span className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

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
