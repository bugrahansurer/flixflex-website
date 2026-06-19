"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FFMarqueeProps {
  items: React.ReactNode[]
  speed?: number  // px/s
  direction?: "left" | "right"
  className?: string
  gap?: number
}

// Sonsuz yatay kayan şerit — logolar, taglar vs.
export function FFMarquee({
  items,
  speed = 40,
  direction = "left",
  className,
  gap = 48,
}: FFMarqueeProps) {
  const doubled = [...items, ...items]  // Seamless loop için çift
  const duration = (items.length * 120) / speed

  return (
    <div className={cn("overflow-hidden flex", className)} aria-hidden>
      <motion.div
        className="flex shrink-0"
        style={{ gap }}
        animate={{ x: direction === "left" ? [0, -((items.length * 120) + gap * items.length)] : [0, ((items.length * 120) + gap * items.length)] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="shrink-0">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ── Logo/tech stack marquee item ──────────────────
export function MarqueeTag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5",
        "border border-[var(--border)] text-[var(--foreground-muted)]",
        "text-sm font-medium tracking-wide uppercase",
        "bg-[var(--surface)] whitespace-nowrap",
        className
      )}
    >
      {children}
    </span>
  )
}
