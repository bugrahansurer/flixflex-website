"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — HeroSection (minimalist kinetik)
// Merkezi, cesur tipografi: lead satırı (framer kelime-kelime reveal) +
// değişen vurgu kelimesi (framer AnimatePresence — discrete geçiş, loop
// değil). Ambient arka plan saf CSS aurora'dır (framer'ın repeat:Infinity
// loop'ları React 19 Strict Mode'da çalışmadığı için). Sadeleştirilmiş:
// dashboard görseli / starfield kaldırıldı.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, Play } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Magnetic } from "@/components/ui/magnetic"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

const ROTATING = ["dijital güç", "kreatif vizyon", "ölçülebilir büyüme", "modern deneyim"]
const EASE = [0.16, 1, 0.3, 1] as const

const STATS = [
  { value: "150+", label: "Proje", accent: false },
  { value: "340%", label: "Ortalama Büyüme", accent: true },
  { value: "5 Yıl", label: "Deneyim", accent: false },
]

/** Lead satırını kelime-kelime maskeli yukarı-kaydırma ile açar (tek seferlik). */
function WordReveal({ text }: { text: string }) {
  const words = text.split(" ")
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: "0.08em" }}>
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: EASE }}
          >
            {w}{i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function HeroSection({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  const lead = title || "Markanı büyüten"
  const [wordIdx, setWordIdx] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className={cn(
        "relative min-h-[100svh] flex items-center justify-center overflow-hidden",
        "bg-[var(--background)] text-[var(--foreground)] pt-28 pb-24 md:pt-32",
      )}
    >
      {/* ── Ambient aurora (CSS) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="ff-hero-aurora-a absolute left-1/2 top-[-18%] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,79,216,0.20) 0%, transparent 62%)", filter: "blur(40px)" }}
        />
        <span
          className="ff-hero-aurora-b absolute right-[-10%] bottom-[-15%] h-[36rem] w-[36rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(106,168,255,0.14) 0%, transparent 62%)", filter: "blur(50px)" }}
        />
        {/* ince grid dokusu */}
        <span
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 42%, black 0%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 42%, black 0%, transparent 78%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center">
        {/* Headline: lead + değişen vurgu kelimesi */}
        <h1 className="font-display font-extrabold leading-[0.98] tracking-[-0.02em] text-[clamp(40px,7.5vw,92px)]">
          <WordReveal text={lead} />
          <span className="mt-1.5 flex items-center justify-center overflow-hidden" style={{ height: "1.12em" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIdx}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="ff-hero-gradient-text inline-block pb-2 md:pb-4"
              >
                {ROTATING[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mx-auto mt-7 max-w-xl text-base md:text-lg leading-relaxed text-[var(--foreground-muted)]"
        >
          {subtitle || "Strateji, yaratıcılık ve teknolojiyi tek vuruşta birleştiriyoruz. Markanın bir sonraki bölümünü birlikte yazalım."}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <Link
              href={primaryCta?.href || "/iletisim"}
              className="ff-shape-button group inline-flex items-center justify-center gap-2.5 border border-[var(--ff-purple-strong)] bg-[var(--ff-purple-strong)] px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-white transition-shadow duration-300 hover:shadow-[0_8px_36px_rgba(255,79,216,0.45)]"
            >
              {primaryCta?.label || "Keşfet"}
              <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href={secondaryCta?.href || "/portfolio"}
              className="ff-shape-button group inline-flex items-center justify-center gap-2.5 border border-[var(--ff-purple)] bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-[var(--ff-purple)] transition-colors duration-300 hover:bg-[var(--ff-purple)]/10"
            >
              <Play size={14} />
              {secondaryCta?.label || "Portfolyomuzu Gör"}
            </Link>
          </Magnetic>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-9"
        >
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <span className="h-7 w-px bg-[var(--border)]" />}
              <div className="flex items-baseline gap-2">
                <span className={cn("font-display text-2xl font-bold tracking-tight", s.accent ? "text-[var(--ff-purple)]" : "text-[var(--foreground)]")}>
                  {s.value}
                </span>
                <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--foreground-faint)]">{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-[var(--foreground-faint)]"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Kaydır</span>
        <span className="animate-bounce text-[var(--ff-purple)]">↓</span>
      </motion.div>
    </section>
  )
}
