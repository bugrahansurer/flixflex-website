// ═══════════════════════════════════════════════════════════
// FlixFlex — Email Connection Tester API Route
// POST /api/settings/email/test — admin authentication required
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import net from "node:net"
import dns from "node:dns/promises"
import { requirePermission } from "@/lib/ai/api-utils"
import nodemailer from "nodemailer"

// ── Request validation ─────────────────────────────────────
const testEmailSchema = z.object({
  provider:   z.enum(["smtp", "resend", "mock"]).optional(),
  from:       z.string().max(200).optional(),
  resendKey:  z.string().max(300).optional(),
  smtpHost:   z.string().max(255).optional(),
  smtpPort:   z.string().max(10).optional(),
  smtpUser:   z.string().max(255).optional(),
  smtpPass:   z.string().max(500).optional(),
  smtpSecure: z.string().max(10).optional(),
  testEmail:  z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Geçerli bir test e-posta adresi girin."),
})

// ── SSRF guard ─────────────────────────────────────────────
// Reject SMTP hosts that resolve to loopback / private / link-local ranges
// (incl. 169.254.169.254 cloud metadata). Denylist — public mail servers pass.
function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number)
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    )
  }
  const lower = ip.toLowerCase()
  return (
    lower === "::1" ||
    lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80") ||
    lower.startsWith("::ffff:127.") || lower.startsWith("::ffff:10.") ||
    lower.startsWith("::ffff:192.168.") || lower.startsWith("::ffff:169.254.")
  )
}

async function assertPublicSmtpHost(host: string): Promise<void> {
  const h = host.trim().toLowerCase().replace(/\.$/, "")
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) {
    throw new Error("blocked-host")
  }
  if (net.isIP(h)) {
    if (isBlockedIp(h)) throw new Error("blocked-host")
    return
  }
  // Resolve hostname; block only if a resolved address is internal. A DNS
  // failure (typo'd host) is left to nodemailer to surface generically.
  let records: { address: string }[]
  try {
    records = await dns.lookup(h, { all: true })
  } catch {
    return
  }
  if (records.some((r) => isBlockedIp(r.address))) throw new Error("blocked-host")
}

export async function POST(req: NextRequest) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response

  try {
    const parsed = testEmailSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz istek." },
        { status: 400 }
      )
    }
    const { provider, from, resendKey, smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, testEmail } = parsed.data

    const fromAddress = from || "FlixFlex <onboarding@resend.dev>"
    const subject = `FlixFlex E-posta Entegrasyon Testi`
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0A; padding: 40px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #121212; border: 1px solid #222; padding: 40px; border-top: 4px solid #A134FF;">
          <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; margin-bottom: 10px;">Bağlantı Başarılı!</h1>
          <p style="color: #A0A0A0; font-size: 13px; line-height: 1.6;">Tebrikler, FlixFlex e-posta yapılandırmanız sorunsuz çalışıyor. Artık randevu onayları otomatik olarak gönderilebilir.</p>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #444; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;">© FlixFlex E-posta Test Servisi</p>
        </div>
      </div>
    `

    if (provider === "smtp") {
      if (!smtpHost || !smtpUser || !smtpPass) {
        return NextResponse.json({ success: false, error: "SMTP sunucusu yapılandırılması eksik (Sunucu adresi, kullanıcı adı veya şifre boş)." })
      }

      // SSRF guard: block loopback / private / link-local (cloud metadata) hosts.
      try {
        await assertPublicSmtpHost(smtpHost)
      } catch {
        return NextResponse.json(
          { success: false, error: "İzin verilmeyen SMTP sunucu adresi." },
          { status: 400 }
        )
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort ?? "587") || 587,
        secure: smtpSecure === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      // Verify connection configuration
      try {
        await transporter.verify()
      } catch (verifyErr) {
        console.error("[Email Test] SMTP verify failed:", verifyErr)
        return NextResponse.json({
          success: false,
          error: "SMTP bağlantısı/kimlik doğrulaması başarısız. Sunucu adresi, port ve kimlik bilgilerini kontrol edin.",
        })
      }

      // Send the mail
      await transporter.sendMail({
        from: fromAddress,
        to: testEmail,
        subject,
        html,
      })

      return NextResponse.json({ success: true })
    }

    if (provider === "resend") {
      const apiKey = resendKey || process.env.RESEND_API_KEY
      if (!apiKey) {
        return NextResponse.json({ success: false, error: "Resend API anahtarı boş." })
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [testEmail],
          subject,
          html,
        }),
      })

      const json = await response.json()
      if (response.ok) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({
          success: false,
          error: json.message || `Resend API hatası (Kod: ${response.status})`,
        })
      }
    }

    if (provider === "mock") {
      return NextResponse.json({
        success: false,
        error: "Mock modunda e-posta gönderimi simüle edilmiştir. Gerçek mail göndermek için SMTP veya Resend seçiniz.",
      })
    }

    return NextResponse.json({ success: false, error: "Bilinmeyen e-posta sağlayıcısı." })
  } catch (err) {
    console.error("[Email Test POST]", err)
    return NextResponse.json({
      success: false,
      error: "Test e-postası gönderilirken bir hata oluştu.",
    })
  }
}
