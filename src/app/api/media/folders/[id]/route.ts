import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null)
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  if (!hasPermission(session.user.permissions ?? [], "media", "delete")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  if (!prisma) return NextResponse.json({ error: "Veritabanı bağlantısı yok" }, { status: 503 })

  try {
    const { id } = await params

    // Check if folder exists
    const folder = await prisma.mediaFolder.findUnique({
      where: { id },
      include: { 
        _count: { 
          select: { media: true, children: true } 
        } 
      }
    })

    if (!folder) {
      return NextResponse.json({ error: "Klasör bulunamadı" }, { status: 404 })
    }

    // You might want to prevent deleting non-empty folders or handle them
    // For now, we allow deletion (children will be deleted by Cascade, media will set folderId to null)
    await prisma.mediaFolder.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[media/folders/[id] DELETE]", error)
    return NextResponse.json({ error: "Klasör silinemedi" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null)
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  if (!hasPermission(session.user.permissions ?? [], "media", "update")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  if (!prisma) return NextResponse.json({ error: "Veritabanı bağlantısı yok" }, { status: 503 })

  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    const folder = await prisma.mediaFolder.update({
      where: { id },
      data: { name }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[media/folders/[id] PATCH]", error)
    return NextResponse.json({ error: "Klasör güncellenemedi" }, { status: 500 })
  }
}
