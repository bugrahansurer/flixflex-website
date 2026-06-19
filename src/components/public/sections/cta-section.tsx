"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
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
