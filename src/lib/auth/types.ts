// ═══════════════════════════════════════════════════════════
// FlixFlex — Auth Types
// TODO: These types align with NextAuth.js Session shape.
//       When NextAuth is installed, extend the built-in Session
//       interface via module augmentation in auth.ts and remove
//       the custom Session type here.
// ═══════════════════════════════════════════════════════════

export interface SessionPermission {
  resource: string
  action: string
  scope?: string | null
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  permissions: SessionPermission[]
  image?: string | null
  /** Two-letter initials derived from name, e.g. "BC" for "Burhan Cal" */
  initials: string
}

export interface Session {
  user: SessionUser
  /** ISO timestamp — session expiry */
  expires: string
}
