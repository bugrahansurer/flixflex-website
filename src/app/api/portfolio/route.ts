import { NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import prisma from "@/lib/prisma"
import { portfolioPayloadSchema } from "@/lib/validators/content-schema"

export async function GET() {
  const gate = await requirePermission("portfolio", "read")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const items = await prisma.portfolioItem.findMany({
    include: { services: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ ok: true, items })
}

export async function POST(req: Request) {
  const gate = await requirePermission("portfolio", "create")
  if (!gate.ok) return gate.response
  if (!prisma) return jsonError("Veritabanı bağlantısı yok.", 503)

  const parsed = portfolioPayloadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { serviceIds, ...data } = parsed.data
  const item = await prisma.portfolioItem.create({
    data: {
      ...data,
      results: data.resultStats,
      services: { connect: serviceIds.map((id) => ({ id })) },
    },
    include: { services: true },
  })

  return NextResponse.json({ ok: true, item }, { status: 201 })
}
