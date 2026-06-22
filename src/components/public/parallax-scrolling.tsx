"use client"

import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════
// ParallaxScrolling — multi-layered parallax section
//
// Layers move at different speeds relative to scroll position.
// Each layer is rendered as a full-bleed background image.
// An optional `children` slot renders on the topmost layer.
// ═══════════════════════════════════════════════════════════

export interface ParallaxLayer {
  imageUrl: string
  speed: number
  alt?: string
}

interface ParallaxScrollingProps {
  layers: ParallaxLayer[]
  children?: React.ReactNode
  className?: string
}

// ── Inner layer component (keeps hooks per-instance) ──────
function ParallaxLayerView({
  layer,
  index,
  scrollYProgress,
  zIndex,
}: {
  layer: ParallaxLayer
  index: number
  scrollYProgress: MotionValue<number>
  zIndex: number
}) {
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, layer.speed * 300],
  )
  return (
    <motion.div
      style={{ y, zIndex }}
      className="absolute inset-0 h-full w-full"
    >
      <Image
        src={layer.imageUrl}
        alt={layer.alt || `Parallax layer ${index + 1}`}
        fill
        sizes="100vw"
        className="object-cover"
        priority={index === 0}
      />
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────
export function ParallaxScrolling({
  layers,
  children,
  className,
}: ParallaxScrollingProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  if (!layers || layers.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={cn("relative h-screen overflow-hidden", className)}
      aria-label="Parallax scrolling section"
    >
      {layers.map((layer, index) => (
        <ParallaxLayerView
          key={index}
          layer={layer}
          index={index}
          scrollYProgress={scrollYProgress}
          zIndex={index}
        />
      ))}

      {/* Content slot — topmost layer */}
      {children && (
        <div
          className="relative z-50 flex h-full items-center justify-center"
          style={{ zIndex: layers.length }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
