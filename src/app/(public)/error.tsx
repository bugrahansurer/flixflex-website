"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Public segment error boundary
//
// Catches runtime errors thrown while rendering any public page
// (data fetch failures, etc.) and shows a branded recovery UI
// instead of a blank white screen. `reset()` re-renders the
// segment so a transient error can be retried in place.
// ═══════════════════════════════════════════════════════════

import { useEffect } from "react"
import Link from "next/link"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[public] Render error:", error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-[12px] font-semibold tracking-widest text-[var(--ff-purple)]">
        BİR ŞEYLER TERS GİTTİ
      </p>
      <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
        Beklenmeyen bir hata oluştu
      </h1>
      <p className="max-w-md text-sm text-[var(--foreground-muted)] leading-relaxed">
        Sayfa yüklenirken bir sorunla karşılaştık. Lütfen tekrar deneyin; sorun
        devam ederse birkaç dakika sonra geri dönün.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={reset}
          className="ff-shape-button h-11 px-6 text-[12px] font-semibold bg-[var(--ff-purple)] text-white hover:opacity-90 transition-opacity"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="ff-shape-button h-11 px-6 text-[12px] font-semibold border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors inline-flex items-center"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  )
}
