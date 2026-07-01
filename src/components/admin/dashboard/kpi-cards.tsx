"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Eye, Users, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from "@/lib/icons"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"

// ── Counter hook ──────────────────────────────────
function useCountUp(target: number, inView: boolean) {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    // target === 0 resolves on the first tick (0 >= 0) — no special case needed.
    const duration = 1100
    const steps = 45
    const step = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])
  return value
}

export interface VisitsKpi {
  today: number
  todayDelta: number
  month: number
  monthDelta: number
  uniqueMonth: number
  avgDurationSec: number
}

function fmtDuration(sec: number): string {
  if (!sec || sec < 1) return "0sn"
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  if (m === 0) return `${s}sn`
  return `${m}dk ${s}sn`
}

interface CardDef {
  label: string
  value: number
  display?: (v: number) => string
  icon: typeof Eye
  delta?: number
  deltaLabel?: string
}

function KpiCard({ label, value, display, icon: Icon, delta, deltaLabel }: CardDef) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 })
  const animated = useCountUp(value, inView)
  const shown = display ? display(Math.round(animated)) : Math.round(animated).toLocaleString("tr-TR")
  const up = delta === undefined ? null : delta > 0 ? true : delta < 0 ? false : null

  return (
    <motion.div ref={ref} variants={fadeInUp} className="h-full">
      <div className="group relative h-full ff-shape-container ff-card p-4 overflow-hidden transition-colors duration-300 hover:border-[var(--ff-purple)]/40">
        <div className="absolute inset-x-0 top-0 h-px bg-[#ff4fd8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between mb-3">
          <div
            className="ff-shape-button w-8 h-8 flex items-center justify-center"
            style={{ background: "rgba(255, 79, 216, 0.1)" }}
          >
            <Icon size={15} className="text-[var(--ff-purple)]" />
          </div>
          {delta !== undefined && (
            <div className="flex items-center gap-1">
              {up === true && <ArrowUpRight size={12} className="text-green-500" />}
              {up === false && <ArrowDownRight size={12} className="text-red-400" />}
              <span className={cn(
                "text-[11px] font-semibold tabular-nums",
                up === true ? "text-green-500" : up === false ? "text-red-400" : "text-[#999999]"
              )}>
                {delta > 0 ? "+" : ""}{delta}%
              </span>
            </div>
          )}
        </div>
        <p className="font-display text-2xl font-bold text-[#0d0d0d] leading-none tabular-nums">
          {shown}
        </p>
        <p className="text-[11px] font-semibold text-[#888888] mt-1.5">{label}</p>
        {deltaLabel && <p className="text-[10px] text-[#aaaaaa] mt-0.5">{deltaLabel}</p>}
      </div>
    </motion.div>
  )
}

export function KpiCards({ visits }: { visits: VisitsKpi }) {
  const cards: CardDef[] = [
    { label: "Bugün Ziyaret", value: visits.today, icon: Eye, delta: visits.todayDelta, deltaLabel: "düne göre" },
    { label: "Bu Ay Ziyaret", value: visits.month, icon: TrendingUp, delta: visits.monthDelta, deltaLabel: "geçen aya göre" },
    { label: "Tekil Ziyaretçi", value: visits.uniqueMonth, icon: Users, deltaLabel: "bu ay" },
    { label: "Ort. Süre", value: visits.avgDurationSec, display: (v) => fmtDuration(v), icon: Clock, deltaLabel: "sayfa başına" },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 xl:grid-cols-4 gap-3"
    >
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </motion.div>
  )
}
