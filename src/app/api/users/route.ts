// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/users
// GET  paginated list with optional ?q= search
// POST create new user (bcrypt password)
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac/permissions"
import { logAudit } from "@/lib/audit"
import { createUserSchema } from "@/lib/validators/user-schema"
import { generateUsername, ensureUniqueUsername } from "@/lib/username"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") ?? "").slice(0, 100)
    const rawPage  = Number(searchParams.get("page")  ?? "1")
    const rawLimit = Number(searchParams.get("limit") ?? "20")
    const page  = Number.isFinite(rawPage)  && rawPage  > 0 ? Math.floor(rawPage)  : 1
    const limit = Math.min(100, Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 20)

    const where = q
      ? {
          OR: [
            { name:  { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        // Never pull the password hash out of the DB for list views.
        omit: { password: true },
        include: { role: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      ok: true,
      data: users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err: any) {
    console.error("[users GET]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth().catch(() => null)
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Oturum açmanız gerekiyor." }, { status: 401 })
    }
    if (!hasPermission(session.user.permissions ?? [], "users", "create")) {
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

    const result = createUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, roleId, password, username: rawUsername } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ ok: false, errors: { email: ["Bu e-posta adresi zaten kayıtlı."] } }, { status: 400 })
    }

    // Username: verilmişse benzersizliğini doğrula, verilmemişse isimden üret.
    let username: string
    if (rawUsername) {
      const taken = await prisma.user.findUnique({ where: { username: rawUsername }, select: { id: true } })
      if (taken) {
        return NextResponse.json({ ok: false, errors: { username: ["Bu kullanıcı adı zaten kullanılıyor."] } }, { status: 400 })
      }
      username = rawUsername
    } else {
      const db = prisma!
      username = await ensureUniqueUsername(generateUsername(name, email), async (c) => {
        const found = await db.user.findUnique({ where: { username: c }, select: { id: true } })
        return !!found
      })
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) {
      return NextResponse.json({ ok: false, errors: { roleId: ["Seçilen rol bulunamadı."] } }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, username, password: hashed, roleId, isActive: true },
      omit: { password: true },
      include: { role: { select: { id: true, name: true } } },
    })

    void logAudit({
      userId: session.user.id,
      action: "create",
      resource: "users",
      resourceId: user.id,
      metadata: { email: user.email, roleId },
    })

    return NextResponse.json({ ok: true, data: user }, { status: 201 })
  } catch (err: any) {
    console.error("[users POST]", err)
    return NextResponse.json({ ok: false, message: "Sunucu hatası." }, { status: 500 })
  }
}
