import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import { getSetting, setSetting } from "@/lib/settings"

// ── GET — current maintenance config ──────────────────────
export async function GET() {
  const gate = await requirePermission("settings", "read")
  if (!gate.ok) return gate.response

  const data = {
    enabled: (await getSetting<boolean>("maintenance.enabled", false)) ?? false,
    title: (await getSetting<string>("maintenance.title", "")) ?? "",
    message: (await getSetting<string>("maintenance.message", "")) ?? "",
  }
  return NextResponse.json({ ok: true, data })
}

// ── POST — update maintenance config ──────────────────────
export async function POST(req: NextRequest) {
  const gate = await requirePermission("settings", "update")
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()
    if (body.enabled !== undefined) await setSetting("maintenance.enabled", Boolean(body.enabled), "boolean")
    if (body.title !== undefined) await setSetting("maintenance.title", String(body.title))
    if (body.message !== undefined) await setSetting("maintenance.message", String(body.message))
    // Apply immediately to the (ISR-cached) public site.
    revalidatePath("/", "layout")
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[settings/maintenance POST]", err)
    return jsonError("Bakım modu ayarları kaydedilemedi.", 500)
  }
}
