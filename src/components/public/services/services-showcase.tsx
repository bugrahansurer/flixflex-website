"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — ServicesShowcase
// Ana hizmetleri 3'lü, kapak görselli, modüler kartlarda sergiler.
// TiltCard ile 3B tilt + spotlight; kapak alanı (görsel ya da marka
// gradyanı) + ikon rozeti, içeride alt hizmet pill'leri ve "Keşfet".
// Page-builder section'ı ("services-showcase") — admin'den düzenlenebilir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowUpRight, Globe, Search, Target, Film, LayoutGrid, PenTool, Clapperboard,
  Camera, FileText, MessageCircle, Video, TrendingUp, Shapes, BookOpen, Lightbulb,
  Layout, Monitor, Code2, Zap, Sparkles, Scissors, BarChart3, Palette,
  MessageSquare, Fingerprint, type LucideIcon,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import { TiltCard } from "@/components/ui/tilt-card"
import type { Service } from "@/components/public/sections/services-data"

const ICONS: Record<string, LucideIcon> = {
  Search, Target, Film, LayoutGrid, PenTool, Clapperboard, Camera, FileText,
  MessageCircle, Video, TrendingUp, Shapes, BookOpen, Lightbulb, Layout, Monitor,
  Code2, Zap, Sparkles, Scissors, Globe, BarChart3, Palette, MessageSquare, Fingerprint,
}

interface ServicesShowcaseProps {
  headline?: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  services?: Service[]
}

function ServiceIcon({ iconKey, className }: { iconKey?: string; className?: string }) {
  const Comp = (iconKey ? ICONS[iconKey] ?? Globe : Globe) as LucideIcon
  return <Comp className={className} strokeWidth={1.6} />
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
      {/* Yumuşak marka ışıması — tek accent köşede */}
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

        {/* 3'lü modüler kart ızgarası */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {services.map((service, i) => {
            const accent = service.accentColor || "var(--ff-purple)"
            const subs = service.subServices ?? []
            const href = `/hizmetler/${service.slug}`

            return (
              <motion.div
                key={service.id ?? service.slug}
                className="min-w-0"
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.32), ease: EASE }}
              >
                <Link href={href} className="block h-full">
                  <TiltCard
                    variant="glass"
                    spotlight
                    tiltLimit={6}
                    scale={1.015}
                    className="h-full overflow-hidden"
                  >
                    {/* ── Kapak alanı ── */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      {service.coverImage ? (
                        <Image
                          src={service.coverImage}
                          alt={service.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                      ) : (
                        <>
                          <span
                            aria-hidden
                            className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.06]"
                            style={{ background: service.gradient || `linear-gradient(135deg, ${accent} 0%, transparent 78%)` }}
                          />
                          {/* Görsel yokken büyük ikon filigranı */}
                          <ServiceIcon iconKey={service.iconKey} className="absolute -right-3 -bottom-3 h-28 w-28 text-white/[0.14]" />
                        </>
                      )}

                      {/* Okunabilirlik için alttan koyu degrade */}
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                      {/* İkon rozeti */}
                      <span className="ff-shape-button absolute left-4 top-4 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/30 backdrop-blur-md">
                        <ServiceIcon iconKey={service.iconKey} className="h-5 w-5 text-white" />
                      </span>
                    </div>

                    {/* ── İçerik ── */}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-bold tracking-tight text-[var(--foreground)]">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--foreground-muted)] line-clamp-2">
                        {service.description}
                      </p>

                      {/* Alt hizmetler — kompakt pill'ler */}
                      {subs.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {subs.slice(0, 4).map((sub) => (
                            <span
                              key={sub.href}
                              className="ff-shape-button inline-flex items-center border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground-muted)] transition-colors duration-200 group-hover:border-[var(--ff-purple)]/40 group-hover:text-[var(--foreground)]"
                            >
                              {sub.label}
                            </span>
                          ))}
                          {subs.length > 4 && (
                            <span className="inline-flex items-center px-1.5 py-1 text-[11px] font-semibold text-[var(--foreground-faint)]">
                              +{subs.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[12px] font-semibold tracking-wide text-[var(--ff-purple)]">
                        Keşfet
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </TiltCard>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Opsiyonel tek CTA (admin'den ayarlanır) */}
        {ctaLabel && ctaHref && (
          <div className="mt-12 flex justify-center">
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
