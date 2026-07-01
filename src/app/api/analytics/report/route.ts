// ═══════════════════════════════════════════════════════════
// FlixFlex — Analytics report API (admin, read-only)
//
// Returns aggregated first-party analytics for a date range.
// Gated by the `analytics:read` permission.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { requirePermission, jsonError } from "@/lib/ai/api-utils"
import { getReportData } from "@/lib/analytics/queries"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const gate = await requirePermission("analytics", "read")
  if (!gate.ok) return gate.response

  try {
    const { searchParams } = new URL(req.url)
    const fromRaw = searchParams.get("from")
    const toRaw = searchParams.get("to")

    const to = toRaw ? new Date(toRaw) : new Date()
    const from = fromRaw ? new Date(fromRaw) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return jsonError("Geçersiz tarih aralığı.", 400)
    }
    // Cap range to 366 days to keep queries bounded.
    if ((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000) > 366) {
      return jsonError("Tarih aralığı en fazla 366 gün olabilir.", 400)
    }

    const data = await getReportData(from, to)
    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error("[analytics/report GET]", err)
    return jsonError("Rapor verisi alınamadı.", 500)
  }
}
