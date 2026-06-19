// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/roles/[id]/permissions
// PUT  atomically replace all permissions for a role
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac/permissions"
import { replacePermissionsSchema } from "@/lib/validators/permission-schema"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
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

    const role = await prisma.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json({ ok: false, message: "Rol bulunamadı." }, { status: 404 })
    }

    if (role.name === "Super Admin") {
      return NextResponse.json({ ok: false, message: "Super Admin rolünün yetkileri değiştirilemez." }, { status: 400 })
    }

    const isSuper = session.user.role === "Super Admin"

    // Prevent self-escalation: you cannot edit the permissions of the role
    // currently assigned to you (would let you grant yourself anything).
    if (!isSuper && role.id === session.user.roleId) {
      return NextResponse.json({ ok: false, message: "Kendi rolünüzün yetkilerini değiştiremezsiniz." }, { status: 403 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, message: "Geçersiz JSON gövdesi." }, { status: 400 })
    }

    const result = replacePermissionsSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { permissions } = result.data

    // Prevent privilege escalation: a non-Super-Admin can only grant
    // permissions they themselves already hold. (Super Admin grants anything.)
    if (!isSuper) {
      const ownPerms = session.user.permissions ?? []
      const forbidden = permissions.find((p) => !hasPermission(ownPerms, p.resource, p.action))
      if (forbidden) {
        return NextResponse.json(
          { ok: false, message: `Sahip olmadığınız bir yetkiyi atayamazsınız: ${forbidden.resource}:${forbidden.action}` },
          { status: 403 }
        )
      }
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      await tx.permission.deleteMany({ where: { roleId: id } })
      if (permissions.length > 0) {
        await tx.permission.createMany({
          data: permissions.map((p) => ({
            roleId:   id,
            resource: p.resource,
            action:   p.action,
            scope:    p.scope ?? null,
          })),
          skipDuplicates: true,
        })
      }
      return tx.role.findUnique({
        where: { id },
        include: { permissions: true },
      })
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch (err: any) {
    console.error("[roles/[id]/permissions PUT]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}
