import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotpStep, generateBackupCodes, hashBackupCode } from "@/lib/totp"
import { checkLimit, rateLimitResponse, TWO_FA_VERIFY } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

const enableSchema = z.object({
  token: z.string().trim().regex(/^\d{6}$/, "6 haneli doğrulama kodu girin."),
})

// POST { token } — verify the first code, then enable 2FA and return
// one-time backup codes (shown to the user exactly once).
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  // Brute-force guard on TOTP verification (per user).
  const rl = await checkLimit(TWO_FA_VERIFY, session.user.id)
  if (!rl.allowed) return rateLimitResponse(rl)

  const parsed = enableSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz kod." }, { status: 400 })
  }
  const token = parsed.data.token

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.twoFactorPendingSecret) {
    return NextResponse.json({ error: "Önce kurulum yapın." }, { status: 400 })
  }

  const secret = decryptSecret(user.twoFactorPendingSecret)
  const matchedStep = verifyTotpStep(secret, token)
  if (matchedStep === null) {
    return NextResponse.json({ error: "Kod doğrulanamadı. Tekrar deneyin." }, { status: 400 })
  }

  const backupCodes = generateBackupCodes(10)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Promote the verified pending secret to the active one, then clear pending.
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorPendingSecret: null,
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupCodes.map(hashBackupCode),
      // Mark the enrollment code's step as consumed so it can't be replayed at login.
      twoFactorLastUsedStep: matchedStep,
    },
  })

  void logAudit({
    userId: session.user.id,
    action: "2fa.enable",
    resource: "security",
    resourceId: session.user.id,
    metadata: {},
  })

  // Return plaintext codes ONCE — they are only stored hashed.
  return NextResponse.json({ ok: true, backupCodes })
}
