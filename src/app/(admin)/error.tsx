"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Admin segment error boundary
//
// Catches runtime errors inside the admin panel and renders a
// light-themed recovery card (admin UI is always light theme).
// ═══════════════════════════════════════════════════════════

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "@/lib/icons"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin] Render error:", error)
  }, [error])

  return (
    <div className="h-[100vh] flex items-center justify-center px-6">
      <div className="ff-shape-container max-w-md w-full bg-white border border-[#CCCCCC] p-8 text-center space-y-5">
        <div className="flex justify-center">
          <span className="flex items-center justify-center w-12 h-12 bg-[#ff4fd8]/10 text-[#ff4fd8]">
            <AlertTriangle size={22} />
          </span>
        </div>
        <h1 className="font-display text-xl font-bold text-[#333333]">
          Panelde bir hata oluştu
        </h1>
        <p className="text-sm text-[#666666] leading-relaxed">
          İşlem sırasında beklenmeyen bir hatayla karşılaşıldı. Tekrar
          deneyebilir veya panele dönebilirsiniz.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-[#999999]">
            Hata kodu: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={reset}
            className="ff-shape-button h-10 px-5 text-[12px] font-semibold bg-[#ff4fd8] text-white hover:bg-[#e03eb5] transition-colors"
          >
            Tekrar Dene
          </button>
          <Link
            href="/admin"
            className="ff-shape-button h-10 px-5 text-[12px] font-semibold border border-[#CCCCCC] text-[#666666] hover:text-[#333333] transition-colors inline-flex items-center"
          >
            Panele Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
