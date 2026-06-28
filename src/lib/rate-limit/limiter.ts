// ═══════════════════════════════════════════════════════════
// FlixFlex — Core rate-limit checker
//
// checkLimit(profile, key) → Promise<RateLimitResult>
//
// Strategy:
//   • Redis available  → Upstash slidingWindow via per-profile
//     Ratelimit instances (lazily constructed and cached).
//   • Redis absent     → fixed-window in-memory store
//     (same logic as the old src/lib/rate-limit.ts, with
//     sweepExpired to bound memory growth).
//
// rateLimitResponse(result) — single canonical 429 builder.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { buildRatelimit } from "./client"
import type { RateLimitProfile } from "./profiles"

// ── Shared result type ─────────────────────────────────────
export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the current window resets (only when blocked). */
  retryAfter?: number
  /** Remaining requests in the current window. Always populated (min 0). */
  remaining: number
}

// ── 429 response builder ───────────────────────────────────
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const after = result.retryAfter ?? 60
  return NextResponse.json(
    {
      ok:      false,
      message: `Çok fazla istek. ${after} saniye sonra tekrar deneyin.`,
    },
    {
      status:  429,
      headers: { "Retry-After": String(after) },
    }
  )
}

// ── In-memory fallback store ───────────────────────────────
interface MemEntry {
  count:   number
  resetAt: number
}

// namespace → (key → entry)
const memStores = new Map<string, Map<string, MemEntry>>()

// Once a namespace map exceeds this size, sweep expired entries.
const SWEEP_THRESHOLD = 500

function getMemStore(namespace: string): Map<string, MemEntry> {
  let store = memStores.get(namespace)
  if (!store) {
    store = new Map<string, MemEntry>()
    memStores.set(namespace, store)
  }
  return store
}

function sweepExpired(store: Map<string, MemEntry>, now: number): void {
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k)
  }
}

function checkMemory(profile: RateLimitProfile, key: string): RateLimitResult {
  const { namespace, max, windowMs } = profile
  const now   = Date.now()
  const store = getMemStore(namespace)

  if (store.size > SWEEP_THRESHOLD) sweepExpired(store, now)

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1 }
  }

  if (entry.count >= max) {
    return {
      allowed:    false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1_000),
      remaining:  0,
    }
  }

  entry.count++
  return { allowed: true, remaining: max - entry.count }
}

// ── Per-profile Ratelimit instance cache ───────────────────
// Key: `${namespace}:${max}:${windowDuration}` — ensures that
// if two profiles share a namespace but different limits they
// each get their own limiter (defensive; current profiles all
// have unique namespaces).
const rlCache = new Map<string, ReturnType<typeof buildRatelimit>>()

function getRatelimit(profile: RateLimitProfile) {
  const cacheKey = `${profile.namespace}:${profile.max}:${profile.windowDuration}`
  if (!rlCache.has(cacheKey)) {
    rlCache.set(cacheKey, buildRatelimit(profile.max, profile.windowDuration))
  }
  return rlCache.get(cacheKey) ?? null
}

// ── Public API ─────────────────────────────────────────────
/**
 * Check the rate limit for `profile` against `key`.
 *
 * Uses Upstash sliding-window when Redis is configured; falls back
 * to the in-memory fixed-window store otherwise.
 *
 * @param profile - Named profile from `src/lib/rate-limit/profiles.ts`
 * @param key     - Per-caller identifier (IP address, userId, etc.)
 */
export async function checkLimit(
  profile: RateLimitProfile,
  key: string,
): Promise<RateLimitResult> {
  const rl = getRatelimit(profile)

  if (rl) {
    try {
      // Namespace the key so different profiles sharing the same Redis
      // instance never collide.
      const { success, reset, remaining } = await rl.limit(`${profile.namespace}:${key}`)
      return {
        allowed:    success,
        remaining:  Math.max(0, remaining),
        retryAfter: success ? undefined : Math.max(1, Math.ceil((reset - Date.now()) / 1_000)),
      }
    } catch (err) {
      // Redis error — fail-open: log and degrade to in-memory.
      console.warn("[rate-limit/limiter] Upstash error, falling back to in-memory:", err)
    }
  }

  // In-memory fallback (sync — wrapped in Promise for uniform API).
  return checkMemory(profile, key)
}
