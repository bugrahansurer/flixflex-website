// ═══════════════════════════════════════════════════════════
// FlixFlex — Eyebrow
//
// The single source of truth for section over-labels ("eyebrows").
// Replaces the old `— Text —` dash-wrapped pattern with a cleaner
// modern treatment: a short accent rule followed by an uppercase,
// letter-spaced label in the brand accent.
//
// Presentational only (no motion). Drop it inside an existing
// motion wrapper when you need it to participate in a stagger.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { cn } from "@/lib/utils"

interface EyebrowProps {
  children: React.ReactNode
  className?: string
  /** Center the rule + label (e.g. centered section headers). */
  align?: "left" | "center"
  /** Render as a different element when needed (default span). */
  as?: "span" | "p" | "div"
}

export function Eyebrow({ children, className, align = "left", as = "span" }: EyebrowProps) {
  const Tag = as
  return (
    <Tag
      className={cn(
        "items-center gap-2.5",
        // Center variant spans full width so the rule+label sit centered as
        // a unit; left variant shrinks to content.
        align === "center" ? "flex w-full justify-center" : "inline-flex",
        "text-[13px] font-semibold",
        "text-[var(--ff-purple)]",
        className
      )}
    >
      <span
        aria-hidden
        className="h-px w-7 shrink-0 bg-gradient-to-r from-[var(--ff-purple)] to-[var(--ff-purple)]/0"
      />
      {children}
    </Tag>
  )
}
