import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { servicePayloadSchema } from "@/lib/validators/content-schema"
import { logAudit } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("services", "update")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const { id } = await params
  const parsed = servicePayloadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const item = await prisma.service.update({
    where: { id },
    data: {
      ...parsed.data,
      parentId: parsed.data.parentId || null,
    },
  })
  void logAudit({ userId: gate.ctx.userId, action: "update", resource: "services", resourceId: id, metadata: { title: item.title } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, item })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("services", "delete")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const { id } = await params
  try {
    await prisma.service.delete({ where: { id } })
    void logAudit({ userId: gate.ctx.userId, action: "delete", resource: "services", resourceId: id })
    revalidatePath("/", "layout")
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API DELETE Service Error]:", err)
    return NextResponse.json({
      ok: false,
      message: err instanceof Error ? err.message : "Silme işlemi sırasında veritabanı hatası oluştu."
    }, { status: 500 })
  }
}
