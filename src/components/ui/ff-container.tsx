"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Border variants ───────────────────────────────
const borderVariants: Record<string, string> = {
  none:     "border-0",
  subtle:   "border border-[var(--border)]",
  purple:   "border border-[rgba(255, 79, 216,0.35)]",
  charcoal: "border border-[#323232]",
  white:    "border border-white/20",
}

// ── Background variants ───────────────────────────
const bgVariants: Record<string, string> = {
  default:  "bg-[var(--surface-elevated)]",
  dark:     "bg-[#111111]",
  charcoal: "bg-[#323232]",
  purple:   "bg-[rgba(255, 79, 216,0.08)]",
  glass:    "bg-white/5 backdrop-blur-sm",
  transparent: "bg-transparent",
}

// ── Padding variants ──────────────────────────────
const paddingVariants: Record<string, string> = {
  none: "p-0",
  xs:   "p-3",
  sm:   "p-4 md:p-5",
  md:   "p-5 md:p-6",
  lg:   "p-6 md:p-8",
  xl:   "p-8 md:p-12",
}

export interface FFContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: keyof typeof borderVariants
  bg?: keyof typeof bgVariants
  padding?: keyof typeof paddingVariants
  glow?: boolean          // purple glow effect
  hoverGlow?: boolean     // glow on hover
  noise?: boolean         // noise texture overlay
  animated?: boolean      // framer motion wrapper
  as?: "div" | "section" | "article" | "aside"
}

const FFContainer = React.forwardRef<HTMLDivElement, FFContainerProps>(
  (
    {
      border = "subtle",
      bg = "default",
      padding = "md",
      glow = false,
      hoverGlow = false,
      noise = false,
      animated = false,
      as: Tag = "div",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "relative transition-shadow duration-300",
      // Theme-aware shape (sharp by default, rounded/hex/bevel from active theme)
      "ff-shape-container",
      borderVariants[border],
      bgVariants[bg],
      paddingVariants[padding],
      glow && "shadow-[0_0_30px_rgba(255, 79, 216,0.25)]",
      hoverGlow && "hover:shadow-[0_0_30px_rgba(255, 79, 216,0.25)] hover:border-[rgba(255, 79, 216,0.35)]",
      className
    )

    const inner = (
      <>
        {noise && (
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "128px 128px",
            }}
          />
        )}
        <span className="relative z-[1]">{children}</span>
      </>
    )

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          {...(props as HTMLMotionProps<"div">)}
        >
          {inner}
        </motion.div>
      )
    }

    return (
      <Tag ref={ref} className={baseClasses} {...props}>
        {inner}
      </Tag>
    )
  }
)
FFContainer.displayName = "FFContainer"

// ── FFCard shorthand ──────────────────────────────
export interface FFCardProps extends FFContainerProps {
  hover?: boolean
}

const FFCard = React.forwardRef<HTMLDivElement, FFCardProps>(
  ({ hover = true, className, ...props }, ref) => (
    <FFContainer
      ref={ref}
      border="subtle"
      bg="default"
      padding="md"
      hoverGlow={hover}
      className={cn(
        "cursor-default",
        hover && "hover:border-[rgba(255, 79, 216,0.35)] transition-all duration-300",
        className
      )}
      {...props}
    />
  )
)
FFCard.displayName = "FFCard"

// ── FFSection shorthand ───────────────────────────
export const FFSection = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { tight?: boolean }
>(({ tight, className, children, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      tight ? "py-12 md:py-16" : "py-20 md:py-28",
      className
    )}
    {...props}
  >
    {children}
  </section>
))
FFSection.displayName = "FFSection"

export { FFContainer, FFCard }
