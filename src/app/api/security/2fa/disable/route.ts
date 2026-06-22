import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotp, hashBackupCode } from "@/lib/totp"
import { rateLimit } from "@/lib/rate-limit"

// token = 6 haneli TOTP VEYA yedek kod (ör. "A1B2C-D3E4F"); geçerli yedek
// kodlar reddedilmesin diye şekli esnek tutuyoruz — asıl brute-force koruması
// rate limit'tir.
const disableSchema = z.object({
  token: z.string().trim().min(6).max(20).regex(/^[A-Za-z0-9-]+$/, "Geçersiz kod."),
})

// POST { token } — verify a current TOTP code (or a backup code), then
// disable 2FA and wipe the secret + backup codes.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  if (!prisma) return NextResponse.json({ error: "Veritabanı yok" }, { status: 503 })

  const rl = rateLimit({ namespace: "2fa-verify", key: session.user.id, max: 5, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla deneme. ${rl.retryAfter ?? 60} saniye sonra tekrar deneyin.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    )
  }

  const parsed = disableSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz kod." }, { status: 400 })
  }
  const token = parsed.data.token

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
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorPendingSecret: null, twoFactorBackupCodes: [], twoFactorLastUsedStep: null },
  })

  return NextResponse.json({ ok: true })
}
