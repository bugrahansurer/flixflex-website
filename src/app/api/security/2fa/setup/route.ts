import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { encryptSecret, decryptSecret } from "@/lib/crypto"
import { generateSecret, otpauthUri, verifyTotp, hashBackupCode } from "@/lib/totp"
import { rateLimit } from "@/lib/rate-limit"

// POST — begin 2FA enrollment: generate a provisional secret (stored
// encrypted but NOT yet enabled), return the otpauth URI + QR data URL.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  // Bound provisional-secret regeneration per user.
  const rl = rateLimit({ namespace: "2fa-setup", key: session.user.id, max: 5, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla deneme. ${rl.retryAfter ?? 60} saniye sonra tekrar deneyin.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  // If 2FA is already active, re-enrollment must prove current ownership —
  // otherwise a hijacked session could silently rebind the authenticator.
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const body = await req.json().catch(() => ({}))
    const token = String(body.token ?? "").trim()
    const activeSecret = decryptSecret(user.twoFactorSecret)
    const ok = verifyTotp(activeSecret, token) || user.twoFactorBackupCodes.includes(hashBackupCode(token))
    if (!ok) {
      return NextResponse.json(
        { error: "2FA zaten etkin. Yeniden kurulum için mevcut doğrulama kodunuzu girin." },
        { status: 400 }
      )
    }
  }

  const secret = generateSecret()
  const uri = otpauthUri(secret, session.user.email ?? session.user.id)
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 })

  // Store as PENDING only — never overwrite the active secret / enabled state.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorPendingSecret: encryptSecret(secret) },
  })

  return NextResponse.json({ ok: true, secret, uri, qr })
}
