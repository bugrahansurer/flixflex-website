"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Magnetic
//
// Premium agency-style micro-interaction: the wrapped element is
// gently pulled toward the cursor while hovered, then springs back
// on leave. A subtle hover-lift + tactile press complete the feel.
//
// Performance: driven by Motion values (useMotionValue + useSpring),
// NOT React state — so it never re-renders the tree per pointer move
// and stays smooth on every frame. Honors prefers-reduced-motion
// (collapses to a plain, static wrapper).
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticProps {
  children: React.ReactNode
  /** Max pull distance in px toward the cursor. */
  strength?: number
  /** Subtle scale on hover (1 = none). */
  hoverScale?: number
  className?: string
}

export function Magnetic({
  children,
  strength = 16,
  hoverScale = 1.03,
  className,
}: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.35 })
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.35 })

  const handleMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const relX = e.clientX - (r.left + r.width / 2)
    const relY = e.clientY - (r.top + r.height / 2)
    mx.set((relX / (r.width / 2)) * strength)
    my.set((relY / (r.height / 2)) * strength)
  }

  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={reduce ? undefined : { x, y }}
      whileHover={reduce ? undefined : { scale: hoverScale }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  )
}
