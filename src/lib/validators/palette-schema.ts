// ═══════════════════════════════════════════════════════════
// FlixFlex — Palette Zod Schemas
// Shared between client (react-hook-form) and API routes.
//
// Accepts both:
//   • 6-digit hex   #RRGGBB  (case-insensitive)
//   • rgba()        rgba(r, g, b, a)
// ═══════════════════════════════════════════════════════════

import { z } from "zod"

const hexRegex = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/

// rgba(0-255, 0-255, 0-255, 0.0-1.0)
const rgbaRegex =
  /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/

const colorValue = z
  .string()
  .trim()
  .refine(
    (v) => hexRegex.test(v) || rgbaRegex.test(v),
    { message: "Geçersiz renk — #RRGGBB veya rgba(r,g,b,a) formatı gerekli" }
  )

// ── Dark sub-object ──────────────────────────────
const darkTokensSchema = z.object({
  background: colorValue,
  backgroundAlt: colorValue,
  surface: colorValue,
  surfaceElevated: colorValue,
  foreground: colorValue,
  foregroundMuted: colorValue,
  foregroundFaint: colorValue,
  border: colorValue,
  borderStrong: colorValue,
  // Optional dark-mode secondary overrides (fall back to light values).
  secondary: colorValue.optional(),
  secondaryLight: colorValue.optional(),
})

// ── Full ColorTokens schema ──────────────────────
export const colorTokensSchema = z.object({
  primary: colorValue,
  primaryHover: colorValue,
  primaryMuted: colorValue,
  primaryGlow: colorValue,
  secondary: colorValue,
  secondaryLight: colorValue,

  background: colorValue,
  backgroundAlt: colorValue,
  surface: colorValue,
  surfaceElevated: colorValue,
  foreground: colorValue,
  foregroundMuted: colorValue,
  foregroundFaint: colorValue,
  border: colorValue,
  borderStrong: colorValue,

  dark: darkTokensSchema,

  success: colorValue,
  warning: colorValue,
  error: colorValue,
})

// ── Theme settings (component-level theme choices) ──
export const themeSettingsSchema = z.object({
  headerVariant: z.enum(["classic", "hamburger"]),
  buttonShape: z.enum(["sharp", "rounded", "hex", "bevel"]),
  containerShape: z.enum(["sharp", "rounded", "hex", "bevel"]),
  mobileNavbar: z.boolean(),
  mobileNavbarVariant: z.enum(["dock", "minimal"]),
  fontBodySize: z.number().min(8).max(32).default(16),
  fontHeadingSize: z.number().min(12).max(120).default(32),
  buttonRadius: z.number().min(0).max(48).default(12),
  containerRadius: z.number().min(0).max(48).default(16),
})

// ── Font-name schema ─────────────────────────────
// SECURITY: font names are interpolated into CSS (`font-family`,
// `@font-face`) so they MUST be tightly constrained. The regex
// rejects quotes, semicolons, braces, parens — every char that
// could break out of a CSS string context.
const fontNameSchema = z
  .string()
  .regex(/^[A-Za-z0-9 _-]{1,64}$/, "Geçersiz font adı")

// ── Create palette ───────────────────────────────
export const createPaletteSchema = z.object({
  name: z
    .string()
    .min(2, "Tema Düzeni adı en az 2 karakter olmalı")
    .max(64, "Tema Düzeni adı en fazla 64 karakter olabilir")
    .trim(),
  description: z
    .string()
    .max(256, "Açıklama en fazla 256 karakter olabilir")
    .trim()
    .optional()
    .nullable(),
  colors: colorTokensSchema,
  settings: themeSettingsSchema.optional(),
  isActive: z.boolean().optional().default(false),
  isSystem: z.boolean().optional().default(false),
  fontDisplay: fontNameSchema.optional().default("Outfit"),
  fontBody:    fontNameSchema.optional().default("Inter"),
})

// ── Update palette ───────────────────────────────
export const updatePaletteSchema = z.object({
  name: z
    .string()
    .min(2, "Tema Düzeni adı en az 2 karakter olmalı")
    .max(64, "Tema Düzeni adı en fazla 64 karakter olabilir")
    .trim()
    .optional(),
  description: z
    .string()
    .max(256, "Açıklama en fazla 256 karakter olabilir")
    .trim()
    .optional()
    .nullable(),
  colors: colorTokensSchema.optional(),
  settings: themeSettingsSchema.optional(),
  fontDisplay: fontNameSchema.optional(),
  fontBody:    fontNameSchema.optional(),
})

export type ColorTokensData = z.infer<typeof colorTokensSchema>
export type CreatePaletteData = z.infer<typeof createPaletteSchema>
export type UpdatePaletteData = z.infer<typeof updatePaletteSchema>
