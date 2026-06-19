// ═══════════════════════════════════════════════════════════
// FlixFlex — Email Connection Tester API Route
// POST /api/settings/email/test — admin authentication required
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/ai/api-utils"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()
    const {
      provider,
      from,
      resendKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      testEmail,
    } = body

    if (!testEmail) {
      return NextResponse.json({ success: false, error: "Test e-posta adresi belirtilmedi." }, { status: 400 })
    }

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

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        secure: smtpSecure === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      // Verify connection configuration
      try {
        await transporter.verify()
      } catch (verifyErr: any) {
        return NextResponse.json({
          success: false,
          error: `SMTP Bağlantı/Kimlik Doğrulama Hatası: ${verifyErr.message || String(verifyErr)}`
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
  } catch (err: any) {
    console.error("[Email Test POST]", err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
