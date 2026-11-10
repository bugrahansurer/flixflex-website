// ═══════════════════════════════════════════════════════════
// FlixFlex — Contact API Route
// POST /api/contact — validate, simulate send, return ref
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse, after } from "next/server"
import prisma from "@/lib/prisma"
import { contactSchema, SERVICE_LABELS } from "@/lib/validators/contact-schema"
import { checkLimit, getClientIp, rateLimitResponse, PUBLIC_FORM } from "@/lib/rate-limit"
import { notifyAdmins, notifyCustomer } from "@/lib/notify"
import { contactReceivedEmail } from "@/lib/email/templates"

// ── Helper: short random ref ───────────────────────────────
function generateRef(): string {
  return `FF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

// ── POST handler ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(req)
    const rlResult = await checkLimit(PUBLIC_FORM, ip)
    if (!rlResult.allowed) return rateLimitResponse(rlResult)

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
    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { ok: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = result.data

    // Persist the submission so it appears in the admin inbox. Phone
    // and budget aren't first-class columns on ContactSubmission, so
    // fold them into the stored message for the team's reference.
    const extra: string[] = []
    if (data.phone)  extra.push(`Telefon: ${data.phone}`)
    if (data.budget) extra.push(`Bütçe: ${data.budget}`)
    const storedMessage = extra.length
      ? `${data.message}\n\n—\n${extra.join("\n")}`
      : data.message

    if (prisma) {
      try {
        await prisma.contactSubmission.create({
          data: {
            name:    data.name,
            email:   data.email,
            company: data.company ?? null,
            service: data.service,
            message: storedMessage,
          },
        })
      } catch (dbErr) {
        // Don't fail the user's submission if persistence hiccups —
        // log server-side and still return success.
        console.error("[FlixFlex Contact] DB persist failed:", dbErr)
      }
    }

    // E-postalar yanıttan sonra gönderilir (form beklemez, hata kullanıcıyı etkilemez).
    const serviceLabel = data.service ? SERVICE_LABELS[data.service] ?? String(data.service) : undefined
    after(async () => {
      await notifyAdmins("contact", {
        title: "Yeni iletişim mesajı alındı",
        customerName: data.name,
        customerEmail: data.email,
        rows: [
          { label: "Ad", value: data.name },
          { label: "E-posta", value: data.email },
          ...(data.phone ? [{ label: "Telefon", value: data.phone }] : []),
          ...(data.company ? [{ label: "Şirket", value: data.company }] : []),
          ...(serviceLabel ? [{ label: "Hizmet", value: serviceLabel }] : []),
          ...(data.budget ? [{ label: "Bütçe", value: data.budget }] : []),
          { label: "Mesaj", value: data.message },
        ],
      })
      await notifyCustomer(data.email, contactReceivedEmail({ name: data.name, service: serviceLabel }))
    })

    const ref = generateRef()

    return NextResponse.json(
      { ok: true, ref },
      { status: 200 }
    )
  } catch (err) {
    console.error("[FlixFlex Contact] Unexpected error:", err)
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    )
  }
}

// ── Reject all other methods ───────────────────────────────
export async function GET()    { return NextResponse.json({ ok: false }, { status: 405 }) }
export async function PUT()    { return NextResponse.json({ ok: false }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ ok: false }, { status: 405 }) }
