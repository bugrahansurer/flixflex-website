"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — ServicesShowcase
// Her ana hizmet tam-genişlik bir SATIR: solda büyük motion'lı ana kart,
// sağda o hizmetin alt hizmet kartları (büyük format, açıklamalı, sağ
// kenarda mini motion şeridiyle). Editoryal, ferah, profesyonel.
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

        {/* Hizmet satırları */}
        <div className="mt-12 md:mt-16 space-y-6 md:space-y-8">
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
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-4 lg:gap-5 items-stretch"
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.06, 0.24), ease: EASE }}
              >
                {/* ── Sol: ana hizmet kartı (büyük motion) ── */}
                <Link
                  href={href}
                  className={cn(
                    "group relative block overflow-hidden ff-shape-container ff-card p-0 min-h-[240px]",
                    "border border-[var(--border)] transition-[border-color,box-shadow] duration-300",
                    "hover:border-[var(--ff-purple)]/45 hover:shadow-[0_18px_55px_rgba(255,79,216,0.16)]",
                  )}
                >
                  <MotionStage design={design} />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-md">
                    <Sparkles className="h-2.5 w-2.5" style={{ color: "#FF4FD8" }} />
                    Motion
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5">
                    <span className="ff-shape-button flex h-11 w-11 flex-shrink-0 items-center justify-center border border-white/15 bg-white/10 backdrop-blur-md">
                      <ServiceIcon iconKey={service.iconKey} className="h-5 w-5 text-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                        {service.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-white/65">{service.description}</p>
                    </div>
                    <span className="inline-flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-white">
                      Keşfet
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>

                {/* ── Sağ: alt hizmet kartları (büyük format) ── */}
                {subs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                    {subs.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "group/sub flex min-h-[112px] flex-col justify-center gap-1.5 ff-shape-container ff-card px-5 py-4",
                          "border border-[var(--border)] transition-[border-color,transform,box-shadow] duration-200",
                          "hover:-translate-y-0.5 hover:border-[var(--ff-purple)]/45 hover:shadow-[0_10px_30px_rgba(255,79,216,0.10)]",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center" style={{ background: "rgba(255,79,216,0.10)", borderRadius: 8 }}>
                            <ServiceIcon iconKey={sub.iconKey} className="h-3.5 w-3.5 text-[var(--ff-purple)]" />
                          </span>
                          <span className="truncate text-[13px] font-semibold text-[var(--foreground)]">{sub.label}</span>
                        </div>
                        {sub.description ? (
                          <p className="line-clamp-2 text-[11.5px] leading-snug text-[var(--foreground-muted)]">{sub.description}</p>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--ff-purple)] opacity-0 transition-opacity duration-200 group-hover/sub:opacity-100">
                          Keşfet <ArrowUpRight className="h-2.5 w-2.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="hidden lg:block" />
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
