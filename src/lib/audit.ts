// ═══════════════════════════════════════════════════════════
// FlixFlex — Audit Logging
//
// Fire-and-forget writer for the AuditLog table. Records who did
// what to which resource, for sensitive admin operations (user &
// role mutations, password changes, settings).
//
// Design notes:
//   • NEVER throws — a failed audit write must not break the
//     underlying request. All errors are swallowed + logged.
//   • Skips silently if Prisma is unavailable or userId is missing
//     (e.g. the dev fallback admin whose id isn't a real DB row,
//     which would otherwise trip the userId foreign key).
// ═══════════════════════════════════════════════════════════

import prisma from "@/lib/prisma"

export interface AuditEntry {
  /** Acting user's id (must be a real User row). */
  userId: string | undefined | null
  /** Verb, e.g. "create" | "update" | "delete" | "password.change". */
  action: string
  /** Resource name, e.g. "users" | "roles" | "settings". */
  resource: string
  /** Affected row id, when applicable. */
  resourceId?: string | null
  /** Extra structured context (no secrets). */
  metadata?: Record<string, unknown>
  /** Request IP, when available. */
  ip?: string | null
}

/**
 * Record an audit entry. Awaitable but safe to fire-and-forget —
 * callers typically do `void logAudit(...)` after the main write.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!prisma || !entry.userId) return

  try {
    await prisma.auditLog.create({
      data: {
        userId:     entry.userId,
        action:     entry.action,
        resource:   entry.resource,
        resourceId: entry.resourceId ?? null,
        metadata:   (entry.metadata ?? undefined) as object | undefined,
        ip:         entry.ip ?? null,
      },
    })
  } catch (err) {
    console.error("[audit] write failed:", err)
  }
}
