"use client"

import * as React from "react"
import { useRef, useEffect } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion"
import { useMousePosition } from "@/hooks/use-mouse-position"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════
// ContainerTextScroll — 3D tilt text card with scroll + mouse
//
// Scroll animates: rotateY (tilt forward), scale, translateY
// Mouse adds subtle X/Y tilt for interactive depth
// ═══════════════════════════════════════════════════════════

interface ContainerTextScrollProps {
  /** Title rendered above the content card */
  titleComponent: React.ReactNode
  /** Body / media content inside the card */
  children: React.ReactNode
  /** Additional class name on the outer wrapper */
  className?: string
}

export function ContainerTextScroll({
  titleComponent,
  children,
  className,
}: ContainerTextScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const shouldReduce = useReducedMotion()

  // ── Scroll progress (container entry → exit) ────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // ── Mouse position (bridged React state → MotionValues) ─
  const { normalized } = useMousePosition(
    cardRef as React.RefObject<HTMLElement | null>,
  )

  const mouseXMv = useMotionValue(0)
  const mouseYMv = useMotionValue(0)

  useEffect(() => {
    mouseXMv.set(normalized.x)
    mouseYMv.set(normalized.y)
  }, [normalized.x, normalized.y, mouseXMv, mouseYMv])

  const springMouseX = useSpring(mouseXMv, { stiffness: 150, damping: 15 })
  const springMouseY = useSpring(mouseYMv, { stiffness: 150, damping: 15 })

  // ── Scroll-driven transforms ────────────────────────────
  const scrollRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -25])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9])
  const translateY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  // ── Mouse-driven tilt ───────────────────────────────────
  const mouseRotateX = useTransform(springMouseY, [-1, 1], [8, -8])
  const mouseRotateY = useTransform(springMouseX, [-1, 1], [-8, 8])

  // ── Combined rotateY (scroll + mouse) ───────────────────
  const finalRotateY = useTransform(
    [scrollRotateY, mouseRotateY],
    ([ry, rym]: number[]) => ry + rym,
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center py-20 md:py-32",
        className,
      )}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={cardRef}
        style={
          shouldReduce
            ? {}
            : {
                rotateX: mouseRotateX,
                rotateY: finalRotateY,
                scale,
                y: translateY,
                opacity,
              }
        }
        className={cn(
          "ff-shape-container relative w-full max-w-4xl mx-auto",
          "bg-[var(--surface-elevated)] border border-[rgba(255, 79, 216,0.25)]",
          "p-8 md:p-12 lg:p-16",
          // Purple glow border + depth shadow
          "shadow-[0_0_0_1px_rgba(255, 79, 216,0.15),0_20px_60px_rgba(255, 79, 216,0.08),0_40px_80px_rgba(0,0,0,0.3)]",
        )}
      >
        {/* ── Inner purple glow aura ─────────────────────── */}
        <div
          aria-hidden
          className="absolute -inset-1 rounded-[inherit] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255, 79, 216,0.06) 0%, transparent 70%)",
          }}
        />

        {/* ── Title ──────────────────────────────────────── */}
        <div className="relative z-10 mb-10 md:mb-16">
          {titleComponent}
        </div>

        {/* ── Content ────────────────────────────────────── */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  )
}
