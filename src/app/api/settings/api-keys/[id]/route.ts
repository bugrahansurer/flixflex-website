import { NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

// DELETE — revoke (delete) an API key
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı yok", 503)

  const { id } = await params
  try {
    await prisma.apiKey.delete({ where: { id } })

    void logAudit({
      userId: gate.ctx.userId,
      action: "api-key.delete",
      resource: "api-keys",
      resourceId: id,
      metadata: {},
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api-keys DELETE]", err)
    return jsonError("Anahtar silinemedi.", 500)
  }
}
