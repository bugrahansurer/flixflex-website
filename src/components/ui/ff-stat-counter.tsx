"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

interface StatItem {
  value: number
  suffix?: string
  prefix?: string
  label: string
  description?: string
}

interface FFStatCounterProps {
  stats: StatItem[]
  className?: string
  variant?: "grid" | "row"
}

function Counter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(0)
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5 })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const step = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{display.toLocaleString("tr-TR")}{suffix}
    </span>
  )
}

export function FFStatCounter({ stats, className, variant = "grid" }: FFStatCounterProps) {
  return (
    <div
      className={cn(
        variant === "grid"
          ? "grid grid-cols-2 md:grid-cols-4 gap-2"
          : "flex flex-wrap",
        className
      )}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={cn(
            "ff-shape-container bg-[var(--background)] border border-[var(--border)] p-8 relative group",
            "hover:border-l-6 hover:border-l-[var(--ff-purple)]",
            "transition-all duration-300",
            variant === "row" && "flex-1 min-w-[180px]"
          )}
        >
          <p className="font-display text-4xl md:text-5xl font-bold text-[var(--secondary)] leading-none mb-2">
            <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
          </p>
          <p className="font-semibold text-[var(--foreground)] text-sm uppercase tracking-wider mb-1">
            {stat.label}
          </p>
          {stat.description && (
            <p className="text-xs text-[var(--foreground-faint)]">{stat.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
