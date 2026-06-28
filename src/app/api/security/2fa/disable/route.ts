import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotp, hashBackupCode } from "@/lib/totp"
import { checkLimit, rateLimitResponse, TWO_FA_VERIFY } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

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

  const rl = await checkLimit(TWO_FA_VERIFY, session.user.id)
  if (!rl.allowed) return rateLimitResponse(rl)

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

  void logAudit({
    userId: session.user.id,
    action: "2fa.disable",
    resource: "security",
    resourceId: session.user.id,
    metadata: {},
  })

  return NextResponse.json({ ok: true })
}
