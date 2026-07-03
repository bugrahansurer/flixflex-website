"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Cookie, X } from "@/lib/icons"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Çerez Onay Banner'ı (KVKK/GDPR + Google Consent Mode v2)
//
// • İlk ziyarette görünür; seçim `ff_cookie_consent` çerezinde saklanır.
// • Kabul → Google Consent Mode "granted" + Meta Pixel "grant".
// • Reddet → varsayılan "denied" korunur + Meta "revoke".
// Pixel'ler her zaman yüklenir (tespit için) ama izin verilene kadar
// çerez yazmadan (cookieless) çalışır — bkz. site-pixels.tsx.
// ═══════════════════════════════════════════════════════════

const COOKIE = "ff_cookie_consent"
const MAX_AGE = 60 * 60 * 24 * 180 // 180 gün

type Choice = "accepted" | "rejected"

function readConsent(): Choice | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(/(?:^|; )ff_cookie_consent=([^;]+)/)
  const v = m?.[1]
  return v === "accepted" || v === "rejected" ? v : null
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyConsent(choice: Choice) {
  document.cookie = `${COOKIE}=${choice}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
  const w = window as any
  if (choice === "accepted") {
    w.gtag?.("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    })
    w.fbq?.("consent", "grant")
  } else {
    w.gtag?.("consent", "update", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    })
    w.fbq?.("consent", "revoke")
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function CookieConsent() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    // Seçim yoksa banner'ı göster (kısa gecikme — LCP'yi etkilemesin).
    if (readConsent() === null) {
      const t = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const choose = React.useCallback((choice: Choice) => {
    applyConsent(choice)
    setOpen(false)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Çerez tercihleri"
          className={cn(
            "fixed z-[120] bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md",
            "ff-shape-container border border-[var(--border)] bg-[var(--surface-elevated)]/95 backdrop-blur-xl",
            "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] p-5"
          )}
        >
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => choose("rejected")}
            className="absolute top-3 right-3 text-[var(--foreground-faint)] hover:text-[var(--ff-purple)] transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3">
            <span className="ff-shape-button w-9 h-9 shrink-0 flex items-center justify-center bg-[var(--ff-purple)]/12 border border-[var(--ff-purple)]/25 text-[var(--ff-purple)]">
              <Cookie size={17} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-extrabold text-[var(--foreground)]">
                Çerez Tercihleri
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--foreground-muted)]">
                Deneyimini iyileştirmek ve trafiği analiz etmek için çerezler kullanıyoruz.
                Kabul ederek analitik ve pazarlama çerezlerine izin vermiş olursun.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className={cn(
                "ff-shape-button flex-1 h-9 inline-flex items-center justify-center px-4 text-[12px] font-semibold",
                "bg-[var(--ff-purple-strong)] text-white border border-[var(--ff-purple-strong)]",
                "hover:bg-[var(--ff-purple-hover)] transition-colors duration-150"
              )}
            >
              Kabul Et
            </button>
            <button
              type="button"
              onClick={() => choose("rejected")}
              className={cn(
                "ff-shape-button flex-1 h-9 inline-flex items-center justify-center px-4 text-[12px] font-semibold",
                "border border-[var(--border-strong)] text-[var(--foreground-muted)]",
                "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)] transition-colors duration-150"
              )}
            >
              Reddet
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
