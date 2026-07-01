"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Zap, Sparkles } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"

interface SideProps {
  word: string
  accent?: boolean
  title: string
  body: string
  bullets: string[]
  icon: React.ReactNode
  direction: "left" | "right"
}

function Side({ word, accent, title, body, bullets, icon, direction }: SideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative flex flex-col gap-6",
        direction === "left" ? "lg:pr-12 xl:pr-20" : "lg:pl-12 xl:pl-20",
        direction === "right" && "lg:items-end lg:text-right"
      )}
    >
      {/* Mega word */}
      <p
        className={cn(
          "font-display font-extrabold leading-[0.85] tracking-[-0.04em]",
          "text-[clamp(80px,14vw,200px)]",
          accent ? "text-[var(--ff-purple)]" : "text-[var(--foreground)]"
        )}
      >
        {word}
      </p>

      {/* Icon + title */}
      <div
        className={cn(
          "flex items-center gap-3",
          direction === "right" && "lg:flex-row-reverse"
        )}
      >
        <span
          className={cn(
            "ff-shape-button w-9 h-9 flex items-center justify-center",
            "border",
            accent
              ? "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]"
              : "bg-transparent text-[var(--foreground)] border-[var(--border-strong)]"
          )}
        >
          {icon}
        </span>
        <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </h3>
      </div>

      {/* Body */}
      <p className="text-[var(--foreground-muted)] text-base md:text-lg leading-relaxed max-w-md">
        {body}
      </p>

      {/* Bullets */}
      <ul
        className={cn(
          "flex flex-col gap-2.5",
          direction === "right" && "lg:items-end"
        )}
      >
        {bullets.map((b, i) => (
          <motion.li
            key={b}
            initial={{ opacity: 0, x: direction === "left" ? -10 : 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            className={cn(
              "flex items-center gap-2 text-sm",
              "text-[var(--foreground)]",
              direction === "right" && "lg:flex-row-reverse"
            )}
          >
            <span
              className={cn(
                "w-3 h-px",
                accent ? "bg-[var(--ff-purple)]" : "bg-[var(--foreground-muted)]"
              )}
            />
            <span className="uppercase tracking-[0.12em] text-xs">{b}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

// ── Pulse separator — animated line between FLIX & FLEX ──
function PulseSeparator() {
  return (
    <div
      aria-hidden
      className="absolute inset-y-0 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center pointer-events-none"
    >
      {/* Vertical line */}
      <div className="relative w-px flex-1 bg-[var(--border)]">
        {/* Saf CSS loop — React 19 Strict Mode'da framer repeat:Infinity güvenilir değil */}
        <span className="ff-brand-shimmer absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-[var(--ff-purple)] to-transparent" />
      </div>

      {/* Center node — statik 45° dönük, boxShadow nabzı saf CSS */}
      <div
        className={cn(
          "ff-brand-node-pulse absolute top-1/2 -translate-y-1/2",
          "w-12 h-12 flex items-center justify-center rotate-45",
          "bg-[var(--background)] border border-[var(--ff-purple)]"
        )}
      >
        <span
          className="text-[var(--ff-purple)] text-lg font-bold"
          style={{ transform: "rotate(-45deg)" }}
        >
          ×
        </span>
      </div>
    </div>
  )
}

export function BrandStorySection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Parallax split — left moves slightly left, right moves slightly right
  const leftX = useTransform(scrollYProgress, [0, 1], [0, -30])
  const rightX = useTransform(scrollYProgress, [0, 1], [0, 30])

  return (
    <section
      ref={ref}
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-24 md:py-40 overflow-hidden"
      )}
    >
      {/* Eyebrow */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 mb-16 md:mb-24 text-center">
        <Eyebrow align="center" className="mb-4">Markamızın iki kalbi</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight max-w-3xl mx-auto">
          The <span className="text-[var(--foreground)]">Flix</span>{" "}
          <span className="text-[var(--foreground-faint)]">&amp;</span>{" "}
          The <span className="text-[var(--ff-purple)]">Flex</span>
        </h2>
        <p className="mt-4 text-[var(--foreground-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          İki güç. Bir yöntem. FlixFlex&apos;i benzersiz kılan ikili.
        </p>
      </div>

      {/* Split content */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="relative grid lg:grid-cols-2 gap-16 lg:gap-0">
          <PulseSeparator />

          <motion.div style={{ x: leftX }}>
            <Side
              direction="left"
              word="FLIX"
              icon={<Zap size={16} />}
              title="Hızlı vuruş, viral etki."
              body="Trendleri yakalamak yetmez — yön vermek gerekir. Flix tarafı,
                pazarlamanın anlık reflekslerini, kültürle senkron yaratıcılığı ve
                cesur denemeleri temsil eder."
              bullets={[
                "Sosyal medya & content ops",
                "Trend gözleme · hızlı prodüksiyon",
                "Yaratıcı kampanyalar",
                "Topluluk büyütme",
              ]}
            />
          </motion.div>

          <motion.div style={{ x: rightX }}>
            <Side
              direction="right"
              accent
              word="FLEX"
              icon={<Sparkles size={16} />}
              title="Esnek altyapı, ölçeklenir güç."
              body="Tek seferlik viral değil — sürdürülebilir büyüme. Flex tarafı,
                ölçülebilir performans, çok kanallı strateji ve veri tabanlı
                karar mekanizmalarını temsil eder."
              bullets={[
                "Performans pazarlaması",
                "CRM · veri stratejisi",
                "Marka mimarisi",
                "MarTech otomasyonları",
              ]}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
