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
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"
import { connectionTestEmail } from "@/lib/email/templates"

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
    const { provider, from, resendKey, smtpHost, smtpPort, smtpUser, smtpPass: smtpPassInput, smtpSecure, testEmail } = parsed.data

    const fromAddress = from || "FlixFlex <onboarding@resend.dev>"
    // Formdaki (henüz kaydedilmemiş olabilecek) sağlayıcı bilgileriyle, sitenin
    // gerçek şablonu kullanılarak gönderilir.
    const { subject, body } = await connectionTestEmail()
    const html = body.html
    const text = body.text

    // Formda boş bırakılan gizli alanlar için kayıtlı (şifreli) değer kullanılır —
    // form kayıtlı değeri artık görmez.
    const smtpPass = smtpPassInput || decryptSecret(await getSetting<string>("mail.smtp.pass", ""))

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
        text,
      })

      return NextResponse.json({ success: true })
    }

    if (provider === "resend") {
      const apiKey =
        resendKey ||
        decryptSecret(await getSetting<string>("mail.resend.key", "")) ||
        process.env.RESEND_API_KEY
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
          text,
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
