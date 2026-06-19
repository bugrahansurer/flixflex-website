// ═══════════════════════════════════════════════════════════
// FlixFlex — Shared Rate Limiter
//
// A single fixed-window limiter used by all public endpoints
// (contact form, appointment booking). Consolidates what used to
// be three copy-pasted in-memory limiters and fixes a real leak:
// the old Maps never evicted expired entries, so they grew
// unbounded over a long-running process.
//
// ⚠️ SCOPE: this store is PER-INSTANCE (in-memory). On Vercel's
// serverless/Fluid runtime each instance has its own Map, so the
// effective limit is `max × instanceCount`. For strict global
// limits, set UPSTASH_REDIS_REST_URL + _TOKEN and swap the store
// for `@upstash/ratelimit` (the call sites below won't change —
// only this module).
// ═══════════════════════════════════════════════════════════

import type { NextRequest } from "next/server"

interface Entry {
  count: number
  resetAt: number
}

// namespace → (key → entry). Separate namespaces keep the contact
// and appointment buckets independent.
const stores = new Map<string, Map<string, Entry>>()

// Opportunistic cleanup: once a namespace map exceeds this many
// keys, sweep expired entries on the next write. Bounds memory.
const SWEEP_THRESHOLD = 500

function getStore(namespace: string): Map<string, Entry> {
  let store = stores.get(namespace)
  if (!store) {
    store = new Map<string, Entry>()
    stores.set(namespace, store)
  }
  return store
}

function sweepExpired(store: Map<string, Entry>, now: number): void {
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export interface RateLimitOptions {
  /** Logical bucket name, e.g. "contact" or "appointments". */
  namespace: string
  /** Per-key identifier — usually the client IP. */
  key: string
  /** Max requests allowed per window. */
  max: number
  /** Window length in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets (only when blocked). */
  retryAfter?: number
  /** Remaining requests in the current window. */
  remaining: number
}

/**
 * Fixed-window rate limit check. Records the request as part of the
 * check (call once per request).
 */
export function rateLimit({ namespace, key, max, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const store = getStore(namespace)

  if (store.size > SWEEP_THRESHOLD) sweepExpired(store, now)

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1 }
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000), remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: max - entry.count }
}

/**
 * Best-effort client IP extraction from proxy headers. Vercel sets
 * `x-forwarded-for` (client first in the comma list) and `x-real-ip`.
 * Falls back to "unknown" so a missing header degrades to a single
 * shared bucket rather than throwing.
 */
export function getClientIp(req: NextRequest | Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}
