// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/users/[id]/password
// POST  admin sets a new password for a user
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac/permissions"
import { logAudit } from "@/lib/audit"
import { setPasswordSchema } from "@/lib/validators/user-schema"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
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
      return NextResponse.json({ ok: false, message: "Super Admin şifresini yalnızca başka bir Super Admin sıfırlayabilir." }, { status: 403 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, message: "Geçersiz JSON gövdesi." }, { status: 400 })
    }

    const result = setPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const hashed = await bcrypt.hash(result.data.password, 12)
    await prisma.user.update({
      where: { id },
      data:  { password: hashed },
    })

    void logAudit({
      userId: session.user.id,
      action: "password.change",
      resource: "users",
      resourceId: id,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[users/[id]/password POST]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}
