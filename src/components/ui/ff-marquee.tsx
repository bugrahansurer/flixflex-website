"use client"

import { cn } from "@/lib/utils"

interface FFMarqueeProps {
  items: React.ReactNode[]
  speed?: number  // px/s
  direction?: "left" | "right"
  className?: string
  gap?: number
}

// Sonsuz yatay kayan şerit — logolar, taglar vs.
// Saf CSS: içerik 2x render edilir, track translateX(-50%) ile kusursuz döngü yapar.
// (React 19 Strict Mode'da framer'ın repeat:Infinity loop'ları güvenilir değil.)
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
      <div
        className={cn(
          "flex shrink-0 w-max",
          direction === "left" ? "ff-marquee-track" : "ff-marquee-track-reverse"
        )}
        style={{ gap, ["--ff-marquee-dur" as string]: `${duration}s` }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="shrink-0">
            {item}
          </div>
        ))}
      </div>
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
