"use client"

import * as React from "react"

interface UseFitTextOptions {
  /** Maximum number of lines the content may occupy. */
  targetLines: number
  /** Smallest allowed font size, in px. */
  min: number
  /** Largest allowed font size, in px. */
  max: number
  /**
   * Unitless line-height applied to the element so measurement is deterministic
   * (a `leading-*` class can be dropped by class-merging or fall back to the
   * font's loose "normal" metric, which corrupts line counting).
   */
  lineHeight?: number
  /** Extra deps that should force a re-fit (e.g. the text/media content). */
  deps?: React.DependencyList
}

/**
 * Auto-sizes a block of text so it fills *up to* `targetLines` lines: it finds
 * the LARGEST font-size within `[min, max]` whose content still wraps into at
 * most `targetLines` lines at the element's current width.
 *
 * Recomputes when the element's width changes, when web fonts finish loading,
 * and whenever `targetLines`/`min`/`max`/`deps` change — so the same element can
 * target different line counts on desktop vs mobile via a different `targetLines`.
 *
 * Returns a ref to attach to the text element plus the resolved font size (px),
 * which is `null` until measured so the caller can keep a CSS clamp fallback for
 * SSR / no-JS.
 *
 * Why it measures on a detached clone rather than the live element: the live
 * element is typically mid reveal-animation when fitting runs, and CSS
 * transforms on its children inflate `scrollHeight` (corrupting the line count),
 * while its flex width can still be settling. The clone is static, transform-
 * free, and pinned to the measured width, so line counting via
 * `scrollHeight / (lineHeight × size)` is exact and stable.
 */
export function useFitText<T extends HTMLElement = HTMLElement>({ targetLines, min, max, lineHeight = 1.05, deps = [] }: UseFitTextOptions) {
  const ref = React.useRef<T | null>(null)
  const [fontSize, setFontSize] = React.useState<number | null>(null)

  const fit = React.useCallback(() => {
    const el = ref.current
    if (!el) return

    const width = el.clientWidth
    // Not laid out yet — a later pass refits once it has a real width.
    if (width < 1) return

    // Build a static, transform-free measuring clone pinned to the real width.
    const clone = el.cloneNode(true) as HTMLElement
    Object.assign(clone.style, {
      position: "absolute",
      left: "-99999px",
      top: "0",
      visibility: "hidden",
      width: `${width}px`,
      maxWidth: "none",
      flex: "none",
      lineHeight: String(lineHeight),
      overflow: "hidden",
      transform: "none",
    })
    // Neutralise animation transforms and drop media sources (the wrapping is
    // driven by the capsule spans' own em sizing, so emptied media still
    // reserves the right space without triggering loads/decodes).
    clone.querySelectorAll<HTMLElement>("*").forEach((d) => {
      d.style.transform = "none"
    })
    clone.querySelectorAll("video, source, img").forEach((m) => m.removeAttribute("src"))
    document.body.appendChild(clone)

    const measureLines = (size: number): number => {
      clone.style.fontSize = `${size}px`
      return Math.max(1, Math.round(clone.scrollHeight / (lineHeight * size)))
    }

    // Binary search for the largest size that still fits within targetLines.
    let lo = min
    let hi = max
    let best = min
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2
      if (measureLines(mid) <= targetLines) {
        best = mid
        lo = mid
      } else {
        hi = mid
      }
      if (hi - lo < 0.5) break
    }

    document.body.removeChild(clone)

    el.style.lineHeight = String(lineHeight)
    el.style.fontSize = `${best}px`
    setFontSize(best)
  }, [targetLines, min, max, lineHeight])

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    let raf1 = 0
    let raf2 = 0
    let timer = 0

    // Defer two frames so the first authoritative pass runs against a settled
    // layout rather than a transient one.
    const schedule = () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(fit)
      })
    }

    fit()
    schedule()

    // Observe the element itself: its width tracks the real available space,
    // whereas an ancestor capped by `max-width` may not change with the viewport.
    let lastWidth = -1
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      if (Math.abs(w - lastWidth) < 0.5) return
      lastWidth = w
      window.clearTimeout(timer)
      timer = window.setTimeout(schedule, 100)
    })
    ro.observe(el)

    let cancelled = false
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) schedule()
      })
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.clearTimeout(timer)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, ...deps])

  return { ref, fontSize }
}
