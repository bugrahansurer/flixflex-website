"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Manifesto (minimalist kinetik ifade)
// Eski 3 ekran dolduran dev kelime + ağır 3D char animasyonu yerine:
// tek görüşte okunan güçlü bir manifesto cümlesi. Kelime-kelime reveal
// (framer, tek-seferlik), vurgu kelimesi gradient, altında destek metni
// ve animasyonlu anahtar-kelime çipleri. Ambient arka plan saf CSS aurora
// (framer'ın repeat:Infinity loop'ları React 19 Strict Mode'da çalışmıyor).
// Kompakt (~1 ekran) → hızlı okunur, hızlı geçilir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"

interface ManifestoSectionProps {
  eyebrow?: string
  headline?: string
  highlight?: string
  description?: string
  keywords?: string[]
}

const EASE = [0.16, 1, 0.3, 1] as const

const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

function isHighlighted(word: string, highlight?: string): boolean {
  if (!highlight) return false
  const w = clean(word)
  return w.length > 0 && highlight.split(/\s+/).some((h) => clean(h) === w)
}

export function ManifestoSection({
  eyebrow = "Manifestomuz",
  headline = "Markaları domine eden fikirler üretiriz.",
  highlight = "domine",
  description = "Strateji, yaratıcılık ve teknolojiyi tek vuruşta birleştirir; markanı bir sonraki bölüme taşırız.",
  keywords = ["Hız", "Güç", "Esneklik"],
}: ManifestoSectionProps = {}) {
  const words = headline.trim().split(" ")

  return (
    <section className="relative flex min-h-[72svh] items-center overflow-hidden bg-[var(--background)] text-[var(--foreground)] py-24 md:py-28">
      {/* ── Ambient aurora (CSS) + maskeli grid ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="ff-hero-aurora-a absolute left-[12%] top-[-14%] h-[36rem] w-[36rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,79,216,0.16) 0%, transparent 62%)", filter: "blur(50px)" }}
        />
        <span
          className="ff-hero-aurora-b absolute right-[4%] bottom-[-16%] h-[30rem] w-[30rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(106,168,255,0.10) 0%, transparent 62%)", filter: "blur(60px)" }}
        />
        <span
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 78%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1080px] px-6 md:px-10 xl:px-16 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 flex justify-center"
        >
          <Eyebrow align="center">{eyebrow}</Eyebrow>
        </motion.div>

        {/* Manifesto cümlesi — kelime-kelime reveal, vurgu gradient */}
        <h2 className="font-display font-extrabold leading-[1.06] tracking-[-0.02em] text-[clamp(30px,5.4vw,68px)]">
          {words.map((w, i) => (
            <span
              key={i}
              className={cn("inline-block overflow-hidden align-bottom", i < words.length - 1 && "mr-[0.26em]")}
              style={{ paddingBottom: "0.08em" }}
            >
              <motion.span
                className={cn("inline-block", isHighlighted(w, highlight) && "ff-hero-gradient-text")}
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.65, delay: 0.1 + i * 0.05, ease: EASE }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* Destek metni */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mx-auto mt-7 max-w-2xl text-base md:text-lg leading-relaxed text-[var(--foreground-muted)]"
          >
            {description}
          </motion.p>
        )}

        {/* Anahtar-kelime çipleri */}
        {keywords.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {keywords.map((k, i) => (
              <motion.span
                key={k}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.55 + i * 0.1, ease: EASE }}
                className="ff-shape-container inline-flex items-center gap-2 border border-[var(--ff-purple)]/30 bg-[var(--ff-purple)]/[0.06] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
              >
                <span className="ff-hero-dot h-1.5 w-1.5 rounded-full bg-[var(--ff-purple)]" />
                {k}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
