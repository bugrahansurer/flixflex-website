"use client"

import { useScroll, useTransform, MotionValue } from "framer-motion"
import * as React from "react"

export interface UseParallaxOptions {
  speed?: number        // Parallax intensity (default: 0.5)
  direction?: 1 | -1    // Direction (1 for standard scroll offset, -1 for opposite)
  range?: [number, number] // Pixel translation range (default: [-80, 80])
}

/**
 * useParallax
 * High-performance hook for computing viewport-relative scroll transforms.
 * Maps the target element's entry-to-exit lifecycle to a pixel shift.
 */
export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  options: UseParallaxOptions = {}
): MotionValue<number> {
  const { speed = 0.5, direction = 1, range = [-80, 80] } = options

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Map the 0-1 progress to smooth pixel offsets
  const startOffset = range[0] * speed * direction
  const endOffset = range[1] * speed * direction

  const y = useTransform(scrollYProgress, [0, 1], [startOffset, endOffset])

  return y
}
