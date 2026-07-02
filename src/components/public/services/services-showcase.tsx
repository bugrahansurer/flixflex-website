"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — ServicesShowcase
// Her ana hizmet TEK bir birleşik kart: solda başlık (ana hizmete link)
// + o hizmetin alt hizmet kartları (2x2), sağda o hizmete özel canlı
// motion design paneli. Kompakt, gruplu, motion odaklı.
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

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
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

        {/* Hizmet kartları — her biri tek birleşik kart */}
        <div className="mt-12 md:mt-16 space-y-5 md:space-y-6">
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
                className={cn(
                  "group/card relative flex flex-col-reverse lg:flex-row items-stretch overflow-hidden ff-shape-container ff-card p-0",
                  "border border-[var(--border)] transition-[border-color,box-shadow] duration-300",
                  "hover:border-[var(--ff-purple)]/40 hover:shadow-[0_18px_55px_rgba(255,79,216,0.13)]",
                )}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.06, 0.24), ease: EASE }}
              >
                {/* ── Sol: başlık + alt hizmet kartları ── */}
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 md:p-6">
                  {/* Ana hizmet başlığı (ana hizmet sayfasına link) */}
                  <Link href={href} className="group/head flex items-start gap-3">
                    <span className="ff-shape-button flex h-11 w-11 flex-shrink-0 items-center justify-center border border-[var(--ff-purple)]/25" style={{ background: "rgba(255,79,216,0.10)" }}>
                      <ServiceIcon iconKey={service.iconKey} className="h-5 w-5 text-[var(--ff-purple)]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="font-display text-lg md:text-xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
                          {service.title}
                        </span>
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[var(--foreground-muted)] transition-transform duration-200 group-hover/head:translate-x-0.5 group-hover/head:-translate-y-0.5 group-hover/head:text-[var(--ff-purple)]" />
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-[var(--foreground-muted)] leading-snug line-clamp-1">
                        {service.description}
                      </span>
                    </span>
                  </Link>

                  {/* Alt hizmet kartları (2x2) */}
                  {subs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {subs.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "group/sub flex flex-col ff-shape-container gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)]/40 px-3.5 py-3",
                            "transition-[border-color,transform,background-color] duration-200",
                            "hover:-translate-y-0.5 hover:border-[var(--ff-purple)]/45 hover:bg-[var(--ff-purple)]/[0.04]",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center" style={{ background: "rgba(255,79,216,0.10)", borderRadius: 7 }}>
                              <ServiceIcon iconKey={sub.iconKey} className="h-3.5 w-3.5 text-[var(--ff-purple)]" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[var(--foreground)]">{sub.label}</span>
                            <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-[var(--foreground-muted)] opacity-0 transition-opacity duration-200 group-hover/sub:opacity-100" />
                          </span>
                          {sub.description ? (
                            <span className="block truncate text-[11px] text-[var(--foreground-muted)]">{sub.description}</span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Sağ: motion paneli ── */}
                <Link
                  href={href}
                  aria-label={`${service.title} — keşfet`}
                  className="relative h-36 w-full flex-shrink-0 overflow-hidden border-b lg:h-auto lg:w-[240px] xl:w-[280px] lg:border-b-0 lg:border-l border-[var(--border)]"
                >
                  <MotionStage design={design} />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-l" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        {ctaLabel && ctaHref && (
          <div className="mt-14 flex justify-center">
            <Link
              href={ctaHref}
              className="ff-shape-button group inline-flex items-center gap-1.5 bg-[var(--ff-purple-strong)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[var(--ff-purple-hover)]"
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
