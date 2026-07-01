// ═══════════════════════════════════════════════════════════
// FlixFlex — Analytics collector (public, first-party)
//
// Receives cookieless page-view beacons from the public site.
// Two event kinds:
//   • "pageview"  — a new page view (path, referrer, session)
//   • "duration"  — dwell time for a previously-sent pageview
//
// Kept deliberately tiny and fail-open: analytics must never break
// the site, and a failed beacon is simply dropped.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkLimit, getClientIp, ANALYTICS } from "@/lib/rate-limit"
import { recordPageView, recordDuration, isBot } from "@/lib/analytics/track"

// Force Node runtime — the tracker uses `crypto` for visitor hashing.
export const runtime = "nodejs"

const schema = z.object({
  type: z.enum(["pageview", "duration"]),
  eventId: z.string().min(8).max(64),
  path: z.string().max(512).optional(),
  referrer: z.string().max(512).optional().nullable(),
  sessionId: z.string().min(4).max(64).optional(),
  duration: z.number().finite().nonnegative().optional(),
})

export async function POST(req: NextRequest) {
  // Always answer 204 so the browser's sendBeacon never surfaces an error.
  const ok = () => new NextResponse(null, { status: 204 })

  try {
    const ua = req.headers.get("user-agent")
    if (isBot(ua)) return ok() // silently ignore bots/crawlers

    const ip = getClientIp(req)
    const limit = await checkLimit(ANALYTICS, ip)
    if (!limit.allowed) return ok() // over quota — drop silently

    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return ok()
    const data = parsed.data

    if (data.type === "pageview") {
      if (!data.path || !data.sessionId) return ok()
      await recordPageView({
        eventId: data.eventId,
        path: data.path,
        referrer: data.referrer ?? null,
        sessionId: data.sessionId,
        ip,
        ua: ua ?? "",
        country: req.headers.get("x-vercel-ip-country"),
      })
    } else {
      await recordDuration(data.eventId, data.duration ?? 0)
    }

    return ok()
  } catch {
    return ok()
  }
}
