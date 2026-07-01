"use client"

import React from "react"
import Link from "next/link"
import { motion, useReducedMotion, useInView } from "framer-motion"
import { ArrowUpRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { BackgroundPaths } from "@/components/ui/background-paths"
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

// ── Geometric grid overlay ─────────────────────────────────────
function GeometricGrid({ dark }: { dark: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(${dark ? "rgba(255, 79, 216,0.07)" : "rgba(255, 79, 216,0.05)"
          } 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255, 79, 216,0.07)" : "rgba(255, 79, 216,0.05)"
          } 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    />
  )
}

// ── Purple aura blobs ──────────────────────────────────────────
// Minimal, modern accents tucked into the corners — no large central blob.
function AuraBlobs({ dark }: { dark: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,79,216,${dark ? "0.12" : "0.06"}) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-20 right-8 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,79,216,${dark ? "0.08" : "0.04"}) 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
      />
    </>
  )
}

// ── Corner accent marks ────────────────────────────────────────
function CornerAccents() {
  const corners = [
    "top-0 left-0",
    "top-0 right-0 rotate-90",
    "bottom-0 right-0 rotate-180",
    "bottom-0 left-0 -rotate-90",
  ]
  return (
    <>
      {corners.map((cls, i) => (
        <span
          key={i}
          aria-hidden
          className={cn("absolute w-5 h-5 pointer-events-none", cls)}
          style={{
            borderTop: "1px solid rgba(255, 79, 216,0.45)",
            borderLeft: "1px solid rgba(255, 79, 216,0.45)",
          }}
        />
      ))}
    </>
  )
}

// ── Growth grafiği — büyümeyi ima eden zarif ambient katman ─────
// Yükselen çizgi görünüme girince çizilir (framer pathLength — tek seferlik,
// loop değil), altında yumuşak alan dolgusu, ucunda nabız atan zirve noktası.
function GrowthGraph({ dark }: { dark: boolean }) {
  const reduce = useReducedMotion()
  const line =
    "M0,368 C220,352 340,318 470,268 C610,214 740,150 870,112 C980,84 1050,64 1130,46"
  const area = `${line} L1130,400 L0,400 Z`
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] pointer-events-none overflow-hidden">
      <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="h-full w-full" style={{ opacity: dark ? 0.75 : 0.6 }}>
        <defs>
          <linearGradient id="ff-cta-growth-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,79,216,0.16)" />
            <stop offset="100%" stopColor="rgba(255,79,216,0)" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#ff-cta-growth-area)"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="rgba(255,79,216,0.6)"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {/* Zirve noktası — çizgi ucunda (~94% w, 11% h) */}
      <span className="ff-cta-peak absolute" style={{ left: "93.2%", top: "9%" }}>
        <span className="block h-2.5 w-2.5 rounded-full" style={{ background: "#FF4FD8", boxShadow: "0 0 14px 3px rgba(255,79,216,0.6)" }} />
      </span>
    </div>
  )
}

// ── Zirve sayacı — ince, büyümeyi ima eden +%340 rozet ──────────
function PeakCounter() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    let cur = 0
    const id = setInterval(() => {
      cur += 8
      if (cur >= 340) { cur = 340; clearInterval(id) }
      setN(cur)
    }, 22)
    return () => clearInterval(id)
  }, [inView])
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className={cn(
        "ff-shape-container pointer-events-none absolute right-6 md:right-10 top-[34%]",
        "flex items-center gap-1.5 px-2.5 py-1",
        "border border-[var(--ff-purple)]/30 bg-[var(--ff-purple)]/[0.08] backdrop-blur-md",
      )}
    >
      <ArrowUpRight size={12} className="text-[var(--ff-purple)]" />
      <span className="text-[11px] font-bold tabular-nums text-[var(--ff-purple)]">+{n}%</span>
      <span className="text-[10px] text-[var(--foreground-muted)]">büyüme</span>
    </motion.div>
  )
}

// ── CTASection ─────────────────────────────────────────────────
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
        "relative overflow-hidden",
        "py-20 md:py-28",
        isDark
          ? "bg-[var(--background)] text-[var(--foreground)]"
          : "bg-[var(--surface)] text-[var(--foreground)]"
      )}
    >
      {/* Background layers — starfield on dark, grid on light */}
      {isDark ? <StarField className="z-0" /> : <GeometricGrid dark={isDark} />}
      <AuraBlobs dark={isDark} />
      {isDark && <BackgroundPaths intensity="light" />}

      {/* Growth grafiği — büyümeyi ima eden zarif ambient katman */}
      <GrowthGraph dark={isDark} />
      <PeakCounter />

      {/* Corner marks */}
      <div className="absolute inset-6 pointer-events-none">
        <CornerAccents />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow */}
          {eyebrow && (
            <motion.div variants={fadeInUp} className="mb-6">
              <Eyebrow align="center">{cleanEyebrow(eyebrow)}</Eyebrow>
            </motion.div>
          )}

          {/* Mega title */}
          <motion.h2
            variants={fadeInUp}
            className={cn(
              "font-display font-extrabold leading-[0.95] tracking-tight",
              "mb-8",
              isDark ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
            )}
            style={{
              fontSize: "clamp(24px, 3vw, 54px)",
            }}
          >
            {title}
          </motion.h2>

          {/* Description */}
          {description && (
            <motion.p
              variants={fadeInUp}
              className={cn(
                "text-base md:text-md leading-relaxed max-w-2xl mb-12",
                isDark ? "text-[var(--foreground-muted)]" : "text-[var(--foreground-muted)]"
              )}
            >
              {description}
            </motion.p>
          )}

          {/* CTA buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            {/* Primary CTA */}
            <Magnetic>
              <Link
                href={primaryCTA.href}
                className={cn(
                  "ff-shape-button",
                  "group inline-flex items-center justify-center gap-2.5",
                  "px-10 py-5 h-9 text-[15px] font-medium",
                  "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                  "hover:shadow-[0_8px_40px_rgba(255,79,216,0.5)]",
                  "transition-shadow duration-300 whitespace-nowrap"
                )}
              >
                {primaryCTA.label}
                <ArrowUpRight
                  size={16}
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>

            {/* Secondary CTA */}
            <Magnetic>
              <Link
                href={secondaryCTA.href}
                className={cn(
                  "ff-shape-button",
                  "group inline-flex items-center justify-center gap-2.5",
                  "px-10 py-5 h-9 text-[15px] font-medium",
                  "bg-transparent text-[var(--ff-purple)] border border-[var(--ff-purple)]",
                  "hover:bg-[var(--ff-purple)]/10",
                  "transition-colors duration-300 whitespace-nowrap"
                )}
              >
                {secondaryCTA.label}
                <ArrowUpRight
                  size={16}
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>
          </motion.div>

          {/* Animated status indicator */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center gap-2 text-[11px]"
            style={{
              color: isDark ? "var(--foreground-muted)" : "var(--foreground-muted)",
            }}
          >
            <span
              className="ff-shape-button w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse"
              aria-hidden
            />
            <span>Şu an müsaitiz · <span>İstanbul, Türkiye</span></span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
