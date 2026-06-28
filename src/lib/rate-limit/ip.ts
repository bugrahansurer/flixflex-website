// ═══════════════════════════════════════════════════════════
// FlixFlex — Client-IP extraction
//
// Spoof-resistant header priority order:
//   1. x-vercel-forwarded-for  (set by Vercel infrastructure, hard to spoof)
//   2. x-real-ip               (Nginx/upstream proxy)
//   3. x-forwarded-for         (first value only — untrusted in open proxies,
//                               but acceptable behind Vercel's infrastructure)
//   4. "unknown"               (safe sentinel — degrades to single shared bucket)
//
// NOTE: NextRequest.ip is NOT used — it is `undefined` in Next.js 16
// App Router (no longer populated by the framework).
// ═══════════════════════════════════════════════════════════

import type { NextRequest } from "next/server"

export function getClientIp(req: NextRequest | Request): string {
  const vercelForwarded = req.headers.get("x-vercel-forwarded-for")
  if (vercelForwarded) return vercelForwarded.split(",")[0].trim()

  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()

  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()

  return "unknown"
}
