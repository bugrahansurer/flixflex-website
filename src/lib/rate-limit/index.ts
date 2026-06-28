// ═══════════════════════════════════════════════════════════
// FlixFlex — Rate-limit module public API
//
// All consumers import from "@/lib/rate-limit" — this barrel
// re-exports everything they need.  The old src/lib/rate-limit.ts
// import path continues to resolve here unchanged.
// ═══════════════════════════════════════════════════════════

export { checkLimit, rateLimitResponse }        from "./limiter"
export type { RateLimitResult }                 from "./limiter"
export { getClientIp }                          from "./ip"
export {
  LOGIN,
  LOGIN_IP,
  PUBLIC_FORM,
  APPOINTMENT,
  AI,
  AI_PIPELINE,
  TWO_FA_SETUP,
  TWO_FA_VERIFY,
  MEDIA_UPLOAD,
}                                               from "./profiles"
export type { RateLimitProfile }                from "./profiles"
