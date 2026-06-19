import { NextRequest, NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import { getSetting, setSetting } from "@/lib/settings"
import { encryptSecret, decryptSecret } from "@/lib/crypto"

export async function GET() {
  const gate = await requirePermission("settings", "read")
  if (!gate.ok) return gate.response

  const data = {
    // Secret values are stored encrypted at rest; decrypt for the
    // authenticated admin form (transparent for legacy plaintext rows).
    anthropicKey: decryptSecret(await getSetting("ai.provider.anthropic.key", "")),
    openaiKey:    decryptSecret(await getSetting("ai.provider.openai.key", "")),
    geminiKey:    decryptSecret(await getSetting("ai.provider.gemini.key", "")),
    defaultModel: await getSetting("ai.default.model", "claude-3-5-sonnet-20240620"),

    gaMeasurementId: await getSetting("analytics.google.ga4", ""),
    gtmId:           await getSetting("analytics.google.gtm", ""),
    pixelId:         await getSetting("analytics.meta.pixel", ""),

    resendApiKey:    decryptSecret(await getSetting("mail.resend.key", "")),
    mailchimpKey:    decryptSecret(await getSetting("mail.mailchimp.key", "")),
  }

  return NextResponse.json({ ok: true, data })
}

export async function POST(req: NextRequest) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()

    // AI — encrypt provider keys at rest
    if (body.anthropicKey !== undefined) await setSetting("ai.provider.anthropic.key", encryptSecret(body.anthropicKey))
    if (body.openaiKey !== undefined)    await setSetting("ai.provider.openai.key",    encryptSecret(body.openaiKey))
    if (body.geminiKey !== undefined)    await setSetting("ai.provider.gemini.key",    encryptSecret(body.geminiKey))
    if (body.defaultModel !== undefined) await setSetting("ai.default.model",          body.defaultModel)

    // Analytics — public IDs, stored as-is
    if (body.gaMeasurementId !== undefined) await setSetting("analytics.google.ga4", body.gaMeasurementId)
    if (body.gtmId !== undefined)           await setSetting("analytics.google.gtm", body.gtmId)
    if (body.pixelId !== undefined)         await setSetting("analytics.meta.pixel", body.pixelId)

    // Marketing — encrypt API keys at rest
    if (body.resendApiKey !== undefined) await setSetting("mail.resend.key", encryptSecret(body.resendApiKey))
    if (body.mailchimpKey !== undefined) await setSetting("mail.mailchimp.key", encryptSecret(body.mailchimpKey))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[settings/integrations POST]", err)
    return jsonError("Ayarlar kaydedilirken bir hata oluştu.", 500)
  }
}
