// ═══════════════════════════════════════════════════════════
// FlixFlex — Shared API utilities for the /api/ai/* routes
//
//   • requireAdmin()       — gates AI routes (ai:create), returns 401/403
//   • requirePermission()  — generic gate (resource, action), returns 401/403
//   • checkRateLimit       — 5 requests/min per user (in-memory)
//   • auditAI              — console-log a structured event
//   • jsonError            — consistent error response shape
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

// ── Rate limiting (in-memory, per user) ────────────────────
type RLEntry = { count: number; resetAt: number }
const rl = new Map<string, RLEntry>()
const RL_WINDOW = 60_000 // 1 minute
const RL_MAX    = 5

export function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now   = Date.now()
  const entry = rl.get(userId)
  if (!entry || now > entry.resetAt) {
    rl.set(userId, { count: 1, resetAt: now + RL_WINDOW })
    return { allowed: true }
  }
  if (entry.count >= RL_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true }
}

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

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    {
      ok: false,
      message: `Çok fazla istek. ${retryAfter} saniye sonra tekrar deneyin.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  )
}
