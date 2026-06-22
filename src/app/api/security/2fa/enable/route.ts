import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotpStep, generateBackupCodes, hashBackupCode } from "@/lib/totp"
import { rateLimit } from "@/lib/rate-limit"

const enableSchema = z.object({
  token: z.string().trim().regex(/^\d{6}$/, "6 haneli doğrulama kodu girin."),
})

// POST { token } — verify the first code, then enable 2FA and return
// one-time backup codes (shown to the user exactly once).
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  // Brute-force guard on TOTP verification (per user). NOTE: in-memory /
  // per-instance — see lib/rate-limit.ts; use Upstash for a strict global limit.
  const rl = rateLimit({ namespace: "2fa-verify", key: session.user.id, max: 5, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla deneme. ${rl.retryAfter ?? 60} saniye sonra tekrar deneyin.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    )
  }

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

  // Return plaintext codes ONCE — they are only stored hashed.
  return NextResponse.json({ ok: true, backupCodes })
}
