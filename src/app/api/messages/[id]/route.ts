// ═══════════════════════════════════════════════════════════
// FlixFlex — Contact message actions (admin)
// PATCH: okundu/okunmadı işaretle · DELETE: sil
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { z } from "zod"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"

const patchSchema = z.object({ isRead: z.boolean() })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("messages", "update")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return jsonError("Geçersiz istek.", 400)

  try {
    await prisma.contactSubmission.update({ where: { id }, data: { isRead: parsed.data.isRead } })
    return NextResponse.json({ ok: true })
  } catch {
    return jsonError("Mesaj bulunamadı.", 404)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("messages", "delete")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const { id } = await params
  try {
    await prisma.contactSubmission.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return jsonError("Mesaj bulunamadı.", 404)
  }
}
