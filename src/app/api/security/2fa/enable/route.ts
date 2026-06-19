import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotpStep, generateBackupCodes, hashBackupCode } from "@/lib/totp"

// POST { token } — verify the first code, then enable 2FA and return
// one-time backup codes (shown to the user exactly once).
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const token = String(body.token ?? "")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.twoFactorSecret) {
    return NextResponse.json({ error: "Önce kurulum yapın." }, { status: 400 })
  }

  const secret = decryptSecret(user.twoFactorSecret)
  const matchedStep = verifyTotpStep(secret, token)
  if (matchedStep === null) {
    return NextResponse.json({ error: "Kod doğrulanamadı. Tekrar deneyin." }, { status: 400 })
  }

  const backupCodes = generateBackupCodes(10)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupCodes.map(hashBackupCode),
      // Mark the enrollment code's step as consumed so it can't be replayed at login.
      twoFactorLastUsedStep: matchedStep,
    },
  })

  // Return plaintext codes ONCE — they are only stored hashed.
  return NextResponse.json({ ok: true, backupCodes })
}
