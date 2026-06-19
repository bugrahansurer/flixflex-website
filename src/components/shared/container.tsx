import * as React from "react"
import { cn } from "@/lib/utils"

// ── Container — max-width wrapper ─────────────────
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const sizeMap = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-[1280px]",
  full: "max-w-none",
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "xl", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "w-full mx-auto px-6 md:px-10 xl:px-20",
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
)
Container.displayName = "Container"

// ── Grid — responsive grid helper ─────────────────
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: "sm" | "md" | "lg"
  mdCols?: 1 | 2 | 3 | 4 | 6
  lgCols?: 1 | 2 | 3 | 4 | 6
}

const colsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 6: "grid-cols-6", 12: "grid-cols-12",
}
const mdColsMap: Record<number, string> = {
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3",
  4: "md:grid-cols-4", 6: "md:grid-cols-6",
}
const lgColsMap: Record<number, string> = {
  1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3",
  4: "lg:grid-cols-4", 6: "lg:grid-cols-6",
}
const gapMap = { sm: "gap-4", md: "gap-6 md:gap-8", lg: "gap-8 md:gap-12" }

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, mdCols, lgCols, gap = "md", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid",
        colsMap[cols],
        mdCols && mdColsMap[mdCols],
        lgCols && lgColsMap[lgCols],
        gapMap[gap],
        className
      )}
      {...props}
    />
  )
)
Grid.displayName = "Grid"

// ── SectionHeader — standard section title block ──
interface SectionHeaderProps {
  badge?: string
  title: React.ReactNode
  subtitle?: string
  align?: "left" | "center"
  className?: string
  [key: string]: unknown
}

function SectionHeader({
  badge,
  title,
  subtitle,
  align = "center",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-14 md:mb-20",
        align === "center" ? "text-center" : "text-left",
        className
      )}
      {...props}
    >
      {badge && (
        <p className="mb-4 inline-flex text-[11px] font-semibold text-[var(--ff-purple)]">
          — {badge} —
        </p>
      )}
      <h2 className="font-display text-3xl md:text-5xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export { Container, Grid, SectionHeader }
