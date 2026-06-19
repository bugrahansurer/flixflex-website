// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment ID actions API Route
// PATCH /api/appointments/[id] — admin authentication required
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { sendAppointmentApprovedEmail } from "@/lib/mail"

function generateGoogleMeetLink(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `https://meet.google.com/${part1}-${part2}-${part3}`
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "appointments", "update")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!currentAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status, isRead, resendEmail } = body

    const isResending = Boolean(resendEmail) && currentAppointment.status === "approved"

    const updateData: Record<string, any> = {}
    if (status !== undefined) {
      if (!["pending", "approved", "cancelled", "completed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = status
    }

    if (isRead !== undefined) {
      updateData.isRead = Boolean(isRead)
    }

    const isApproving = status === "approved" && currentAppointment.status !== "approved"
    if (isApproving) {
      updateData.meetLink = currentAppointment.meetLink || generateGoogleMeetLink()
    }

    if (Object.keys(updateData).length === 0 && !isResending) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    let updated = currentAppointment
    if (Object.keys(updateData).length > 0) {
      updated = await prisma.appointment.update({
        where: { id },
        data: updateData,
      })
    }

    let emailSent = false
    let emailError: string | undefined = undefined

    if (isApproving || isResending) {
      const emailRes = await sendAppointmentApprovedEmail({
        name: updated.name,
        email: updated.email,
        subject: updated.subject,
        date: updated.date,
        meetLink: updated.meetLink!,
      })
      emailSent = emailRes.success
      emailError = emailRes.error
    }

    return NextResponse.json({ ok: true, data: updated, emailSent, emailError })

  } catch (err) {
    console.error("[Appointment PATCH] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Reject all other methods
export async function GET()    { return NextResponse.json({ ok: false }, { status: 405 }) }
export async function POST()   { return NextResponse.json({ ok: false }, { status: 405 }) }
export async function PUT()    { return NextResponse.json({ ok: false }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ ok: false }, { status: 405 }) }
