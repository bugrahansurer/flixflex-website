"use client"

import { useMediaQuery } from "./use-media-query"

/**
 * Returns `true` when the user has requested reduced motion via the
 * OS-level "prefers-reduced-motion" media feature.
 *
 * Thin wrapper around `useMediaQuery` so the same SSR-safe behaviour
 * is inherited (defaults to `false` before hydration).
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}
