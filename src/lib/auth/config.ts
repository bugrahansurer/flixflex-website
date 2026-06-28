// ═══════════════════════════════════════════════════════════
// FlixFlex — Auth Config (Edge-safe split)
//
// This module is the EDGE-SAFE half of the NextAuth config.
// It MUST NOT import anything that pulls in:
//   • prisma / @prisma/client / @auth/prisma-adapter
//   • bcryptjs
//   • the env.ts validator (which is fine here, but pulls zod
//     and may transitively bloat the edge bundle)
//
// The middleware imports this file and constructs its own
// lightweight NextAuth() instance using only these settings.
// The full server-side `auth()` (lib/auth/index.ts) extends
// this config with the Credentials provider + Prisma adapter.
//
// See: https://authjs.dev/guides/edge-compatibility
// ═══════════════════════════════════════════════════════════

import type { NextAuthConfig } from "next-auth"
import type { SessionPermission } from "@/lib/auth/types"

function deriveInitials(name: string | null | undefined, email: string): string {
  const source = (name && name.trim().length > 0 ? name : email).trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) {
    const w = parts[0]
    return (w[0] + (w[1] ?? "")).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const authConfig: NextAuthConfig = {
  // JWT sessions — required for Credentials + edge middleware.
  // maxAge is set to 30 days here (the "remember me" ceiling).
  // Sessions WITHOUT rememberMe are capped to 8 hours via token.exp
  // override in the jwt callback below — NextAuth v5 honours a short
  // token.exp even when maxAge is longer.
  session: {
    strategy: "jwt",
    maxAge:   60 * 60 * 24 * 30, // 30 days (remember-me ceiling)
  },

  // Brand-consistent custom pages (Turkish slugs).
  pages: {
    signIn: "/giris",
    error:  "/giris",
  },

  // Trust the Next.js host header in serverless/edge environments.
  trustHost: true,

  // Providers are added in the full config (lib/auth/index.ts).
  // The edge instance never invokes authorize() — it only decodes
  // the JWT to read session claims.
  providers: [],

  callbacks: {
    // JWT runs on sign-in and on every request (token refresh).
    // We embed roleId/roleName/permissions so middleware and RSC
    // can authorise without an extra DB hit.
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          roleId?: string
          roleName?: string
          permissions?: SessionPermission[]
          rememberMe?: boolean
        }
        if (u.id)          token.id          = u.id
        if (u.roleId)      token.roleId      = u.roleId
        if (u.roleName)    token.roleName    = u.roleName
        if (u.permissions) token.permissions = u.permissions
        // Persist the remember-me preference so it survives token refreshes.
        token.rememberMe = u.rememberMe ?? false
      }

      // Cap short-lived sessions to 8 hours.
      // Runs on EVERY jwt() invocation — not just sign-in — so that:
      //   1. Pre-existing sessions (token.rememberMe === undefined, issued
      //      before this feature was added) are treated as non-rememberMe
      //      rather than silently inheriting the new 30-day maxAge ceiling.
      //   2. The 8-hour window is anchored at sign-in (token.exp is set once
      //      and never extended on refresh), which is the desired behaviour.
      //
      // rememberMe === true  → leave token.exp untouched (NextAuth default: maxAge 30 days).
      // rememberMe === false (or undefined for legacy sessions) → cap to 8 h from sign-in.
      //
      // Justification for `as any`: NextAuth v5 beta.31's JWT type does not
      // expose `exp` as a writable property; casting is the only way to set
      // it without breaking strict mode elsewhere.
      if (!token.rememberMe) {
        const eightHoursFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 8
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingExp = (token as any).exp as number | undefined
        // Only cap downward — never extend an exp that is already shorter.
        if (!existingExp || existingExp > eightHoursFromNow) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(token as any).exp = eightHoursFromNow
        }
      }

      return token
    },

    // Session is what client/server consumers see via `auth()` /
    // `useSession()`. We mirror the JWT claims onto session.user
    // and derive convenience fields (initials, role alias).
    async session({ session, token }) {
      if (session.user) {
        session.user.id          = (token.id          as string) ?? session.user.id
        session.user.roleId      = (token.roleId      as string) ?? ""
        session.user.roleName    = (token.roleName    as string) ?? "Viewer"
        session.user.permissions = (token.permissions as SessionPermission[]) ?? []
        // Legacy alias kept for backwards compatibility with the
        // pre-NextAuth `SessionUser.role` field used across the
        // admin UI.
        session.user.role        = session.user.roleName
        session.user.initials    = deriveInitials(
          session.user.name,
          session.user.email ?? ""
        )
      }
      return session
    },
  },
}
