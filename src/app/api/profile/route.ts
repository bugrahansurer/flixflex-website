import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validators/profile-schema"

// ── GET own profile ───────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!prisma) {
    // Fallback to session data if DB is down
    return NextResponse.json({ 
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: { name: (session.user as any).roleName || "Viewer" },
        isActive: true,
      } 
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("[profile.GET]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}

// ── PATCH own profile ─────────────────────────────────
export async function PATCH(req: Request) {
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

  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasyon hatası", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, email, image } = parsed.data

  try {
    // Email taken by another user?
    const conflict = await prisma.user.findFirst({
      where: { email, NOT: { id: session.user.id } },
      select: { id: true },
    })
    if (conflict) {
      return NextResponse.json(
        { error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor" },
        { status: 409 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data:  { name, email, image: image ?? null },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: { select: { name: true } },
      },
    })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error("[profile.PATCH]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
