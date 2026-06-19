"use client"

import { createContext, useContext } from "react"

// ═══════════════════════════════════════════════════════════
// Lenis Context — shared Lenis instance across the tree
// ═══════════════════════════════════════════════════════════

/**
 * The Lenis instance type. We use `any` here to avoid importing
 * Lenis at the type level, keeping the hook SSR-safe.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LenisInstance = any

export const LenisContext = createContext<LenisInstance | null>(null)

/**
 * Access the shared Lenis instance provided by `<ParallaxProvider>`.
 * Returns `null` if no provider is present in the tree.
 */
export function useLenis(): LenisInstance | null {
  return useContext(LenisContext)
}
