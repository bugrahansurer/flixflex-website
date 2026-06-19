// ═══════════════════════════════════════════════════════════
// FlixFlex — NextAuth.js v5 Catch-all Route Handler
//
// Exposes /api/auth/* endpoints (signin, signout, callback,
// session, csrf, providers, ...) by re-exporting the GET/POST
// handlers produced by `NextAuth({...})` in `@/lib/auth`.
//
// This file MUST live at `src/app/api/auth/[...nextauth]/route.ts`
// for Auth.js to receive the expected request paths.
// ═══════════════════════════════════════════════════════════

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// Next.js 16 — opt out of static optimisation for auth routes.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
