"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { BackgroundPaths } from "@/components/ui"
import { StarField } from "@/components/ui/star-field"
import { cn } from "@/lib/utils"

// ── Character-by-character reveal ────────────────────
interface RevealWordProps {
  text: string
  color?: "white" | "purple" | "muted"
  baseDelay?: number
  charDelay?: number
}

function RevealWord({
  text,
  color = "white",
  baseDelay = 0,
  charDelay = 0.032,
}: RevealWordProps) {
  const colorClass = {
    white: "text-[var(--foreground)]",
    purple: "text-[var(--ff-purple)]",
    muted: "text-[var(--foreground-faint)]",
  }[color]

  return (
    <span className="inline-flex overflow-hidden">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className={cn("inline-block", colorClass)}
          initial={{ opacity: 0, y: 80, rotateX: -50 }}
          whileInView={{
            opacity: 1,
            y: 0,
            rotateX: 0,
          }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            delay: baseDelay + i * charDelay,
            type: "spring",
            stiffness: 160,
            damping: 18,
          }}
          style={{ transformOrigin: "50% 100% -20px" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

// ── Dot separator ─────────────────────────────────────
function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      aria-hidden
      className="inline-block mx-[0.2em] align-middle w-[0.14em] h-[0.14em] bg-[var(--ff-purple)] self-center shrink-0"
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{
        delay,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    />
  )
}

// ── Sub-tagline ───────────────────────────────────────
function SubTagline() {
  const words = [
    "Sıradan", "ajanslar", "takip", "eder.", " ",
    "FlixFlex", "yön", "verir."
  ]

  return (
    <p className="overflow-hidden font-display text-[clamp(14px,2vw,22px)] text-[var(--foreground-muted)]">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className={cn(
            "inline-block",
            word === " " ? "w-[1em]" : "mr-[0.35em]",
            i >= 5 ? "text-[var(--foreground)]" : ""
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{
            delay: 1.2 + i * 0.07,
            duration: 0.55,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}

// ── Eyebrow badge ─────────────────────────────────────
function EyebrowBadge({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "inline-flex items-center gap-2 mb-10 md:mb-14",
        "border border-[var(--ff-purple)]/30 bg-[var(--ff-purple)]/10",
        "px-4 py-2"
      )}
    >
      <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" />
      <span className="text-[10px] font-semibold text-[var(--ff-purple)]">
        {label}
      </span>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────
interface ManifestoSectionProps {
  eyebrow?: string
  line1?: string
  line2?: string
  line3?: string
}

export function ManifestoSection({ eyebrow, line1, line2, line3 }: ManifestoSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative min-h-[100svh] flex flex-col items-center justify-center",
        "bg-[var(--background)] text-[var(--foreground)]",
        "py-24 md:py-32 overflow-hidden"
      )}
    >
      {/* Background paths */}
      <BackgroundPaths intensity="medium" />

      {/* Purple aura — top left */}
      <div
        aria-hidden
        className="absolute -top-60 -left-60 w-[60rem] h-[60rem] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 79, 216,0.14) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      {/* Purple aura — bottom right */}
      <div
        aria-hidden
        className="absolute -bottom-40 -right-40 w-[50rem] h-[50rem] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 79, 216,0.10) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      {/* Content */}
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 w-full text-center">
        <EyebrowBadge label={eyebrow ?? "Manifestomuz"} />

        {/* Mega manifesto text */}
        <div
          className={cn(
            "font-display font-extrabold leading-[0.88]",
            "tracking-[-0.04em]",
            "text-[clamp(60px,15vw,280px)]",
            "select-none"
          )}
          style={{ perspective: "1000px" }}
          aria-label="Flix. Flex. Dominate."
        >
          {/* Line 1: FLIX */}
          <div className="block">
            <RevealWord text={line1 ?? "FLIX"} color="white" baseDelay={0.1} charDelay={0.038} />
          </div>

          {/* Separator row */}
          <div className="flex items-center justify-center gap-4 md:gap-8 my-[0.05em]">
            <Dot delay={0.5} />
            <RevealWord text={line2 ?? "FLEX"} color="purple" baseDelay={0.55} charDelay={0.038} />
            <Dot delay={0.85} />
          </div>

          {/* Line 3: DOMINATE */}
          <div className="block">
            <RevealWord text={line3 ?? "DOMINATE"} color="white" baseDelay={0.9} charDelay={0.028} />
          </div>
        </div>

        {/* Sub-tagline */}
        <div className="mt-10 md:mt-14">
          <SubTagline />
        </div>

        {/* Bottom line separator */}
        <motion.div
          className="mt-14 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[var(--ff-purple)] to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </section>
  )
}
