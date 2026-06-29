// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/users/[id]
// GET    single user
// PATCH  update name/email/role/isActive
// DELETE remove user
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac/permissions"
import { logAudit } from "@/lib/audit"
import { updateUserSchema } from "@/lib/validators/user-schema"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Oturum açmanız gerekiyor." }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "users", "read")) {
      return NextResponse.json({ ok: false, message: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Veritabanı bağlantısı yok." }, { status: 503 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
      include: { role: { select: { id: true, name: true } } },
    })
    if (!user) {
      return NextResponse.json({ ok: false, message: "Kullanıcı bulunamadı." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: user })
  } catch (err: any) {
    console.error("[users/[id] GET]", err)
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
    if (!hasPermission(session.user.permissions ?? [], "users", "update")) {
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

    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: { select: { name: true } } },
    })
    if (!user) {
      return NextResponse.json({ ok: false, message: "Kullanıcı bulunamadı." }, { status: 404 })
    }

    const requesterRole = (session.user as any).roleName || (session.user as any).role
    const isRequesterSuper = requesterRole === "Super Admin"

    if (user.role?.name === "Super Admin" && !isRequesterSuper) {
      return NextResponse.json({ ok: false, message: "Super Admin kullanıcıyı yalnızca başka bir Super Admin düzenleyebilir." }, { status: 403 })
    }

    if (result.data.roleId) {
      const targetRole = await prisma.role.findUnique({
        where: { id: result.data.roleId },
        select: { name: true, permissions: { select: { resource: true, action: true } } },
      })
      if (targetRole?.name === "Super Admin" && !isRequesterSuper) {
        return NextResponse.json({ ok: false, message: "Super Admin rolünü yalnızca bir Super Admin atayabilir." }, { status: 403 })
      }
      // Prevent escalation: a non-Super-Admin cannot assign a role that
      // carries permissions they themselves don't hold.
      if (!isRequesterSuper && targetRole) {
        const ownPerms = session.user.permissions ?? []
        const exceeds = targetRole.permissions.find((p) => !hasPermission(ownPerms, p.resource, p.action))
        if (exceeds) {
          return NextResponse.json(
            { ok: false, message: "Kendi yetkinizi aşan bir rol atayamazsınız." },
            { status: 403 }
          )
        }
      }
    }

    if (session.user.id === id && result.data.roleId !== undefined && result.data.roleId !== user.roleId) {
      if (user.role?.name === "Super Admin") {
        return NextResponse.json({ ok: false, message: "Kendi Super Admin rolünüzü kaldıramazsınız." }, { status: 400 })
      }
    }

    if (result.data.email && result.data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: result.data.email } })
      if (existing) {
        return NextResponse.json({ ok: false, errors: { email: ["Bu e-posta adresi zaten kullanılıyor."] } }, { status: 400 })
      }
    }

    if (result.data.username && result.data.username !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username: result.data.username }, select: { id: true } })
      if (existing) {
        return NextResponse.json({ ok: false, errors: { username: ["Bu kullanıcı adı zaten kullanılıyor."] } }, { status: 400 })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(result.data.name     !== undefined ? { name:     result.data.name }     : {}),
        ...(result.data.email    !== undefined ? { email:    result.data.email }    : {}),
        ...(result.data.username !== undefined ? { username: result.data.username } : {}),
        ...(result.data.roleId   !== undefined ? { roleId:   result.data.roleId }   : {}),
        ...(result.data.isActive !== undefined ? { isActive: result.data.isActive } : {}),
      },
      omit: { password: true },
      include: { role: { select: { id: true, name: true } } },
    })

    void logAudit({
      userId: session.user.id,
      action: "update",
      resource: "users",
      resourceId: id,
      metadata: { fields: Object.keys(result.data) },
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch (err: any) {
    console.error("[users/[id] PATCH]", err)
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
    if (!hasPermission(session.user.permissions ?? [], "users", "delete")) {
      return NextResponse.json({ ok: false, message: "Bu işlem için yetkiniz yok." }, { status: 403 })
    }

    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Veritabanı bağlantısı yok." }, { status: 503 })
    }

    if (session.user.id === id) {
      return NextResponse.json({ ok: false, message: "Kendi hesabınızı silemezsiniz." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ ok: false, message: "Kullanıcı bulunamadı." }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    void logAudit({
      userId: session.user.id,
      action: "delete",
      resource: "users",
      resourceId: id,
      metadata: { email: user.email },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[users/[id] DELETE]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}
