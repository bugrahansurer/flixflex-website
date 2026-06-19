import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotp, hashBackupCode } from "@/lib/totp"

// POST { token } — verify a current TOTP code (or a backup code), then
// disable 2FA and wipe the secret + backup codes.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const token = String(body.token ?? "")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA zaten kapalı." }, { status: 400 })
  }

  const secret = decryptSecret(user.twoFactorSecret)
  const codeHash = hashBackupCode(token)
  const valid = verifyTotp(secret, token) || user.twoFactorBackupCodes.includes(codeHash)
  if (!valid) {
    return NextResponse.json({ error: "Kod doğrulanamadı." }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [], twoFactorLastUsedStep: null },
  })

  return NextResponse.json({ ok: true })
}
