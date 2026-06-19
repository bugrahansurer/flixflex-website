"use client"

import { motion } from "framer-motion"
import { FFStatCounter } from "@/components/ui"
import { Eyebrow } from "@/components/ui/eyebrow"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"

interface ResultStat {
  value: number
  suffix?: string
  prefix?: string
  label: string
  description?: string
}

interface ResultCounterProps {
  stats: ResultStat[]
  className?: string
}

export function ResultCounter({ stats, className }: ResultCounterProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={cn("space-y-10", className)}
    >
      {/* Section label */}
      <motion.div variants={fadeInUp}>
        <Eyebrow className="mb-3">Ölçülebilir Sonuçlar</Eyebrow>
        <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
          Rakamlar{" "}
          <span className="text-[var(--ff-purple)]">her şeyi anlatır.</span>
        </h2>
        <p className="mt-3 text-[var(--foreground-muted)] text-base max-w-xl leading-relaxed">
          Bu projenin kampanya döneminde elde ettiği ölçülebilir performans sonuçları.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <FFStatCounter stats={stats} variant="grid" />
      </motion.div>
    </motion.div>
  )
}
