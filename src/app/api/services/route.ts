import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { servicePayloadSchema } from "@/lib/validators/content-schema"

export async function GET() {
  const gate = await requirePermission("services", "read")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const items = await prisma.service.findMany({
    include: { portfolios: true, children: true, parent: { select: { id: true, title: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json({ ok: true, items })
}

export async function POST(req: Request) {
  const gate = await requirePermission("services", "create")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const parsed = servicePayloadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { parentId, ...data } = parsed.data
  const item = await prisma.service.create({
    data: {
      ...data,
      parentId: parentId || null,
    },
  })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, item }, { status: 201 })
}
