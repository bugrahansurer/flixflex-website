// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/roles
// GET  list all roles
// POST create a new role
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac/permissions"
import { createRoleSchema } from "@/lib/validators/role-schema"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Oturum açmanız gerekiyor." }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "roles", "read")) {
      return NextResponse.json({ ok: false, message: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Veritabanı bağlantısı yok." }, { status: 503 })
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ ok: true, data: roles })
  } catch (err: any) {
    console.error("[roles GET]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Oturum açmanız gerekiyor." }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "roles", "create")) {
      return NextResponse.json({ ok: false, message: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Veritabanı bağlantısı yok." }, { status: 503 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, message: "Geçersiz JSON gövdesi." }, { status: 400 })
    }

    const result = createRoleSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, description } = result.data

    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ ok: false, errors: { name: ["Bu rol adı zaten kullanılıyor."] } }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: { name, description: description ?? null, isSystem: false },
    })

    void logAudit({
      userId: session.user.id,
      action: "role.create",
      resource: "roles",
      resourceId: role.id,
      metadata: { name },
    })

    return NextResponse.json({ ok: true, data: role }, { status: 201 })
  } catch (err: any) {
    console.error("[roles POST]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}
