// ═══════════════════════════════════════════════════════════
// FlixFlex — Rate-limit profile registry
//
// Single source of truth for all rate-limit configurations.
// Every callsite references a named profile; literal numbers
// are forbidden at call sites.
//
// windowDuration: Upstash Duration string ("15 m", "1 m", …)
// windowMs:       Equivalent in milliseconds (used by the
//                 in-memory fallback path in limiter.ts)
// ═══════════════════════════════════════════════════════════

import type { Duration } from "@upstash/ratelimit"

export interface RateLimitProfile {
  /** Logical bucket name — becomes the Redis key prefix. */
  namespace: string
  /** Maximum requests allowed within the window. */
  max: number
  /** Window length as an Upstash Duration string (e.g. "1 m"). */
  windowDuration: Duration
  /** Window length in milliseconds — used by in-memory fallback. */
  windowMs: number
}

export const LOGIN: RateLimitProfile = {
  namespace:      "login",
  max:            10,
  windowDuration: "15 m",
  windowMs:       15 * 60 * 1_000,
}

// Secondary IP-only guard: prevents credential-stuffing via email rotation.
// An attacker rotating emails from a single IP would exhaust this bucket
// even though each per-IP:email bucket stays below its own threshold.
// 50 attempts / 15 min across ALL emails originating from the same IP.
export const LOGIN_IP: RateLimitProfile = {
  namespace:      "login-ip",
  max:            50,
  windowDuration: "15 m",
  windowMs:       15 * 60 * 1_000,
}

// Generic public-form guard (contact).
export const PUBLIC_FORM: RateLimitProfile = {
  namespace:      "contact",
  max:            3,
  windowDuration: "1 m",
  windowMs:       60_000,
}

// Appointment booking — deliberately separate namespace from contact so that
// a contact-form submission does not consume the appointment quota (and vice-versa),
// preventing a DoS amplification where spamming /api/contact silently blocks
// legitimate booking attempts.
export const APPOINTMENT: RateLimitProfile = {
  namespace:      "appointment",
  max:            3,
  windowDuration: "1 m",
  windowMs:       60_000,
}

export const AI: RateLimitProfile = {
  namespace:      "ai",
  max:            5,
  windowDuration: "1 m",
  windowMs:       60_000,
}

export const AI_PIPELINE: RateLimitProfile = {
  namespace:      "ai-pipeline",
  max:            3,
  windowDuration: "1 m",
  windowMs:       60_000,
}

export const TWO_FA_SETUP: RateLimitProfile = {
  namespace:      "2fa-setup",
  max:            5,
  windowDuration: "1 m",
  windowMs:       60_000,
}

export const TWO_FA_VERIFY: RateLimitProfile = {
  namespace:      "2fa-verify",
  max:            5,
  windowDuration: "1 m",
  windowMs:       60_000,
}

export const MEDIA_UPLOAD: RateLimitProfile = {
  namespace:      "media-upload",
  max:            10,
  windowDuration: "1 m",
  windowMs:       60_000,
}

// Analytics beacons are high-frequency (one per page view + one per unload),
// so the ceiling is generous — it only exists to stop a single IP flooding
// the collector. ~120 events/min comfortably covers real browsing.
export const ANALYTICS: RateLimitProfile = {
  namespace:      "analytics",
  max:            120,
  windowDuration: "1 m",
  windowMs:       60_000,
}
