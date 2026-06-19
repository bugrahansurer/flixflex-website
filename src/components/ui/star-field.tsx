"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — StarField
//
// Animated "deep space" background: drifting, twinkling stars on a
// transparent canvas. Drop it as an absolutely-positioned layer
// behind dark section content (replaces the old grid pattern).
//
// • Canvas + requestAnimationFrame, DPR-aware, ResizeObserver.
// • Pauses when scrolled off-screen (IntersectionObserver) to save CPU.
// • Respects prefers-reduced-motion (renders a single static frame).
// • A fraction of stars are tinted with the theme accent (--ff-purple).
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { cn } from "@/lib/utils"

interface StarFieldProps {
  className?: string
  /** Approx stars per pixel² (default tuned for a subtle field). */
  density?: number
  /** Drift speed multiplier. */
  speed?: number
  /** Toggle the twinkle (opacity pulse). */
  twinkle?: boolean
}

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  phase: number
  twSpeed: number
  vx: number
  vy: number
  accent: boolean
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const n = parseInt(h, 16)
  if (Number.isNaN(n) || h.length !== 6) return [255, 79, 216] // fallback to brand pink
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function StarField({
  className,
  density = 0.00016,
  speed = 1,
  twinkle = true,
}: StarFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let stars: Star[] = []
    let raf: number | null = null
    let visible = true
    let t = 0

    const accentRgb = hexToRgb(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ff-purple")
        .trim() || "#FF4FD8"
    )

    const buildStars = () => {
      const count = Math.max(40, Math.min(420, Math.floor(width * height * density)))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * Math.random() * 1.6 + 0.3, // bias toward small
        baseAlpha: Math.random() * 0.55 + 0.25,
        phase: Math.random() * Math.PI * 2,
        twSpeed: Math.random() * 0.9 + 0.35,
        vx: (Math.random() - 0.5) * 0.05 * speed,
        vy: (-Math.random() * 0.06 - 0.01) * speed, // gentle upward drift
        accent: Math.random() < 0.16,
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width === 0 || height === 0) return
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildStars()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      for (const s of stars) {
        const alpha =
          twinkle && !prefersReduced
            ? s.baseAlpha * (0.5 + 0.5 * Math.sin(s.phase + t * s.twSpeed))
            : s.baseAlpha
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.accent
          ? `rgba(${accentRgb[0]},${accentRgb[1]},${accentRgb[2]},${alpha})`
          : `rgba(255,255,255,${alpha})`
        // soft glow for the brighter stars
        if (s.r > 1.1) {
          ctx.shadowBlur = 6
          ctx.shadowColor = s.accent
            ? `rgba(${accentRgb[0]},${accentRgb[1]},${accentRgb[2]},${alpha})`
            : `rgba(255,255,255,${alpha})`
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fill()
      }
      ctx.shadowBlur = 0
    }

    const loop = () => {
      t += 0.016
      for (const s of stars) {
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0) s.x = width
        else if (s.x > width) s.x = 0
        if (s.y < 0) s.y = height
        else if (s.y > height) s.y = 0
      }
      render()
      raf = requestAnimationFrame(loop)
    }

    resize()

    const start = () => {
      if (raf != null || prefersReduced) return
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf != null) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    if (prefersReduced) {
      render() // single static frame
    } else {
      start()
    }

    const ro = new ResizeObserver(() => {
      resize()
      if (prefersReduced) render()
    })
    ro.observe(canvas)

    // Pause the animation when the canvas isn't on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else stop()
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [density, speed, twinkle])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  )
}

export default StarField
