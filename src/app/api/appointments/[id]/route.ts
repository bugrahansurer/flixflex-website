// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment ID actions API Route
// PATCH /api/appointments/[id] — admin authentication required
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { getSetting } from "@/lib/settings"
import { sendEmail } from "@/lib/email/send"
import { appointmentApprovedEmail, appointmentCancelledEmail } from "@/lib/email/templates"

/**
 * Görüşme linki: Admin › Ayarlar › E-posta'daki sabit toplantı linki.
 * (Eskiden rastgele harflerle sahte bir Meet linki üretiliyordu; Google'da
 * böyle bir toplantı yoktu.) Ayar boşsa link gönderilmez, e-posta
 * "bağlantı ayrıca iletilecek" der.
 */
async function getMeetingUrl(): Promise<string | null> {
  const url = ((await getSetting<string>("appointments.meetingUrl", "")) || "").trim()
  return /^https:\/\//i.test(url) ? url : null
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
    const isCancelling =
      status === "cancelled" && ["pending", "approved"].includes(currentAppointment.status)
    const meetingUrl = isApproving || isResending ? await getMeetingUrl() : null
    if (isApproving || isResending) {
      updateData.meetLink = meetingUrl
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

    if (isApproving || isResending || isCancelling) {
      const info = { name: updated.name, subject: updated.subject, date: updated.date }
      const { subject, body } = isCancelling
        ? await appointmentCancelledEmail(info)
        : await appointmentApprovedEmail({ ...info, meetLink: meetingUrl })
      const emailRes = await sendEmail({ to: updated.email, subject, body })
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
