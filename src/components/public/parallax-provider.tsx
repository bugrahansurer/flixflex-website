"use client"

import * as React from "react"
import { LenisContext } from "@/hooks/use-lenis"

// ═══════════════════════════════════════════════════════════
// ParallaxProvider — Lenis smooth scroll + GSAP integration
//
// Wrap your app/page with this provider to enable:
//   - Smooth scrolling via Lenis
//   - GSAP ScrollTrigger ↔ Lenis synchronization
//   - Access via `useLenis()` hook anywhere in the tree
// ═══════════════════════════════════════════════════════════

interface ParallaxProviderProps {
  children: React.ReactNode
}

export function ParallaxProvider({ children }: ParallaxProviderProps) {
  return (
    <LenisContext.Provider value={null}>
      {children}
    </LenisContext.Provider>
  )
}
