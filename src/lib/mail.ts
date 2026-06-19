// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment Mailer Utility
// Supports Resend API and Nodemailer SMTP
// ═══════════════════════════════════════════════════════════

import nodemailer from "nodemailer"
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"

interface SendMailParams {
  name: string
  email: string
  subject: string
  date: Date
  meetLink: string
}

export async function sendAppointmentApprovedEmail({
  name,
  email,
  subject,
  date,
  meetLink
}: SendMailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Read dynamic settings
    const provider = (await getSetting<string>("mail.provider", "mock")) || "mock"
    const fromEmail = (await getSetting<string>("mail.from")) || "FlixFlex <onboarding@resend.dev>"

    const formattedDate = date.toLocaleString("tr-TR", {
      dateStyle: "long",
      timeStyle: "short"
    })

    // Premium styled HTML Template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Randevunuz Onaylandı!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #0A0A0A;
              color: #FFFFFF;
              margin: 0;
              padding: 0;
            }
            .wrapper {
              background-color: #0A0A0A;
              padding: 40px 20px;
            }
            .container {
              max-width: 560px;
              margin: 0 auto;
              background-color: #121212;
              border: 1px solid #222222;
              padding: 40px;
              border-top: 4px solid #A134FF;
            }
            .logo {
              font-size: 22px;
              font-weight: 800;
              color: #FFFFFF;
              letter-spacing: -0.04em;
              margin-bottom: 30px;
            }
            .logo span {
              color: #A134FF;
            }
            h1 {
              font-size: 20px;
              font-weight: 800;
              margin: 0 0 20px 0;
              color: #FFFFFF;
              letter-spacing: -0.02em;
            }
            p {
              font-size: 13.5px;
              line-height: 1.6;
              color: #A0A0A0;
              margin: 0 0 20px 0;
            }
            .card {
              background-color: #181818;
              border: 1px solid #2A2A2A;
              padding: 20px;
              margin-bottom: 24px;
            }
            .card-row {
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              font-size: 13px;
            }
            .card-row:last-child {
              margin-bottom: 0;
            }
            .label {
              color: #666666;
              font-weight: 600;
            }
            .value {
              color: #FFFFFF;
              font-weight: 700;
            }
            .value.highlight {
              color: #A134FF;
            }
            .button-wrap {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              background-color: #A134FF;
              color: #FFFFFF !important;
              text-decoration: none;
              padding: 12px 28px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              border: 1px solid #A134FF;
              border-radius: 0px;
              transition: all 0.2s ease;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #222222;
              padding-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #444444;
              letter-spacing: 0.08em;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="logo">Flix<span>Flex</span></div>
              <h1>Randevunuz Onaylandı</h1>
              <p>Merhaba <strong>${name}</strong>,</p>
              <p>FlixFlex ekibi ile gerçekleştireceğiniz ön görüşme randevu talebiniz onaylanmıştır. Görüşmemiz Google Meet üzerinden 30 dakika sürecektir.</p>
              
              <div class="card">
                <div class="card-row">
                  <span class="label">GÖRÜŞME KONUSU:</span>
                  <span class="value">${subject}</span>
                </div>
                <div class="card-row">
                  <span class="label">TARİH & SAAT:</span>
                  <span class="value highlight">${formattedDate}</span>
                </div>
                <div class="card-row">
                  <span class="label">SÜRE:</span>
                  <span class="value">30 Dakika</span>
                </div>
              </div>

              <p>Görüşme zamanı geldiğinde aşağıdaki butona tıklayarak toplantıya katılabilirsiniz:</p>
              
              <div class="button-wrap">
                <a href="${meetLink}" target="_blank" class="button">Görüşmeye Katıl</a>
              </div>
              
              <div class="footer">
                © ${new Date().getFullYear()} FLIXFLEX. TÜM HAKLARI SAKLIDIR.
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // ── CASE 1: SMTP ──────────────────────────────────
    if (provider === "smtp") {
      const host = (await getSetting<string>("mail.smtp.host", "")) || ""
      const portStr = (await getSetting<string>("mail.smtp.port", "587")) || "587"
      const user = (await getSetting<string>("mail.smtp.user", "")) || ""
      const pass = decryptSecret(await getSetting<string>("mail.smtp.pass", "")) || ""
      const secureSetting = (await getSetting<string>("mail.smtp.secure", "false")) || "false"
      const secure = secureSetting === "true"

      if (!host || !user || !pass) {
        return {
          success: false,
          error: "E-posta sunucusu (SMTP) yapılandırılması eksik (Host, Kullanıcı veya Şifre boş).",
        }
      }

      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(portStr) || 587,
        secure,
        auth: { user, pass },
      })

      // Send the mail
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: `Randevunuz Onaylandı! — ${formattedDate}`,
        html,
      })

      console.log(`✉️ [Mailer] SMTP Email sent successfully to ${email}`)
      return { success: true }
    }

    // ── CASE 2: RESEND ────────────────────────────────
    if (provider === "resend") {
      const apiKey = decryptSecret(await getSetting<string>("mail.resend.key")) || process.env.RESEND_API_KEY

      if (!apiKey) {
        return {
          success: false,
          error: "Resend API anahtarı (Resend API Key) yapılandırılmamış.",
        }
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `Randevunuz Onaylandı! — ${formattedDate}`,
          html,
        }),
      })

      const json = await response.json()
      if (response.ok) {
        console.log(`✉️ [Mailer] Resend Email sent successfully to ${email}. ID: ${json.id}`)
        return { success: true }
      } else {
        return {
          success: false,
          error: json.message || `Resend API hatası (Kod: ${response.status})`,
        }
      }
    }

    // ── CASE 3: MOCK / NOT CONFIGURED ─────────────────
    return {
      success: false,
      error: "E-posta entegrasyonu pasif (Mock Modu). Randevu onaylandı ancak e-posta bildirim gönderimi yapılmadı.",
    }
  } catch (err: any) {
    console.error("❌ [Mailer] Email send failed:", err)
    return {
      success: false,
      error: `E-posta gönderiminde teknik hata: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
