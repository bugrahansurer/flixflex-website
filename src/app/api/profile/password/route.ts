import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/validators/profile-schema"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!prisma) return NextResponse.json({ error: "Veritabanı bağlantısı yok" }, { status: 503 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 })
  }

  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasyon hatası", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    // Constant-time compare
    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) {
      return NextResponse.json(
        { error: "Mevcut şifre hatalı", errors: { currentPassword: ["Mevcut şifre hatalı"] } },
        { status: 400 }
      )
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: newHash },
    })

    void logAudit({
      userId: user.id,
      action: "profile.password.change",
      resource: "profile",
      resourceId: user.id,
      metadata: {},
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[profile.password.POST]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
