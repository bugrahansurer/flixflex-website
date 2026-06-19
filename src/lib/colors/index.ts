// ═══════════════════════════════════════════════════════════
// FlixFlex — Color System Barrel Export
// ═══════════════════════════════════════════════════════════

export type { ColorTokens, ColorPalette } from "./types"
export { DEFAULT_PALETTES }               from "./defaults"
export { cssVarsFromPalette, paletteToStyleObject } from "./inject-css-vars"
export { ActivePaletteStyle }                  from "./palette-provider"
export { PaletteProvider, usePalette }         from "./palette-context"
