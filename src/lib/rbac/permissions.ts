// ═══════════════════════════════════════════════════════════
// FlixFlex — RBAC Permission Catalog & Helpers
// ═══════════════════════════════════════════════════════════

import { RESOURCES, ACTIONS, RESOURCE_LABELS, ACTION_LABELS, type Resource, type Action } from "./resources"
import type { Session } from "@/lib/auth/types"

// ── Flat string arrays for UI iteration ─────────────────
export const RESOURCE_LIST: string[] = Object.values(RESOURCES)
export const ACTION_LIST: string[] = Object.values(ACTIONS)

// Re-export for convenience
export { RESOURCES, ACTIONS, RESOURCE_LABELS, ACTION_LABELS }
export type { Resource, Action }

// ── Permission matrix: which actions are available per resource
// Used to render the permission grid UI
export const PERMISSION_MATRIX: Record<string, string[]> = {
  [RESOURCES.BLOG]:      [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.MANAGE],
  [RESOURCES.PAGES]:     [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.MANAGE],
  [RESOURCES.PORTFOLIO]: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.MANAGE],
  [RESOURCES.SERVICES]:  [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.PUBLISH, ACTIONS.MANAGE],
  [RESOURCES.COLORS]:    [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
  [RESOURCES.ROLES]:     [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
  [RESOURCES.USERS]:     [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
  [RESOURCES.SETTINGS]:  [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
  [RESOURCES.AI]:        [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.MANAGE],
  [RESOURCES.MEDIA]:     [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
  [RESOURCES.APPOINTMENTS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
}

// ── Permission type (matches Prisma Permission model) ────
export interface Permission {
  resource: string
  action: string
  scope?: string | null
}

// ── hasPermission ────────────────────────────────────────
// Checks if a user's permission set grants access to resource:action.
// Supports:
//   - Exact match:     "blog:read"
//   - Resource wildcard (manage): "blog:manage" grants all blog actions
//   - Global wildcard: "*:*" or "*:manage" grants everything
export function hasPermission(
  userPermissions: Permission[],
  resource: string,
  action: string
): boolean {
  return userPermissions.some((p) => {
    const resourceMatch =
      p.resource === resource ||
      p.resource === "*"

    const actionMatch =
      p.action === action ||
      p.action === ACTIONS.MANAGE ||
      p.action === "*"

    return resourceMatch && actionMatch
  })
}

// ── canAccess ────────────────────────────────────────────
// Convenience wrapper that takes a Session (or null) and checks access.
// Returns false if session is null (unauthenticated).
export function canAccess(
  session: Session | null | undefined,
  resource: string,
  action: string
): boolean {
  if (!session?.user?.permissions) return false
  return hasPermission(session.user.permissions, resource, action)
}

// ── isSuperAdmin ─────────────────────────────────────────
// Super Admin is identified by having manage on every resource,
// or by role name. Used to gate permission matrix editing.
export function isSuperAdmin(session: Session | null | undefined): boolean {
  if (!session?.user) return false
  return session.user.role === "Super Admin"
}

// ── permissionKey ────────────────────────────────────────
// Stable key for a permission, used in sets/maps.
export function permissionKey(resource: string, action: string): string {
  return `${resource}:${action}`
}

// ── buildPermissionSet ───────────────────────────────────
// Converts a Permission[] to a Set of "resource:action" strings.
export function buildPermissionSet(permissions: Permission[]): Set<string> {
  return new Set(permissions.map((p) => permissionKey(p.resource, p.action)))
}
