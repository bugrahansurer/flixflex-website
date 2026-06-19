"use client"

import * as React from "react"
import { motion, type Variants, useReducedMotion } from "framer-motion"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"

// ═══════════════════════════════════════════════════════════
// ScrollAnimation — Directional scroll-triggered reveal
// ═══════════════════════════════════════════════════════════

type Direction = "up" | "down" | "left" | "right"

interface ScrollAnimationProps {
  /** Entry direction (default: "down") */
  direction?: Direction
  /** Delay before animation starts in seconds (default: 0) */
  delay?: number
  /** Animation duration in seconds (default: 0.5) */
  duration?: number
  /** Apply blur→clear transition (default: true) */
  blur?: boolean
  /** Content to reveal */
  children: React.ReactNode
  /** Additional class name */
  className?: string
}

// ── Variant Factory ────────────────────────────────────────
function getVariants(
  direction: Direction,
  duration: number,
  blur: boolean,
  shouldReduce: boolean,
): Variants {
  const distance = shouldReduce ? 10 : 40
  const filterHidden = blur && !shouldReduce ? "blur(10px)" : "blur(0px)"
  const filterVisible = "blur(0px)"

  const hiddenState: Record<Direction, Record<string, unknown>> = {
    up:    { opacity: 0, y: distance, filter: filterHidden },
    down:  { opacity: 0, y: -distance, filter: filterHidden },
    left:  { opacity: 0, x: -distance, filter: filterHidden },
    right: { opacity: 0, x: distance, filter: filterHidden },
  }

  return {
    hidden: hiddenState[direction],
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: filterVisible,
      transition: {
        duration,
        ease: ease.entering,
      },
    },
  } as Variants
}

// ═══════════════════════════════════════════════════════════

export function ScrollAnimation({
  direction = "down",
  delay = 0,
  duration = 0.5,
  blur = true,
  children,
  className,
}: ScrollAnimationProps) {
  const shouldReduce = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    once: true,
  })

  const variants = React.useMemo(
    () => getVariants(direction, duration, blur, shouldReduce === true),
    [direction, duration, blur, shouldReduce],
  )

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
