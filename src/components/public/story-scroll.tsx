"use client"

import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

// Register ScrollTrigger (idempotent — safe to call multiple times)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// ═══════════════════════════════════════════════════════════
// StoryScroll — GSAP ScrollTrigger 3D section transition wrapper
//
// Wraps child sections with `data-flow-section` attributes.
// Each section receives:
//   - z-index ordering (stacking)
//   - 3D rotation entry (first section excluded)
//   - Pin effect while next section overlaps (last section excluded)
//
// Respects `prefers-reduced-motion: reduce`.
// ═══════════════════════════════════════════════════════════

interface StoryScrollProps {
  children: React.ReactNode
  className?: string
  "aria-label"?: string
}

export function StoryScroll({
  children,
  className,
  "aria-label": ariaLabel,
}: StoryScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const childArray = React.Children.toArray(children)

  React.useLayoutEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReducedMotion || !containerRef.current) return

    const sections = containerRef.current.querySelectorAll<HTMLElement>(
      "[data-flow-section]",
    )
    if (sections.length === 0) return

    const triggers: ScrollTrigger[] = []

    sections.forEach((section, i) => {
      // Stack sections with increasing z-index
      gsap.set(section, { zIndex: i + 1 })

      // Every section except the first gets a 3D rotation entry
      const inner = section.firstElementChild as HTMLElement | null
      if (inner && i > 0) {
        gsap.set(inner, { rotation: 30, transformOrigin: "bottom left" })

        const rotationTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          animation: gsap.to(inner, { rotation: 0, ease: "none" }),
        })
        triggers.push(rotationTrigger)
      }

      // Every section except the last gets pinned so the next can overlap
      if (i < sections.length - 1) {
        const pinTrigger = ScrollTrigger.create({
          trigger: section,
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
        })
        triggers.push(pinTrigger)
      }
    })

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [childArray.length])

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      aria-label={ariaLabel}
    >
      {childArray.map((child, i) => (
        <div key={i} data-flow-section>
          {child}
        </div>
      ))}
    </div>
  )
}
