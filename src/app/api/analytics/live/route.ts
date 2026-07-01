// ═══════════════════════════════════════════════════════════
// FlixFlex — Live analytics snapshot (admin, read-only)
// Polled by the integrations page to show real-time visit activity.
// ═══════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/ai/api-utils"
import { getLiveStats } from "@/lib/analytics/queries"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const gate = await requirePermission("analytics", "read")
  if (!gate.ok) return gate.response

  try {
    const data = await getLiveStats()
    return NextResponse.json({ ok: true, data })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
