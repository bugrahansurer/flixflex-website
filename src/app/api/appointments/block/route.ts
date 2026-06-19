// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment Slot Block API Route
// GET/POST/DELETE /api/appointments/block — admin authentication required
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"

// Gate: authenticated + has the required appointments permission.
// Returns an error response on failure, or null on success.
async function gate(action: "read" | "update"): Promise<NextResponse | null> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "appointments", action)) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }
  return null
}

// GET — List all blocked slots
export async function GET() {
  const denied = await gate("read")
  if (denied) return denied

  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const blocked = await prisma.blockedSlot.findMany({
      orderBy: { date: "asc" },
    })

    return NextResponse.json({ ok: true, data: blocked })
  } catch (err) {
    console.error("[Blocked Slots GET] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST — Block a slot
export async function POST(req: NextRequest) {
  const denied = await gate("update")
  if (denied) return denied

  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { date, reason } = await req.json()
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    const blocked = await prisma.blockedSlot.upsert({
      where: { date: parsedDate },
      update: { reason: reason || null },
      create: { date: parsedDate, reason: reason || null },
    })

    return NextResponse.json({ ok: true, data: blocked }, { status: 201 })
  } catch (err) {
    console.error("[Blocked Slots POST] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE — Unblock a slot
export async function DELETE(req: NextRequest) {
  const denied = await gate("update")
  if (denied) return denied

  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const dateStr = req.nextUrl.searchParams.get("date")
    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const parsedDate = new Date(dateStr)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    await prisma.blockedSlot.delete({
      where: { date: parsedDate },
    })

    return NextResponse.json({ ok: true, message: "Slot unblocked successfully" })
  } catch (err) {
    console.error("[Blocked Slots DELETE] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
