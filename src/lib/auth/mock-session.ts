// ═══════════════════════════════════════════════════════════
// FlixFlex — Legacy Session Helpers
//
// @deprecated  These helpers used to return a hard-coded mock
// session while NextAuth was being wired up. NextAuth.js v5 is
// now active — call `auth()` from "@/lib/auth" directly in new
// code. The wrappers below are kept ONLY so parallel agents
// that still import `getMockSession`/`getSessionUser` continue
// to build without modification. Remove once all imports are
// migrated.
// ═══════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import type { Session, SessionUser } from "./types"

/**
 * @deprecated Use `auth()` from "@/lib/auth" directly.
 *
 * Returns the current NextAuth session (or `null` when there is
 * no authenticated user). Identical to calling `auth()` — kept
 * for backwards compatibility with the pre-NextAuth API.
 */
export async function getMockSession(): Promise<Session | null> {
  const session = await auth()
  // NextAuth's Session shape is augmented in `@/lib/auth` to match
  // our `Session` interface, so this cast is safe at runtime.
  return (session as unknown as Session) ?? null
}

/**
 * @deprecated Use `(await auth())?.user` directly.
 *
 * Shortcut returning the current session user or `null`.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  return ((session?.user as unknown as SessionUser) ?? null)
}
