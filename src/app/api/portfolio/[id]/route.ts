import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { portfolioPayloadSchema } from "@/lib/validators/content-schema"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("portfolio", "update")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const { id } = await params
  const parsed = portfolioPayloadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { serviceIds, ...data } = parsed.data
  const item = await prisma.portfolioItem.update({
    where: { id },
    data: {
      ...data,
      results: data.resultStats,
      services: { set: serviceIds.map((serviceId) => ({ id: serviceId })) },
    },
    include: { services: true },
  })

  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, item })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("portfolio", "delete")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const { id } = await params
  await prisma.portfolioItem.delete({ where: { id } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true })
}
