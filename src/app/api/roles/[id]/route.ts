// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/roles/[id]
// GET    single role
// PATCH  update name/description
// DELETE remove role
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac/permissions"
import { updateRoleSchema } from "@/lib/validators/role-schema"
import { logAudit } from "@/lib/audit"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

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

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    })
    if (!role) {
      return NextResponse.json({ ok: false, message: "Rol bulunamadı." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: role })
  } catch (err: any) {
    console.error("[roles/[id] GET]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Oturum açmanız gerekiyor." }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "roles", "update")) {
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

    const result = updateRoleSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const role = await prisma.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json({ ok: false, message: "Rol bulunamadı." }, { status: 404 })
    }

    if (role.isSystem && result.data.name && result.data.name !== role.name) {
      return NextResponse.json({ ok: false, message: "Sistem rollerinin adı değiştirilemez." }, { status: 400 })
    }

    if (result.data.name && result.data.name !== role.name) {
      const existing = await prisma.role.findUnique({ where: { name: result.data.name } })
      if (existing) {
        return NextResponse.json({ ok: false, errors: { name: ["Bu rol adı zaten kullanılıyor."] } }, { status: 400 })
      }
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        ...(result.data.name !== undefined ? { name: result.data.name } : {}),
        ...(result.data.description !== undefined ? { description: result.data.description } : {}),
      },
      include: { permissions: true, _count: { select: { users: true } } },
    })

    void logAudit({
      userId: session.user.id,
      action: "role.update",
      resource: "roles",
      resourceId: id,
      metadata: { name: updated.name },
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch (err: any) {
    console.error("[roles/[id] PATCH]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Oturum açmanız gerekiyor." }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "roles", "delete")) {
      return NextResponse.json({ ok: false, message: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Veritabanı bağlantısı yok." }, { status: 503 })
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })
    if (!role) {
      return NextResponse.json({ ok: false, message: "Rol bulunamadı." }, { status: 404 })
    }
    if (role.isSystem) {
      return NextResponse.json({ ok: false, message: "Sistem rolleri silinemez." }, { status: 400 })
    }
    if (role._count.users > 0) {
      return NextResponse.json({ ok: false, message: `Bu role atanmış ${role._count.users} kullanıcı var.` }, { status: 400 })
    }

    await prisma.role.delete({ where: { id } })

    void logAudit({
      userId: session.user.id,
      action: "role.delete",
      resource: "roles",
      resourceId: id,
      metadata: { name: role.name },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[roles/[id] DELETE]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}
