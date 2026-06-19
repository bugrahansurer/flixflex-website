"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SquarePen, FileText, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "@/lib/icons"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { TiltCard } from "@/components/ui/tilt-card"

// ── Counter hook (mirrors ff-stat-counter pattern) ─
function useCountUp(target: number, inView: boolean) {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    const duration = 1600
    const steps = 60
    const step = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return value
}

interface KpiItem {
  label: string
  value: number
  suffix: string
  icon: typeof SquarePen
  delta: string
  up: boolean | null
  deltaLabel: string
  color: string
}

const KPI_DATA: KpiItem[] = [
  {
    label: "Toplam Post",
    value: 48,
    suffix: "",
    icon: SquarePen,
    delta: "+6",
    up: true,
    deltaLabel: "bu ay",
    color: "var(--ff-purple)",
  },
  {
    label: "Toplam Sayfa",
    value: 12,
    suffix: "",
    icon: FileText,
    delta: "+2",
    up: true,
    deltaLabel: "bu hafta",
    color: "var(--ff-purple)",
  },
  {
    label: "Aktif Kullanıcı",
    value: 5,
    suffix: "",
    icon: Users,
    delta: "0",
    up: null,
    deltaLabel: "değişim yok",
    color: "var(--ff-purple)",
  },
  {
    label: "Bu Ay Trafik",
    value: 24800,
    suffix: "",
    icon: TrendingUp,
    delta: "+12%",
    up: true,
    deltaLabel: "geçen aya göre",
    color: "var(--ff-purple)",
  },
]

// ── Single KPI card ───────────────────────────────
function KpiCard({
  label, value, suffix, icon: Icon, delta, up, deltaLabel, color,
}: KpiItem) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 })
  const display = useCountUp(value, inView)

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
    >
      <TiltCard
        variant="glass"
        className="bg-[#f0f0f0] hover:bg-[#F7F7F5] border border-[#cccccc] p-3 overflow-hidden"
      >
        {/* Top purple accent on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-[#ff4fd8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon */}
        <div
          className="ff-shape-button bg-[#ff4fd8]/10 w-9 h-9 flex items-center justify-center mb-4"
          style={{ background: "rgba(255, 79, 216, 0.1)" }}
        >
          <Icon size={17} style={{ color }} />
        </div>

        {/* Value */}
        <p className="font-display text-3xl font-bold text-[#0d0d0d] leading-none tabular-nums">
          {display.toLocaleString("tr-TR")}{suffix}
        </p>

        {/* Label */}
        <p className="text-[11px] font-semibold text-[#888888] mt-2">
          {label}
        </p>

        {/* Delta */}
        <div className="flex items-center gap-1.5 mt-3">
          {up === true && <ArrowUpRight size={12} className="text-green-500" />}
          {up === false && <ArrowDownRight size={12} className="text-red-400" />}
          <span
            className={cn(
              "text-[11px] font-medium",
              up === true ? "text-green-500" :
                up === false ? "text-red-400" :
                  "text-[#888888]"
            )}
          >
            {delta}
          </span>
          <span className="text-[11px] text-[#888888]">{deltaLabel}</span>
        </div>
      </TiltCard>
    </motion.div>
  )
}

// ── KpiCards grid ─────────────────────────────────
export function KpiCards() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {KPI_DATA.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </motion.div>
  )
}
