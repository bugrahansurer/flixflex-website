"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — First-party analytics tracker (client)
//
// Fires a cookieless "pageview" beacon on every route change and a
// "duration" beacon when the page is hidden/unloaded. Also relays SPA
// route changes to GA4 / Meta Pixel (which otherwise only see the
// first load) so the ad platforms get accurate page_view counts.
// Renders nothing.
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

const ENDPOINT = "/api/analytics/collect"

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getSessionId(): string {
  try {
    let s = sessionStorage.getItem("ff_sid")
    if (!s) {
      s = uid()
      sessionStorage.setItem("ff_sid", s)
    }
    return s
  } catch {
    return uid()
  }
}

function send(body: string, beacon: boolean) {
  try {
    if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }))
      return
    }
    fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* analytics must never throw */
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const current = useRef<{ eventId: string; start: number } | null>(null)

  // Send dwell time for the page we're leaving.
  const flush = () => {
    const c = current.current
    if (!c) return
    send(JSON.stringify({ type: "duration", eventId: c.eventId, duration: Date.now() - c.start }), true)
  }

  useEffect(() => {
    // New page: close out the previous one first (SPA navigation).
    flush()

    const eventId = uid()
    current.current = { eventId, start: Date.now() }

    send(
      JSON.stringify({
        type: "pageview",
        eventId,
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        sessionId: getSessionId(),
      }),
      false,
    )

    // Relay the SPA navigation to the ad pixels (initial load is handled by
    // their own snippets; subsequent client navigations are not).
    const w = window as unknown as {
      gtag?: (...a: unknown[]) => void
      fbq?: (...a: unknown[]) => void
    }
    try {
      w.gtag?.("event", "page_view", { page_path: pathname })
      w.fbq?.("track", "PageView")
    } catch {
      /* noop */
    }
  }, [pathname])

  // Flush on tab hide / navigation away.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush()
    }
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", flush)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", flush)
    }
  }, [])

  return null
}
