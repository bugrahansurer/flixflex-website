"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Palette React Context (Client-only)
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import type { ColorPalette } from "./types"

export interface PaletteContextValue {
  palette: ColorPalette | null
  setPalette: (p: ColorPalette) => void
}

const PaletteContext = React.createContext<PaletteContextValue>({
  palette:    null,
  setPalette: () => undefined,
})

export function PaletteProvider({
  initial,
  children,
}: {
  initial: ColorPalette | null
  children: React.ReactNode
}) {
  const [palette, setPalette] = React.useState<ColorPalette | null>(initial)
  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      {children}
    </PaletteContext.Provider>
  )
}

export function usePalette(): PaletteContextValue {
  return React.useContext(PaletteContext)
}
