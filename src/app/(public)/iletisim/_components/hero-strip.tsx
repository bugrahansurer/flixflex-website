"use client"

import { motion } from "framer-motion"
import { Clock } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { StarField } from "@/components/ui/star-field"

export function HeroStrip() {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        "pt-36 pb-20 md:pt-44 md:pb-24",
        "bg-[var(--background)] text-[var(--foreground)]"
      )}
    >
      {/* Background decorations */}
      <BackgroundPaths intensity="light" />

      {/* Purple aura */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[44rem] h-[44rem] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 79, 216,0.18) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeInUp}
            className={cn(
              "ff-shape-container inline-flex items-center gap-2 mb-8",
              "border border-[var(--ff-purple)]/30 bg-[var(--ff-purple)]/10",
              "px-3 py-1.5"
            )}
          >
            <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--ff-purple)]">
              İletişim
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            className={cn(
              "font-display font-extrabold leading-[0.95] tracking-tight",
              "mb-6",
              "text-[clamp(32px,4vw,68px)]"
            )}
          >
            Birlikte ne{" "}
            <span className="text-[var(--ff-purple)]">inşa</span>
            <br />
            edelim?
          </motion.h1>

          {/* Desc */}
          <motion.p
            variants={fadeInUp}
            className="max-w-2xl text-base md:text-xl leading-relaxed text-[var(--foreground-muted)] mb-10"
          >
            Her büyük kampanya bir brief ile başlar. Projenizi bizimle paylaşın,
            birlikte en güçlü stratejiyi inşa edelim.{" "}
            <span className="text-[var(--foreground)] font-medium">
              Sizi dinliyoruz.
            </span>
          </motion.p>

          {/* Response guarantee badge */}
          <motion.div
            variants={fadeInUp}
            className={cn(
              "ff-shape-container inline-flex items-center gap-3",
              "border border-[var(--border)] px-5 py-3",
              "bg-[var(--surface)]"
            )}
          >
            <Clock size={16} className="text-[var(--ff-purple)] shrink-0" />
            <div className="text-[12px]">
              <span className="font-semibold text-[var(--foreground)]">
                12 Saat
              </span>{" "}
              <span className="text-[var(--foreground-muted)]">
                içinde kesin yanıt veriyoruz · Farkımızı deneyimleyin.
              </span>
            </div>
            <span className="w-1.5 h-1.5 bg-[#16a34a] animate-pulse shrink-0" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
