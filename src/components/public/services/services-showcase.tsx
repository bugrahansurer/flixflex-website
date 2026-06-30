"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — ServicesShowcase
// Ana hizmetleri asimetrik bir bento ızgarada sergiler; her kart
// hover'da yükselir, accent kenarlık + "Keşfet" ortaya çıkar ve
// alt hizmetler kompakt pill'ler olarak görünür. Page-builder
// section'ı ("services-showcase") — admin'den düzenlenebilir.
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
import type { Service } from "@/components/public/sections/services-data"

const ICONS: Record<string, LucideIcon> = {
  Search, Target, Film, LayoutGrid, PenTool, Clapperboard, Camera, FileText,
  MessageCircle, Video, TrendingUp, Shapes, BookOpen, Lightbulb, Layout, Monitor,
  Code2, Zap, Sparkles, Scissors, Globe, BarChart3, Palette, MessageSquare, Fingerprint,
}

// Bento ritmi — md:grid-cols-6 üzerinde her kart için sütun genişliği.
// Geniş/dar/geniş düzeni: tekdüze tekrar yerine asimetrik akış.
const SPANS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4", "md:col-span-3", "md:col-span-3"]

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
      {/* Yumuşak marka ışıması — köşede tek accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px]"
        style={{ background: "radial-gradient(circle, rgba(255,79,216,0.10) 0%, transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Başlık */}
        <div className="max-w-3xl">
          <h2
            className="font-display font-extrabold tracking-[-0.02em] leading-[1.05] text-[var(--foreground)]"
            style={{ fontSize: "clamp(30px, 3.6vw, 56px)" }}
          >
            {headline}
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed max-w-[60ch]">
            {subheadline}
          </p>
        </div>

        {/* Bento ızgara */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
          {services.map((service, i) => {
            const accent = service.accentColor || "var(--ff-purple)"
            const subs = service.subServices ?? []
            const href = `/hizmetler/${service.slug}`

            return (
              <motion.div
                key={service.id ?? service.slug}
                className={cn("min-w-0", SPANS[i % SPANS.length])}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.3), ease: EASE }}
              >
                <Link
                  href={href}
                  className={cn(
                    "group/card relative flex h-full min-h-[220px] flex-col overflow-hidden",
                    "ff-shape-container ff-card p-0",
                    "border border-[var(--border)] transition-[transform,border-color,box-shadow] duration-300",
                    "hover:-translate-y-1 hover:border-[var(--ff-purple)]/45",
                    "hover:shadow-[0_18px_60px_rgba(255,79,216,0.14)]",
                  )}
                  style={{ "--svc-accent": accent } as React.CSSProperties}
                >
                  {/* Arka plan: kapak görseli varsa onu, yoksa hizmetin kendi gradyanını kullan */}
                  {service.coverImage ? (
                    <>
                      <Image
                        src={service.coverImage}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-[0.9] transition-transform duration-500 group-hover/card:scale-105"
                      />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                    </>
                  ) : (
                    <span
                      aria-hidden
                      className="absolute inset-0 opacity-[0.16] transition-opacity duration-300 group-hover/card:opacity-30"
                      style={{ background: service.gradient || `linear-gradient(135deg, ${accent}, transparent 70%)` }}
                    />
                  )}

                  {/* Üst accent çizgisi — hover'da dolar */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-300 group-hover/card:scale-x-100"
                    style={{ background: "var(--ff-purple)" }}
                  />

                  <div className={cn("relative z-10 flex h-full flex-col p-6", service.coverImage && "text-white")}>
                    {/* İkon */}
                    <span
                      className="ff-shape-button flex h-11 w-11 items-center justify-center"
                      style={{
                        background: service.coverImage ? "rgba(255,255,255,0.12)" : "rgba(255,79,216,0.10)",
                      }}
                    >
                      <ServiceIcon
                        iconKey={service.iconKey}
                        className={cn("h-5 w-5", service.coverImage ? "text-white" : "text-[var(--ff-purple)]")}
                      />
                    </span>

                    {/* Başlık + açıklama */}
                    <h3
                      className={cn(
                        "mt-5 font-display text-xl font-bold tracking-tight",
                        service.coverImage ? "text-white" : "text-[var(--foreground)]",
                      )}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-[13px] leading-relaxed line-clamp-2",
                        service.coverImage ? "text-white/75" : "text-[var(--foreground-muted)]",
                      )}
                    >
                      {service.description}
                    </p>

                    {/* Alt hizmetler — kompakt pill'ler */}
                    {subs.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {subs.slice(0, 4).map((sub) => (
                          <span
                            key={sub.href}
                            className={cn(
                              "ff-shape-button inline-flex items-center px-2.5 py-1 text-[11px] font-medium transition-colors duration-200",
                              service.coverImage
                                ? "bg-white/10 text-white/85 group-hover/card:bg-white/20"
                                : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] group-hover/card:border-[var(--ff-purple)]/40 group-hover/card:text-[var(--foreground)]",
                            )}
                          >
                            {sub.label}
                          </span>
                        ))}
                        {subs.length > 4 && (
                          <span
                            className={cn(
                              "inline-flex items-center px-1.5 py-1 text-[11px] font-semibold",
                              service.coverImage ? "text-white/70" : "text-[var(--foreground-faint)]",
                            )}
                          >
                            +{subs.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Keşfet — hover'da kayarak gelir */}
                    <span
                      className={cn(
                        "mt-auto pt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide",
                        "transition-all duration-300 md:translate-y-1 md:opacity-0",
                        "md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100",
                        service.coverImage ? "text-white" : "text-[var(--ff-purple)]",
                      )}
                    >
                      Keşfet
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                    </span>
                  </div>
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
