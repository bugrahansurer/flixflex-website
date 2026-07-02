"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { StarField } from "@/components/ui/star-field"
import { Magnetic } from "@/components/ui/magnetic"
import { Eyebrow } from "@/components/ui/eyebrow"
import { staggerContainer, fadeInUp } from "@/lib/animations"

// ── Types ──────────────────────────────────────────────────────
export interface CTASectionProps {
  eyebrow?: string
  title?: React.ReactNode
  description?: string
  primaryCTA?: { label: string; href: string }
  secondaryCTA?: { label: string; href: string }
  variant?: "dark" | "light"
}

// ── Defaults ───────────────────────────────────────────────────
const DEFAULT_TITLE: React.ReactNode = (
  <>
    Birlikte{" "}
    <span className="text-[var(--ff-purple)]">büyüyelim</span>{" "}
    mi?
  </>
)

const DEFAULT_EYEBROW = "Bir Sonraki Adım"

/** Strip the legacy `— … —` dash-wrapping from any eyebrow string. */
function cleanEyebrow(value: string): string {
  return value.replace(/^[\s—–-]+/, "").replace(/[\s—–-]+$/, "")
}

const DEFAULT_DESCRIPTION =
  "Bir sonraki bölümü birlikte yazalım. Brief'ini paylaş, hemen toplanalım."
const DEFAULT_PRIMARY_CTA = { label: "İletişime Geç", href: "/iletisim" }
const DEFAULT_SECONDARY_CTA = { label: "Portfolyoyu Gör", href: "/portfolio" }

// ── CTASection — modern, minimalist, kompakt ───────────────────
export function CTASection({
  eyebrow = DEFAULT_EYEBROW,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  primaryCTA = DEFAULT_PRIMARY_CTA,
  secondaryCTA = DEFAULT_SECONDARY_CTA,
  variant = "dark",
}: CTASectionProps) {
  const isDark = variant === "dark"

  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 md:py-20",
        isDark
          ? "bg-[var(--background)] text-[var(--foreground)]"
          : "bg-[var(--surface)] text-[var(--foreground)]"
      )}
    >
      {/* Sadece koyu varyantta hafif yıldız alanı — diğer katmanlar kaldırıldı */}
      {isDark && <StarField className="z-0" />}

      {/* Tek yumuşak mor hâle — merkeze doğru zarif vurgu */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] max-w-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,79,216,${isDark ? "0.08" : "0.05"}) 0%, transparent 68%)`,
          filter: "blur(60px)",
        }}
      />

      {/* İnce üst ayraç */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[var(--border)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 md:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center text-center"
        >
          {eyebrow && (
            <motion.div variants={fadeInUp} className="mb-5">
              <Eyebrow align="center">{cleanEyebrow(eyebrow)}</Eyebrow>
            </motion.div>
          )}

          <motion.h2
            variants={fadeInUp}
            className="font-display font-extrabold leading-[1.05] tracking-tight mb-5"
            style={{ fontSize: "clamp(24px, 2.4vw, 40px)" }}
          >
            {title}
          </motion.h2>

          {description && (
            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base leading-relaxed text-[var(--foreground-muted)] max-w-lg mb-8"
            >
              {description}
            </motion.p>
          )}

          {/* CTA buttons — kompakt */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <Magnetic>
              <Link
                href={primaryCTA.href}
                className={cn(
                  "ff-shape-button group inline-flex items-center justify-center gap-2",
                  "px-6 py-3 text-sm font-medium",
                  "bg-[var(--ff-purple-strong)] text-white border border-[var(--ff-purple-strong)]",
                  "hover:shadow-[0_6px_28px_rgba(255,79,216,0.35)]",
                  "transition-shadow duration-300 whitespace-nowrap"
                )}
              >
                {primaryCTA.label}
                <ArrowUpRight
                  size={15}
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>

            <Magnetic>
              <Link
                href={secondaryCTA.href}
                className={cn(
                  "ff-shape-button group inline-flex items-center justify-center gap-2",
                  "px-6 py-3 text-sm font-medium",
                  "text-[var(--ff-purple)] border border-[var(--ff-purple)]/40",
                  "hover:border-[var(--ff-purple)] hover:bg-[var(--ff-purple)]/8",
                  "transition-colors duration-300 whitespace-nowrap"
                )}
              >
                {secondaryCTA.label}
                <ArrowUpRight
                  size={15}
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>
          </motion.div>

          {/* Kompakt durum göstergesi */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]"
          >
            <span className="ff-shape-button w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" aria-hidden />
            <span>Şu an müsaitiz · İstanbul, Türkiye</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
