"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { X, Check } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { DIFFERENTIATORS, type Differentiator } from "./about-data"

// ── Brand mark (inline, theme-safe, no link) ──────────
function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 shrink-0 bg-[var(--ff-purple-strong)] text-white font-bold text-[10px] md:text-xs tracking-tight">
        FF
      </span>
      <span className="font-display font-extrabold tracking-tight leading-none text-base md:text-lg text-[var(--foreground)]">
        Flix<span className="text-[var(--ff-purple)]">Flex</span>
      </span>
    </span>
  )
}

// ── VS comparison badge ───────────────────────────────
function VsBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center shrink-0",
        "w-9 h-9 md:w-11 md:h-11 rounded-full",
        "bg-[var(--ff-purple-strong)] text-white",
        "font-display font-extrabold text-[10px] md:text-xs tracking-tight",
        "shadow-[0_0_18px_rgba(255,79,216,0.5)]",
        className
      )}
    >
      VS
    </span>
  )
}

// ── Single comparison row ─────────────────────────────
function ComparisonRow({
  diff,
}: {
  diff: Differentiator
  index: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "group border-b border-[var(--border)] last:border-b-0",
        "py-4 md:py-0 transition-colors duration-200"
      )}
    >
      {/* Mobile-only topic chip (centered above the two sides) */}
      <div className="md:hidden flex justify-center mb-3">
        <span className="px-3 py-1 text-[11px] font-semibold bg-[var(--ff-purple)]/10 text-[var(--ff-purple)] whitespace-nowrap">
          {diff.topic}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-8 items-stretch">
        {/* ONLAR side */}
        <div
          className={cn(
            "flex items-center gap-3 md:py-6 md:pr-8",
            "transition-opacity duration-300 md:group-hover:opacity-60"
          )}
        >
          <span
            aria-hidden
            className="ff-shape-container shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--error)]/10 backdrop-blur-sm border-2 border-[var(--error)]/40 text-[var(--error)]"
          >
            <X size={12} strokeWidth={2.5} />
          </span>
          <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-snug">
            {diff.theirs}
          </p>
        </div>

        {/* Center topic divider — desktop only */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="w-px flex-1 bg-[var(--border)]" />
          <div
            className={cn(
              "flex items-center justify-center w-24 h-full py-2 shrink-0",
              "bg-[var(--ff-purple)]/10 backdrop-blur-sm"
            )}
          >
            <span className="text-xs md:text-sm font-semibold text-[var(--ff-purple)] whitespace-nowrap">
              {diff.topic}
            </span>
          </div>
          <div className="w-px flex-1 bg-[var(--border)]" />
        </div>

        {/* BİZ side */}
        <div className="flex items-center gap-3 md:py-6 md:pl-8">
          <span
            aria-hidden
            className={cn(
              "ff-shape-container shrink-0 w-6 h-6 flex items-center justify-center",
              "bg-[var(--secondary)]/10 border-2 border-[var(--secondary)]/40 text-[var(--secondary)]",
              "transition-[box-shadow] duration-300",
              "md:group-hover:shadow-[0_0_14px_rgba(255, 79, 216,0.5)]"
            )}
          >
            <Check size={12} strokeWidth={2.5} />
          </span>
          <p className="text-sm md:text-base text-[var(--foreground)] font-medium leading-snug">
            {diff.ours}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────
interface WhyUsSectionProps {
  eyebrow?: string
  headline?: string
  subheadline?: string
  items?: Differentiator[]
}

export function WhyUsSection({ eyebrow, headline, subheadline, items }: WhyUsSectionProps = {}) {
  const list = items && items.length > 0 ? items : DIFFERENTIATORS
  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden"
      )}
    >
      {/* Subtle purple left accent */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[40%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(255, 79, 216,0.04) 0%, transparent 100%)",
        }}
      />
      {/* Subtle purple right accent */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[40%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(255, 79, 216,0.06) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-14 md:mb-20 text-center"
        >
          <Eyebrow align="center" className="mb-4">{eyebrow ?? "Neden FlixFlex"}</Eyebrow>
          <h2
            className={cn(
              "font-display font-extrabold leading-[1.08] tracking-[-0.03em]",
              "text-[clamp(2rem,4.5vw,3.5rem)]",
              "text-[var(--foreground)]"
            )}
          >
            {headline ?? (
              <>
                Diğerleri vs.{" "}
                <span className="text-[var(--ff-purple)]">Biz</span>
              </>
            )}
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
            {subheadline ??
              "Piyasadaki ajanslardan nasıl ayrışıyoruz? Şeffaf, direkt ve ölçülebilir bir karşılaştırma."}
          </p>
        </motion.div>

        {/* Comparison rows */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={cn(
            "ff-shape-container px-4 md:px-6",
            "border-2 border-[var(--border)]",
            "divide-y-0",
            "bg-[var(--surface-elevated)]/20 backdrop-blur-sm",
          )}
        >
          {/* Column labels — header row (Diğer Ajanslar · VS · Logo) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8 py-5 md:py-6 border-b-2 border-[var(--border)]"
          >
            {/* Diğer Ajanslar */}
            <div className="flex items-center justify-center">
              <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.08em] text-[var(--foreground-faint)] text-center">
                Diğer Ajanslar
              </span>
            </div>
            {/* Center VS comparison badge */}
            <div className="flex items-center justify-center md:w-24">
              <VsBadge />
            </div>
            {/* FlixFlex logo */}
            <div className="flex items-center justify-center">
              <BrandMark />
            </div>
          </motion.div>

          {list.map((diff, i) => (
            <ComparisonRow key={diff.topic} diff={diff} index={i} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-14 md:mt-20 flex flex-col items-center gap-5 text-center"
        >
          <p className="text-base md:text-lg text-[var(--foreground-muted)] max-w-xl leading-relaxed">
            Markanız için doğru ortağı buldunuz. Bir adım atmak yeter.
          </p>
          <Link
            href="/iletisim"
            className={cn(
              "ff-shape-button",
              "group inline-flex items-center justify-center gap-2.5",
              "px-4 py-2 text-sm font-medium",
              "bg-[var(--ff-purple-strong)] text-white border border-[var(--ff-purple-strong)]",
              "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]",
              "hover:shadow-[0_4px_24px_rgba(255, 79, 216,0.45)]",
              "transition-all duration-200"
            )}
          >
            Ücretsiz Strateji Görüşmesi
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="square"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
