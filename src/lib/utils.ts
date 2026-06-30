import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Builds an `aria-describedby` string for form fields.
 * - When there is an error, returns `${id}-error` only (hint is suppressed).
 * - When there is no error but a hint exists, returns `${id}-hint`.
 * - Returns `undefined` when neither is present.
 */
export function buildDescribedBy(
  id: string,
  hasError: boolean,
  hasHint: boolean,
): string | undefined {
  const parts: string[] = []
  if (hasError) parts.push(`${id}-error`)
  if (hasHint && !hasError) parts.push(`${id}-hint`)
  return parts.length > 0 ? parts.join(" ") : undefined
}

// ── String Utilities ──────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const TR_SLUG_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
}

/** Türkçe karakterleri sadeleştirip URL-güvenli slug üretir (ör. "Süper Admin" → "super-admin"). */
export function slugifyTr(str: string): string {
  return str
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_SLUG_MAP[ch] ?? ch)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trim() + '...'
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ── Date Utilities ────────────────────────────────
export function formatDate(date: Date | string, locale = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours   = Math.floor(minutes / 60)
  const days    = Math.floor(hours / 24)

  if (days > 7)    return formatDate(date)
  if (days > 0)    return `${days} gün önce`
  if (hours > 0)   return `${hours} saat önce`
  if (minutes > 0) return `${minutes} dakika önce`
  return 'Az önce'
}

// ── Number Utilities ──────────────────────────────
export function formatNumber(n: number, locale = 'tr-TR'): string {
  return new Intl.NumberFormat(locale).format(n)
}

export function readingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// ── Color Utilities ───────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// WCAG relative luminance
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// WCAG contrast ratio
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker  = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function checkWCAG(foreground: string, background: string) {
  const ratio = getContrastRatio(foreground, background)
  return {
    ratio:   parseFloat(ratio.toFixed(2)),
    aa:      ratio >= 4.5,   // Normal text
    aaLarge: ratio >= 3,     // Large text (18pt+ or 14pt+ bold)
    aaa:     ratio >= 7,     // Enhanced
  }
}

// ── Array Utilities ───────────────────────────────
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ── Environment ───────────────────────────────────
export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}
