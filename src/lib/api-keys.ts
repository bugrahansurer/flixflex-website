// ═══════════════════════════════════════════════════════════
// FlixFlex — API key generation & verification
//
// Keys are shown to the admin exactly once at creation; only a
// SHA-256 hash is stored. Format: ffk_<prefix>_<secret>
// ═══════════════════════════════════════════════════════════

import crypto from "crypto"
import prisma from "@/lib/prisma"
import type { NextRequest } from "next/server"

export interface GeneratedApiKey {
  /** Full plaintext key — shown to the user ONCE, never stored. */
  plaintext: string
  /** Public identifier stored + shown in the UI (e.g. ffk_ab12cd). */
  prefix: string
  /** SHA-256 hash of the full key — what we persist. */
  hashedKey: string
}

export function hashApiKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex")
}

export function generateApiKey(): GeneratedApiKey {
  const pub = crypto.randomBytes(4).toString("hex") // 8 hex chars
  const secret = crypto.randomBytes(24).toString("base64url") // ~32 chars
  const prefix = `ffk_${pub}`
  const plaintext = `${prefix}_${secret}`
  return { plaintext, prefix, hashedKey: hashApiKey(plaintext) }
}

/**
 * Verify an incoming request's API key.
 * Reads `Authorization: Bearer <key>` or `x-api-key: <key>`.
 * Returns the matching active key record (and bumps lastUsedAt), else null.
 */
export async function verifyApiKey(req: NextRequest): Promise<{ id: string; scopes: string[] } | null> {
  if (!prisma) return null

  const auth = req.headers.get("authorization") ?? ""
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : ""
  const headerKey = req.headers.get("x-api-key")?.trim() ?? ""
  const key = bearer || headerKey
  if (!key || !key.startsWith("ffk_")) return null

  const hashed = hashApiKey(key)
  const record = await prisma.apiKey.findFirst({
    where: { hashedKey: hashed, isActive: true },
    select: { id: true, scopes: true },
  })
  if (!record) return null

  // Bump lastUsedAt (fire-and-forget).
  prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => {})

  return record
}
