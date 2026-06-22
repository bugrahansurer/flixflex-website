// ═══════════════════════════════════════════════════════════
// FlixFlex — Email Settings API Route
// GET/POST /api/settings/email — admin authentication required
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import { getSetting, setSetting } from "@/lib/settings"
import { encryptSecret, decryptSecret } from "@/lib/crypto"

export async function GET() {
  // Secret-bearing settings — gate on the `settings` resource, NOT ai:create.
  const gate = await requirePermission("settings", "read")
  if (!gate.ok) return gate.response

  const data = {
    provider:    await getSetting("mail.provider", "mock"),
    from:        await getSetting("mail.from", "FlixFlex <onboarding@resend.dev>"),
    // Sensitive values are stored encrypted at rest; decrypt for the
    // authenticated admin form (transparent for legacy plaintext rows).
    resendKey:   decryptSecret(await getSetting("mail.resend.key", "")),
    smtpHost:    await getSetting("mail.smtp.host", ""),
    smtpPort:    await getSetting("mail.smtp.port", "587"),
    smtpUser:    await getSetting("mail.smtp.user", ""),
    smtpPass:    decryptSecret(await getSetting("mail.smtp.pass", "")),
    smtpSecure:  await getSetting("mail.smtp.secure", "false"),
  }

  return NextResponse.json({ ok: true, data })
}

export async function POST(req: NextRequest) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()

    if (body.provider !== undefined)   await setSetting("mail.provider",    body.provider)
    if (body.from !== undefined)       await setSetting("mail.from",        body.from)
    // Encrypt sensitive secrets at rest (API key + SMTP password).
    if (body.resendKey !== undefined)  await setSetting("mail.resend.key",  encryptSecret(body.resendKey))
    if (body.smtpHost !== undefined)   await setSetting("mail.smtp.host",   body.smtpHost)
    if (body.smtpPort !== undefined)   await setSetting("mail.smtp.port",   body.smtpPort)
    if (body.smtpUser !== undefined)   await setSetting("mail.smtp.user",   body.smtpUser)
    if (body.smtpPass !== undefined)   await setSetting("mail.smtp.pass",   encryptSecret(body.smtpPass))
    if (body.smtpSecure !== undefined) await setSetting("mail.smtp.secure", body.smtpSecure)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[settings/email POST]", err)
    return jsonError("E-posta ayarları kaydedilirken hata oluştu.", 500)
  }
}
