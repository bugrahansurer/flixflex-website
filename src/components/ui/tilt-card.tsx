"use client"

import { useRef, useState, useCallback } from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type HtmlTag = keyof React.JSX.IntrinsicElements

export interface TiltCardProps {
  /** Render as semantic element */
  as?: HtmlTag
  /** Visual variant — "glass" adds ff-shape-container + purple hover glow */
  variant?: "default" | "glass"
  /** Maximum tilt angle in degrees */
  tiltLimit?: number
  /** Scale factor on hover */
  scale?: number
  /** Perspective distance in pixels */
  perspective?: number
  /** Tilt direction: "gravitate" follows cursor, "evade" tilts away */
  effect?: "gravitate" | "evade"
  /** Show a spotlight that follows the cursor on hover */
  spotlight?: boolean
  /** href for anchor elements (when as="a") */
  href?: string
  /** Additional class name */
  className?: string
  /** Additional inline styles */
  style?: React.CSSProperties
  /** Card content */
  children?: React.ReactNode
}

const GLASS_CLASSES = [
  "ff-shape-container group flex flex-col",
  "bg-[var(--surface-elevated)]/10 backdrop-blur-sm border border-[var(--border)]/40",
  "transition-[border-color,box-shadow] duration-300",
  "hover:border-[var(--ff-purple)]/40",
  "hover:shadow-[0_8px_40px_rgba(255, 79, 216,0.12)]",
] as const

export function TiltCard({
  as: Tag = "div",
  variant = "default",
  tiltLimit = 8,
  scale = 1.02,
  perspective = 1000,
  effect = "gravitate",
  spotlight = true,
  href,
  className,
  style,
  children,
}: TiltCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const shouldReduce = prefersReducedMotion === true

  const identityTransform = shouldReduce
    ? "none"
    : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`

  const [transform, setTransform] = useState(identityTransform)
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const dir = effect === "evade" ? -1 : 1

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (shouldReduce) return
      const el = cardRef.current
      if (!el) return
      setIsLeaving(false)
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const xRot = (py - 0.5) * (tiltLimit * 2) * dir
      const yRot = (px - 0.5) * -(tiltLimit * 2) * dir
      setTransform(
        `perspective(${perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(${scale}, ${scale}, ${scale})`
      )
      if (spotlight) {
        setSpotlightPos({ x: px * 100, y: py * 100 })
      }
    },
    [tiltLimit, scale, perspective, dir, spotlight, shouldReduce]
  )

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true)
    setIsLeaving(false)
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (!shouldReduce) {
      setIsLeaving(true)
      setTransform(identityTransform)
    }
    setIsHovered(false)
  }, [identityTransform, shouldReduce])

  const isGlass = variant === "glass"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tag as React.ElementType<any>

  const extraProps: Record<string, unknown> = {}
  if (Tag === "a" && href) {
    extraProps.href = href
  }

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={cardRef as any}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "flex flex-col will-change-transform relative",
        isGlass && GLASS_CLASSES,
        className
      )}
      style={{
        transform,
        transition: shouldReduce
          ? "none"
          : isLeaving
            ? "transform 0.35s ease-out"
            : "none",
        transformStyle: "flat",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        ...style,
      }}
      {...extraProps}
    >
      {/* Spotlight overlay */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]"
        style={{ clipPath: "inherit" }}
      >
        {spotlight && !shouldReduce && (
          <div
            className="absolute w-[200%] h-[200%] rounded-full opacity-100 dark:opacity-50"
            style={{
              left: `${spotlightPos.x}%`,
              top: `${spotlightPos.y}%`,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 40%)",
              transition: "opacity 0.3s",
              opacity: isHovered ? 1 : 0,
            }}
          />
        )}
      </div>
      {children}
    </Component>
  )
}
