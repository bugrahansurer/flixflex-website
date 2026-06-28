// ═══════════════════════════════════════════════════════════
// FlixFlex — Shared API utilities for the /api/ai/* routes
//
//   • requireAdmin()       — gates AI routes (ai:create), returns 401/403
//   • requirePermission()  — generic gate (resource, action), returns 401/403
//   • checkRateLimit       — delegates to canonical rate-limit module
//   • auditAI              — console-log a structured event
//   • jsonError            — consistent error response shape
//   • rateLimitResponse    — re-exported from @/lib/rate-limit
//
// SECURITY:
//   • requireAdmin no longer falls back to the dev mock session.
//     If `auth()` returns null we return 401 — production-grade.
//   • Permission check enforces ai:create (matches the role
//     matrix defined in src/lib/rbac/resources.ts).
//   • The mock-session.ts module is intentionally NOT deleted;
//     other consumers may still import it directly. This module
//     simply stops calling it.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { estimateTokens } from "@/lib/ai"
import { checkLimit, AI as AI_PROFILE } from "@/lib/rate-limit"
import type { RateLimitResult } from "@/lib/rate-limit"

// ── Auth ───────────────────────────────────────────────────
export interface AdminContext {
  userId: string
  email:  string | null
  role:   string
}

/**
 * Gates an AI route. Returns the session context on success or a
 * NextResponse to forward on failure. Enforces `ai:create`
 * permission — the role matrix considers this the baseline AI
 * action.
 *
 * Function name is preserved for backwards compatibility with
 * existing callers; internals are stricter than before.
 */
export async function requireAdmin(): Promise<
  | { ok: true; ctx: AdminContext }
  | { ok: false; response: NextResponse }
> {
  return requirePermission("ai", "create")
}

/**
 * Generic per-resource permission gate. Use this directly when
 * the caller needs a non-AI resource (e.g. blog routes).
 *
 * - 401 if no session
 * - 403 if session lacks the required permission
 */
export async function requirePermission(
  resource: string,
  action: string
): Promise<
  | { ok: true; ctx: AdminContext }
  | { ok: false; response: NextResponse }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Yetkisiz — giriş yapmanız gerekiyor." },
        { status: 401 }
      ),
    }
  }

  if (!hasPermission(session.user.permissions ?? [], resource, action)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true,
    ctx: {
      userId: session.user.id,
      email:  session.user.email ?? null,
      role:   session.user.roleName ?? session.user.role ?? "Viewer",
    },
  }
}

// ── Rate limiting — delegated to the canonical module ──────
// checkRateLimit kept for backwards-compat with existing AI route
// callers. Returns the full RateLimitResult so callers can pass
// the result directly to rateLimitResponse(result).
// New code should call checkLimit(AI, userId) directly.

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  return checkLimit(AI_PROFILE, userId)
}

// Re-export from canonical module so AI route imports don't break.
export { rateLimitResponse } from "@/lib/rate-limit"

// ── Audit log ──────────────────────────────────────────────
export interface AuditAIInput {
  user:        AdminContext
  action:      string
  stage:       string
  inputTokens?: number
  outputTokens?: number
  responseText?: string
  meta?:       Record<string, unknown>
}

/**
 * Lightweight audit logger — writes structured console output
 * so it can be picked up by Vercel/Datadog log drains.
 *
 * TODO: persist to `AuditLog` Prisma table once the audit-log
 * agent (STEP_07) lands. Schema field map:
 *   userId    → user.userId
 *   action    → action          (e.g. "ai.titles.generate")
 *   resource  → "ai"
 *   metadata  → { stage, inputTokens, outputTokens, ...meta }
 */
export function auditAI(input: AuditAIInput): void {
  const outTokens =
    input.outputTokens ??
    (input.responseText ? estimateTokens(input.responseText) : 0)

  console.log("[AI Audit]", {
    userId:        input.user.userId,
    email:         input.user.email,
    role:          input.user.role,
    action:        input.action,
    stage:         input.stage,
    inputTokens:   input.inputTokens   ?? 0,
    outputTokens:  outTokens,
    estimatedTotal: (input.inputTokens ?? 0) + outTokens,
    meta:          input.meta ?? {},
    timestamp:     new Date().toISOString(),
  })
}

// ── Common error helpers ───────────────────────────────────
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status })
}
