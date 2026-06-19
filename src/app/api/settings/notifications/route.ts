import { NextRequest, NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import { getSetting, setSetting } from "@/lib/settings"

export async function GET() {
  const gate = await requirePermission("settings", "read")
  if (!gate.ok) return gate.response

  const data = {
    contactEnabled: (await getSetting<boolean>("notifications.contact.enabled", false)) ?? false,
    appointmentEnabled: (await getSetting<boolean>("notifications.appointment.enabled", false)) ?? false,
    recipients: (await getSetting<string>("notifications.recipients", "")) ?? "",
  }
  return NextResponse.json({ ok: true, data })
}

export async function POST(req: NextRequest) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()
    if (body.contactEnabled !== undefined)
      await setSetting("notifications.contact.enabled", Boolean(body.contactEnabled), "boolean")
    if (body.appointmentEnabled !== undefined)
      await setSetting("notifications.appointment.enabled", Boolean(body.appointmentEnabled), "boolean")
    if (body.recipients !== undefined)
      await setSetting("notifications.recipients", String(body.recipients))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[settings/notifications POST]", err)
    return jsonError("Bildirim ayarları kaydedilemedi.", 500)
  }
}
