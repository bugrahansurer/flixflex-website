// ═══════════════════════════════════════════════════════════
// FlixFlex — Type-safe Environment Variables
//
// Zod ile çalışma zamanı doğrulama + TypeScript type-safety.
// Yanlış/eksik env varsa uygulama erken başarısız olur — production'da
// gizli config hatasının üretimde patlamasını önler.
//
// Kullanım:
//   import { env } from "@/lib/env"
//   env.DATABASE_URL  // string, validated
//   env.NEXTAUTH_SECRET  // string, validated
// ═══════════════════════════════════════════════════════════

import { z } from "zod"
import { normalizeDatabaseUrlEnv } from "@/lib/database-url"

// ── Server-only env schema ──────────────────────────────
// Bu değişkenler asla istemciye sızmaz (NEXT_PUBLIC_ prefix'siz)
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL geçerli bir URL olmalı (postgresql://...)")
    .optional(),
  POSTGRES_PRISMA_URL: z.string().url().optional(),
  PRISMA_DATABASE_URL: z.string().url().optional(),
  POSTGRES_URL: z.string().url().optional(),

  // Auth (STEP_06)
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET en az 32 karakter olmalı — `openssl rand -base64 32`")
    .optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // AI (STEP_08)
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith("sk-ant-", "Anthropic API key 'sk-ant-' ile başlamalı")
    .optional(),
  OPENAI_API_KEY: z.string().startsWith("sk-").optional(),
  GOOGLE_AI_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().startsWith("r8_").optional(),

  // Storage (STEP_08)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Email (STEP_05)
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Mux Media
  MUX_TOKEN_ID:     z.string().optional(),
  MUX_TOKEN_SECRET: z.string().optional(),
  // Mux webhook signing secret — production deployers MUST set this.
  // Kept optional so dev environments without webhook integration still build.
  MUX_WEBHOOK_SECRET: z.string().min(16).optional(),

  // Dev-only fallback admin credentials gate (see lib/auth/index.ts)
  NEXTAUTH_FALLBACK_ADMIN: z.string().optional(),

  // Vercel (otomatik)
  VERCEL_URL: z.string().optional(),
})

// ── Client-exposed env schema ───────────────────────────
// NEXT_PUBLIC_ prefix'li olanlar — istemciye gönderilebilir
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("FlixFlex"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
})

// ── Parse & cache ───────────────────────────────────────
// Sadece Node tarafında server schema'yı doğrula
const isServer = typeof window === "undefined"

if (isServer) {
  normalizeDatabaseUrlEnv()
}

// Boş string'leri undefined'a çevir — Vercel/Docker gibi platformlarda
// "tanımlanmış ama boş" env'ler yaygındır ve zod .optional() bunları
// gerçek değer sayıp pattern check'lerini tetikler. Bu helper bunu önler.
function stripEmpty(source: Record<string, string | undefined>): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const key in source) {
    const value = source[key]
    out[key] = value === "" ? undefined : value
  }
  return out
}

const _serverEnv = isServer
  ? serverSchema.safeParse(stripEmpty(process.env))
  : null

const _clientEnv = clientSchema.safeParse(stripEmpty({
  NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME:          process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_GA_ID:             process.env.NEXT_PUBLIC_GA_ID,
}))

function formatEnvErrors(
  fieldErrors: Record<string, string[] | undefined>,
  scope: "server" | "client",
): string {
  const missing: string[] = []
  const invalid: Array<{ key: string; messages: string[] }> = []
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (!messages || messages.length === 0) continue
    const isMissing = messages.some((m) =>
      /received undefined|Required|expected string, received undefined/i.test(m),
    )
    if (isMissing) missing.push(key)
    else invalid.push({ key, messages })
  }
  const isVercel = process.env.VERCEL === "1"
  const lines: string[] = []
  lines.push(`\n❌ Environment doğrulaması başarısız (${scope})`)
  if (missing.length > 0) {
    lines.push(`\n   Eksik (set edilmemiş) değişkenler:`)
    for (const key of missing) lines.push(`     • ${key}`)
  }
  if (invalid.length > 0) {
    lines.push(`\n   Geçersiz format:`)
    for (const { key, messages } of invalid) {
      lines.push(`     • ${key}: ${messages.join("; ")}`)
    }
  }
  lines.push("")
  if (isVercel) {
    lines.push("   📍 Vercel'de çalışıyorsunuz. Çözüm:")
    lines.push("      Vercel Dashboard → Project → Settings → Environment Variables")
    lines.push("      Eksik değişkenleri ekleyip Redeploy çalıştırın.")
  } else {
    lines.push("   📍 Lokal'de çalışıyorsunuz. Çözüm:")
    lines.push("      1. cp .env.example .env.local  (henüz yoksa)")
    lines.push("      2. .env.local'i açıp eksik değişkenleri doldurun")
  }
  lines.push("\n   Tüm gerekli değişkenler için: .env.example dosyasına bakın.")
  return lines.join("\n")
}

if (_serverEnv && !_serverEnv.success) {
  const fieldErrors = _serverEnv.error.flatten().fieldErrors
  console.error(formatEnvErrors(fieldErrors, "server"))
  throw new Error("Environment doğrulaması başarısız (server)")
}

if (!_clientEnv.success) {
  const fieldErrors = _clientEnv.error.flatten().fieldErrors
  console.error(formatEnvErrors(fieldErrors, "client"))
  throw new Error("Environment doğrulaması başarısız (client)")
}

// ── Typed env export ────────────────────────────────────
// Server tarafında server + client; client tarafında yalnız client
export const env = {
  ..._serverEnv?.data,
  ..._clientEnv.data,
} as (z.infer<typeof serverSchema> & z.infer<typeof clientSchema>)

// ── Helpers ─────────────────────────────────────────────
export const isProduction  = env.NODE_ENV === "production"
export const isDevelopment = env.NODE_ENV === "development"
export const isTest        = env.NODE_ENV === "test"

/** Hangi env değişkenlerinin set olduğunu kontrol et — feature flag mantığı */
export function hasEnv(key: keyof typeof env): boolean {
  return env[key] != null && env[key] !== ""
}
