// ═══════════════════════════════════════════════════════════
// FlixFlex — Server-side permission check (UI gating)
// Server Component'lerde aksiyon kontrollerini koşullu render etmek
// için. Güvenlik sınırı API'dir; bu UI/UX (savunma derinliği) içindir.
// ═══════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { hasPermission } from "./permissions"
import type { SessionUser } from "@/lib/auth/types"

export type CanFn = (resource: string, action: string) => boolean

/** Geçerli oturum için `can(resource, action)` döndürür (Super Admin her şeye true). */
export async function getCan(): Promise<CanFn> {
  const session = await auth().catch(() => null)
  const user = session?.user as unknown as SessionUser | undefined
  const isSuper = user?.role === "Super Admin"
  const perms = user?.permissions ?? []
  return (resource, action) => isSuper || hasPermission(perms, resource, action)
}
