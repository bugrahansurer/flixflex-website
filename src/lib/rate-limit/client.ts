// ═══════════════════════════════════════════════════════════
// FlixFlex — Upstash Redis + Ratelimit singleton
//
// Module-level singleton: constructed once per server process
// (or per cold start on serverless). Fails open — if Redis is
// unavailable at startup the module exports null so callers
// automatically fall back to the in-memory path in limiter.ts.
//
// Required env vars (both must be present):
//   UPSTASH_REDIS_REST_URL    — REST endpoint
//   UPSTASH_REDIS_REST_TOKEN  — Bearer token
//
// When either is absent the module exports null and the in-memory
// fallback is used. This is intentional: the app must work without
// Redis configured (local dev, preview deployments, etc.).
// ═══════════════════════════════════════════════════════════

import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Export type so limiter.ts can annotate its per-profile cache.
export type UpstashRatelimit = Ratelimit

// Returns a Ratelimit instance bound to its own slidingWindow config,
// or null if Upstash is not configured / fails to connect.
function buildRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  try {
    return new Redis({ url, token })
  } catch (err) {
    console.warn("[rate-limit/client] Failed to construct Redis client — falling back to in-memory:", err)
    return null
  }
}

// Singleton Redis client. null when Upstash is not configured.
export const redisClient: Redis | null = buildRedis()

// Factory: create a Ratelimit instance for a given sliding-window config.
// Returns null when Redis is unavailable.
export function buildRatelimit(
  max: number,
  windowDuration: Parameters<typeof Ratelimit.slidingWindow>[1],
): Ratelimit | null {
  if (!redisClient) return null

  try {
    return new Ratelimit({
      redis:  redisClient,
      limiter: Ratelimit.slidingWindow(max, windowDuration),
      // Avoid Analytics noise in logs when token is missing.
      analytics: false,
    })
  } catch (err) {
    console.warn("[rate-limit/client] Failed to construct Ratelimit — falling back to in-memory:", err)
    return null
  }
}
