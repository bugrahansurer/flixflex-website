import { NextResponse } from "next/server"
import QRCode from "qrcode"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { encryptSecret } from "@/lib/crypto"
import { generateSecret, otpauthUri } from "@/lib/totp"

// POST — begin 2FA enrollment: generate a provisional secret (stored
// encrypted but NOT yet enabled), return the otpauth URI + QR data URL.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  const secret = generateSecret()
  const uri = otpauthUri(secret, session.user.email ?? session.user.id)
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 })

  // Store provisional secret (encrypted). Enabled only after a verified code.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: encryptSecret(secret), twoFactorEnabled: false },
  })

  return NextResponse.json({ ok: true, secret, uri, qr })
}
