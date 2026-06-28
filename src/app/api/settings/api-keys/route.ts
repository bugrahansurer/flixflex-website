import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { generateApiKey } from "@/lib/api-keys"
import { logAudit } from "@/lib/audit"

const VALID_SCOPES = ["read", "write", "admin"] as const

const createApiKeySchema = z.object({
  name:   z.string().trim().min(1).max(100).default("API Anahtarı"),
  scopes: z.array(z.enum(VALID_SCOPES)).max(VALID_SCOPES.length).default([]),
})

// GET — list keys (never returns the secret, only prefix + metadata)
export async function GET() {
  const gate = await requirePermission("settings", "read")
  if (!gate.ok) return gate.response
  if (!prisma) return NextResponse.json({ ok: true, keys: [] })

  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, scopes: true, isActive: true, lastUsedAt: true, createdAt: true },
  })
  return NextResponse.json({ ok: true, keys })
}

// POST — create a key, return the plaintext ONCE
export async function POST(req: NextRequest) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı yok", 503)

  try {
    const raw = await req.json().catch(() => ({}))
    const parsed = createApiKeySchema.safeParse(raw)
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Geçersiz istek.", 400)
    }
    const { name, scopes } = parsed.data

    const { plaintext, prefix, hashedKey } = generateApiKey()
    const created = await prisma.apiKey.create({
      data: { name, prefix, hashedKey, scopes, createdById: gate.ctx.userId },
      select: { id: true },
    })

    void logAudit({
      userId: gate.ctx.userId,
      action: "api-key.create",
      resource: "api-keys",
      resourceId: created.id,
      // name only — never log the plaintext key, hash, or prefix
      metadata: { name },
    })

    // plaintext returned ONCE — never retrievable again.
    return NextResponse.json({ ok: true, key: plaintext, prefix })
  } catch (err) {
    console.error("[api-keys POST]", err)
    return jsonError("Anahtar oluşturulamadı.", 500)
  }
}
