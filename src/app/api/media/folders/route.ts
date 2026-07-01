import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"

// ── GET: List folders ──────────────────────────────
export async function GET(request: Request) {
  const session = await auth().catch(() => null)
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  if (!hasPermission(session.user.permissions ?? [], "media", "read")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  if (!prisma) return NextResponse.json([])

  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId") || null

    const folders = await prisma.mediaFolder.findMany({
      where: { parentId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { media: true, children: true }
        }
      }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("[media/folders GET]", error)
    return NextResponse.json({ error: "Klasörler yüklenemedi" }, { status: 500 })
  }
}

// ── POST: Create folder ────────────────────────────
export async function POST(request: Request) {
  const session = await auth().catch(() => null)
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  if (!hasPermission(session.user.permissions ?? [], "media", "create")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  if (!prisma) return NextResponse.json({ error: "Veritabanı bağlantısı yok" }, { status: 503 })

  try {
    const parsed = z.object({
      name: z.string().trim().min(1).max(100),
      parentId: z.string().max(64).nullable().optional(),
    }).safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz klasör adı" }, { status: 400 })
    }
    const { name, parentId } = parsed.data

    const folder = await prisma.mediaFolder.create({
      data: {
        name,
        parentId: parentId || null
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[media/folders POST]", error)
    return NextResponse.json({ error: "Klasör oluşturulamadı" }, { status: 500 })
  }
}
