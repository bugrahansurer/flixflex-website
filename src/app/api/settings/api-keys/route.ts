import { NextRequest, NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { generateApiKey } from "@/lib/api-keys"

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
    const body = await req.json().catch(() => ({}))
    const name = String(body.name ?? "").trim() || "API Anahtarı"
    const scopes: string[] = Array.isArray(body.scopes) ? body.scopes.map(String) : []

    const { plaintext, prefix, hashedKey } = generateApiKey()
    await prisma.apiKey.create({
      data: { name, prefix, hashedKey, scopes, createdById: gate.ctx.userId },
    })

    // plaintext returned ONCE — never retrievable again.
    return NextResponse.json({ ok: true, key: plaintext, prefix })
  } catch (err) {
    console.error("[api-keys POST]", err)
    return jsonError("Anahtar oluşturulamadı.", 500)
  }
}
