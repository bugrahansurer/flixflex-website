// ═══════════════════════════════════════════════════════════
// FlixFlex — First-party analytics (server-side recording)
//
// Cookieless page-view tracking stored in our own Postgres. Visitor
// identity is a daily-rotating salted hash of IP+UA so we can count
// unique visitors WITHOUT persistent cookies or storing raw IPs
// (Plausible-style, GDPR-friendly). No third-party services.
// ═══════════════════════════════════════════════════════════

import { createHash } from "crypto"
import prisma from "@/lib/prisma"

// Known bot / crawler user-agents — never recorded so metrics reflect humans.
const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|bingpreview|facebookexternalhit|whatsapp|telegrambot|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch/i

export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return true // no UA → almost always automated
  return BOT_RE.test(ua)
}

// ── Device / browser parsing (lightweight, no dependency) ──
export function parseDevice(ua: string): "desktop" | "mobile" | "tablet" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet"
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobile"
  return "desktop"
}

export function parseBrowser(ua: string): string {
  if (/edg[ea]?\//i.test(ua)) return "Edge"
  if (/opr\/|opera/i.test(ua)) return "Opera"
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet"
  if (/firefox|fxios/i.test(ua)) return "Firefox"
  if (/chrome|crios/i.test(ua)) return "Chrome"
  if (/safari/i.test(ua)) return "Safari"
  return "Other"
}

// ── Visitor hashing ────────────────────────────────────────
// Daily-rotating salt means a visitor's hash changes each day, so the
// data cannot be used to track someone across days — "unique visitors"
// is therefore a per-day figure, which is the privacy-first standard.
function dailySalt(): string {
  const secret = process.env.ANALYTICS_SALT || process.env.NEXTAUTH_SECRET || "ff-analytics-fallback"
  const day = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
  return `${secret}:${day}`
}

export function hashVisitor(ip: string, ua: string): string {
  return createHash("sha256").update(`${dailySalt()}:${ip}:${ua}`).digest("hex").slice(0, 32)
}

// ── Path normalisation ─────────────────────────────────────
// Drop query strings and trailing slashes so "/blog?x=1" and "/blog/"
// collapse to "/blog". Cap length defensively.
export function normalizePath(raw: string): string {
  if (!raw) return "/"
  let p = raw.split("?")[0].split("#")[0].trim()
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1)
  if (!p.startsWith("/")) p = "/" + p
  return p.slice(0, 512)
}

// Only record public marketing routes — never the admin panel or APIs.
export function isTrackablePath(path: string): boolean {
  return !/^\/(admin|api|giris|_next)(\/|$)/.test(path)
}

export interface PageViewInput {
  eventId: string
  path: string
  referrer?: string | null
  sessionId: string
  ip: string
  ua: string
  country?: string | null
}

/** Insert a page view. Silently no-ops on error (analytics must never break a page). */
export async function recordPageView(input: PageViewInput): Promise<void> {
  if (!prisma) return
  const path = normalizePath(input.path)
  if (!isTrackablePath(path)) return

  const ref = input.referrer ? input.referrer.slice(0, 512) : null
  try {
    await prisma.pageView.create({
      data: {
        eventId: input.eventId.slice(0, 64),
        path,
        referrer: ref && ref.length ? ref : null,
        visitorId: hashVisitor(input.ip, input.ua),
        sessionId: input.sessionId.slice(0, 64),
        device: parseDevice(input.ua),
        browser: parseBrowser(input.ua),
        country: input.country || null,
      },
    })
  } catch (err) {
    console.error("[analytics] recordPageView failed:", err)
  }
}

/** Attach the on-page dwell time to an existing page view (fired on unload). */
export async function recordDuration(eventId: string, durationMs: number): Promise<void> {
  if (!prisma) return
  const clamped = Math.max(0, Math.min(Math.round(durationMs), 1000 * 60 * 60)) // cap at 1h
  try {
    await prisma.pageView.update({
      where: { eventId: eventId.slice(0, 64) },
      data: { duration: clamped },
    })
  } catch {
    // The pageview may not exist (e.g. bot filtered) — ignore.
  }
}
