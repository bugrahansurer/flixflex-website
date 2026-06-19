// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment Slots Availability API Route
// GET /api/appointments/slots?year=YYYY&month=M — public endpoint
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { searchParams } = new URL(req.url)
    const yearStr = searchParams.get("year")
    const monthStr = searchParams.get("month") // 1-indexed (1 = Jan, 12 = Dec)

    if (!yearStr || !monthStr) {
      return NextResponse.json({ error: "Year and month are required" }, { status: 400 })
    }

    const year = parseInt(yearStr)
    const month = parseInt(monthStr)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid year or month" }, { status: 400 })
    }

    // Start of the given month and start of the next month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Fetch active bookings in this month
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ["pending", "approved"],
        },
      },
      select: {
        date: true,
      },
    })

    // Fetch blocked slots in this month
    const blocked = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        date: true,
      },
    })

    return NextResponse.json({
      ok: true,
      booked: appointments.map((a) => a.date.toISOString()),
      blocked: blocked.map((b) => b.date.toISOString()),
    })
  } catch (err) {
    console.error("[Slots GET] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
