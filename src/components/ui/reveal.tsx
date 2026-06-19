"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Reveal
//
// Lightweight scroll-reveal primitives. `Reveal` animates a single
// block in as it enters the viewport; `RevealGroup` + `RevealItem`
// stagger a set of children. Built on Motion's `whileInView` (no
// scroll listeners, no GSAP) and honors prefers-reduced-motion.
//
// Use for: section headers, feature lists, copy blocks — anything
// that should arrive with intent on scroll rather than pop in flat.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Entry delay in seconds. */
  delay?: number
  /** Travel distance in px (y axis). */
  y?: number
  as?: "div" | "span" | "li"
}

export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]
  return (
    <MotionTag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

// ── Staggered group ───────────────────────────────────────
const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

export function RevealGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={groupVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={cn(className)}>
      {children}
    </motion.div>
  )
}
