// ═══════════════════════════════════════════════════════════
// FlixFlex — /api/media/fonts
// GET    list custom fonts          (media:read)
// POST   upload a .ttf / .otf font  (media:create)
// DELETE remove a font              (media:delete)
//
// SECURITY:
//   • Filename is sanitised via path.basename + regex strip;
//     final path is asserted to live under uploadDir.
//   • Magic-byte check enforces the file is genuinely
//     TTF (00 01 00 00) or OTF (4F 54 54 4F "OTTO") — extension
//     alone can be spoofed.
//   • 5 MB hard cap on font payload.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import prisma from "@/lib/prisma"

const MAX_FONT_BYTES = 5 * 1024 * 1024 // 5 MB

// TTF (TrueType):  00 01 00 00            → 0x00010000
// OTF (OpenType):  'O' 'T' 'T' 'O'        → 0x4F54544F
const TTF_MAGIC = 0x00010000
const OTF_MAGIC = 0x4f54544f

const deleteSchema = z.object({
  id: z.string().min(1, "id zorunlu"),
})

// ── GET /api/media/fonts ───────────────────────────
// Lists all custom fonts
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "media", "read")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  try {
    const fonts = prisma 
      ? await prisma.customFont.findMany({
          orderBy: { createdAt: "desc" },
        })
      : []
    return NextResponse.json({ fonts })
  } catch (err) {
    console.error("[media/fonts GET]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}

// ── POST /api/media/fonts ──────────────────────────
// Handles .ttf / .otf font upload
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "media", "create")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const fontName = formData.get("name") as string

    if (!file || !fontName) {
      return NextResponse.json({ error: "Dosya ve font ismi gereklidir" }, { status: 400 })
    }

    // ── Size cap ────────────────────────────────────────
    if (file.size > MAX_FONT_BYTES) {
      return NextResponse.json(
        { error: "Font dosyası 5MB sınırını aşıyor." },
        { status: 413 }
      )
    }

    // ── Filename sanitisation (basename + whitelist regex) ──
    const baseName = path.basename(file.name || "font.ttf")
    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "")
    if (!safeName) {
      return NextResponse.json({ error: "Geçersiz dosya adı" }, { status: 400 })
    }

    // Accept either .ttf or .otf extension (cheap pre-check).
    const lower = safeName.toLowerCase()
    if (!lower.endsWith(".ttf") && !lower.endsWith(".otf")) {
      return NextResponse.json(
        { error: "Yalnızca .ttf ve .otf formatları desteklenir" },
        { status: 415 }
      )
    }

    // ── Magic-byte check — extension can be spoofed ────────
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    if (buffer.byteLength < 4) {
      return NextResponse.json({ error: "Geçersiz font dosyası" }, { status: 400 })
    }
    const magic = buffer.readUInt32BE(0)
    if (magic !== TTF_MAGIC && magic !== OTF_MAGIC) {
      return NextResponse.json(
        { error: "Geçersiz font dosyası — TTF veya OTF olmalı" },
        { status: 415 }
      )
    }

    // ── Path assembly with under-root assertion ────────────
    const uploadDir = path.resolve(process.cwd(), "public", "fonts", "custom")
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${safeName}`
    const target   = path.resolve(uploadDir, fileName)
    if (!target.startsWith(uploadDir + path.sep)) {
      return NextResponse.json({ error: "Geçersiz dosya yolu" }, { status: 400 })
    }

    await writeFile(target, buffer)

    const url = `/fonts/custom/${fileName}`

    // Save to DB
    const customFont = prisma 
      ? await prisma.customFont.create({
          data: {
            name: fontName,
            url,
            fileName,
          }
        })
      : { id: "mock-font", name: fontName, url }

    return NextResponse.json({ font: customFont })
  } catch (err) {
    console.error("[media/fonts POST]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}

// ── DELETE /api/media/fonts ───────────────────────
// Deletes a custom font record and file
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "media", "delete")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  try {
    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json({ error: "Geçersiz JSON gövdesi" }, { status: 400 })
    }
    const parsed = deleteSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { id } = parsed.data

    const font = prisma ? await prisma.customFont.findUnique({ where: { id } }) : null
    if (!font) return NextResponse.json({ error: "Font bulunamadı" }, { status: 404 })

    // Delete file
    // Note: In production you might want to handle file deletion more robustly
    try {
      const { unlink } = await import("fs/promises")
      const uploadDir = path.resolve(process.cwd(), "public", "fonts", "custom")
      const filePath  = path.resolve(uploadDir, path.basename(font.fileName))
      if (filePath.startsWith(uploadDir + path.sep)) {
        await unlink(filePath)
      }
    } catch (e) {
      console.warn("[media/fonts DELETE] file unlink error:", e)
    }

    if (prisma) {
      await prisma.customFont.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[media/fonts DELETE]", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
