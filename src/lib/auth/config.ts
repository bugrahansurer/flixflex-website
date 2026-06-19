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
  // 8-hour lifetime: permission/role changes propagate on next login
  // (or within 8h), instead of being cached for 30 days. Admins are
  // expected to re-authenticate roughly once per working day.
  session: {
    strategy: "jwt",
    maxAge:   60 * 60 * 8, // 8 hours
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
        }
        if (u.id)          token.id          = u.id
        if (u.roleId)      token.roleId      = u.roleId
        if (u.roleName)    token.roleName    = u.roleName
        if (u.permissions) token.permissions = u.permissions
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
