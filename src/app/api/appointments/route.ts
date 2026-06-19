// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment API Route
// GET/POST /api/appointments — validate, save, query (admin only)
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { appointmentSchema } from "@/lib/validators/appointment-schema"
import { notifyAdmins } from "@/lib/notify"

// Booking window guards: no past dates, max 3 months ahead.
const MAX_LEAD_MS = 1000 * 60 * 60 * 24 * 90 // 90 days

// GET — List all appointments (Admin only)
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasPermission(session.user.permissions ?? [], "appointments", "read")) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
  }

  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ ok: true, data: appointments })
  } catch (err) {
    console.error("[Appointments GET] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST — Create a new appointment (Public)
export async function POST(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { ok: false, message: "Veritabanı bağlantısı kurulamadı." },
        { status: 503 }
      )
    }

    // Rate limit by IP — 3 bookings / 60s
    const ip = getClientIp(req)
    const { allowed, retryAfter } = rateLimit({ namespace: "appointments", key: ip, max: 3, windowMs: 60_000 })

    if (!allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: `Çok fazla istek gönderildi. Lütfen ${retryAfter} saniye bekleyip tekrar deneyin.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      )
    }

    // Parse body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { ok: false, message: "Geçersiz JSON gövdesi." },
        { status: 400 }
      )
    }

    // Zod validation
    const result = appointmentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { ok: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, date, notes } = result.data

    // ── Date sanity: must be a valid future date within the window ──
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { ok: false, message: "Geçersiz tarih formatı." },
        { status: 400 }
      )
    }
    const now = Date.now()
    if (parsedDate.getTime() <= now) {
      return NextResponse.json(
        { ok: false, message: "Geçmiş bir tarih için randevu alınamaz." },
        { status: 400 }
      )
    }
    if (parsedDate.getTime() > now + MAX_LEAD_MS) {
      return NextResponse.json(
        { ok: false, message: "En fazla 3 ay sonrası için randevu alabilirsiniz." },
        { status: 400 }
      )
    }

    // Double check if slot is blocked or already booked
    const blockedSlot = await prisma.blockedSlot.findUnique({
      where: { date: parsedDate },
    })

    if (blockedSlot) {
      return NextResponse.json(
        { ok: false, message: "Bu randevu saati kilitlidir. Lütfen başka bir saat seçin." },
        { status: 400 }
      )
    }

    const existingBooking = await prisma.appointment.findFirst({
      where: {
        date: parsedDate,
        status: { in: ["pending", "approved"] },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { ok: false, message: "Bu randevu saati doludur. Lütfen başka bir saat seçin." },
        { status: 400 }
      )
    }

    // Create record in database
    const appointment = await prisma.appointment.create({
      data: {
        name,
        email,
        phone,
        subject,
        date: parsedDate,
        notes: notes || null,
        status: "pending",
        isRead: false,
      },
    })

    console.log("📅 [FlixFlex Appointment] New appointment created:", appointment)

    // Notify admins (respects notifications settings; never blocks the user).
    try {
      await notifyAdmins("appointment", {
        title: "Yeni randevu talebi alındı",
        rows: [
          { label: "Ad", value: name },
          { label: "E-posta", value: email },
          { label: "Telefon", value: phone },
          { label: "Konu", value: subject },
          { label: "Tarih", value: parsedDate.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" }) },
        ],
      })
    } catch (notifyErr) {
      console.error("[FlixFlex Appointment] notify failed:", notifyErr)
    }

    return NextResponse.json(
      { ok: true, appointmentId: appointment.id },
      { status: 201 }
    )
  } catch (err) {
    console.error("[FlixFlex Appointment] Unexpected error:", err)
    return NextResponse.json(
      { ok: false, message: "Randevu oluşturulurken beklenmedik bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    )
  }
}

// ── Reject all other methods ──
export async function PUT()    { return NextResponse.json({ ok: false }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ ok: false }, { status: 405 }) }
