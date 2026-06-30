"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Admin permission context (UI gating)
// Aksiyon butonlarını kullanıcının yetkisine göre göster/gizle.
// Provider AdminLayoutShell'de oturur; useCan/<Can> her client
// admin bileşeninde kullanılabilir. Güvenlik sınırı API'dir —
// bu yalnızca UI/UX (savunma derinliği) içindir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { hasPermission } from "@/lib/rbac/permissions"
import type { SessionPermission } from "@/lib/auth/types"

type CanFn = (resource: string, action: string) => boolean

const PermissionContext = React.createContext<CanFn | null>(null)

export function PermissionProvider({
  role,
  permissions,
  children,
}: {
  role: string
  permissions: SessionPermission[]
  children: React.ReactNode
}) {
  const can = React.useMemo<CanFn>(() => {
    const isSuper = role === "Super Admin"
    return (resource, action) => isSuper || hasPermission(permissions, resource, action)
  }, [role, permissions])

  return <PermissionContext.Provider value={can}>{children}</PermissionContext.Provider>
}

/** Returns `can(resource, action)`. Fail-closed (returns false) if no provider. */
export function useCan(): CanFn {
  return React.useContext(PermissionContext) ?? (() => false)
}

/** Renders children only if the user has `resource:action`; otherwise `fallback`. */
export function Can({
  resource,
  action,
  children,
  fallback = null,
}: {
  resource: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const can = useCan()
  return <>{can(resource, action) ? children : fallback}</>
}
