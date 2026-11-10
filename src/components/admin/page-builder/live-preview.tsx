"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Live Preview
// Sayfanın gerçek rotasını iframe'de açar (/admin/sayfalar/[slug]/onizleme);
// düzenleyicideki kaydedilmemiş bölümler postMessage ile anında iletilir.
// iframe kendi penceresi olduğundan hero'nun kaydırma yakalaması, vh ölçüleri
// ve sabit menü admin panelini etkilemez.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Monitor, Tablet, Smartphone, RefreshCw } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { PageData } from "@/types/page-builder"
import { BUILDER_MSG_SOURCE, PREVIEW_MSG_SOURCE } from "@/components/shared/builder-preview-context"

type Breakpoint = "mobile" | "tablet" | "desktop"

// Gerçek cihaz ekranı: yükseklik de sabit olmalı — vh/100dvh kullanan bölümler
// (hero'lar, sticky kartlar) panel yüksekliğine göre uzayıp aralıkları büyütmesin.
const BREAKPOINTS: Record<Breakpoint, { label: string; width: number; height: number; icon: React.ComponentType<{ size?: number }> }> = {
  desktop: { label: "Masaüstü", width: 1440, height: 900, icon: Monitor },
  tablet: { label: "Tablet", width: 768, height: 1024, icon: Tablet },
  mobile: { label: "Mobil", width: 390, height: 844, icon: Smartphone },
}

/** Cihaz çerçevesi ile panel kenarı arası boşluk (px) */
const STAGE_PAD = 12

/** Değişiklikler bu kadar ms sonra iframe'e gönderilir (yazarken her tuşta değil) */
const SYNC_DELAY_MS = 150

interface LivePreviewProps {
  page: PageData
  /** Düzenleyicinin yan paneli: daha sade araç çubuğu */
  compact?: boolean
}

export function LivePreview({ page, compact = false }: LivePreviewProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")
  const [reloadKey, setReloadKey] = useState(0)
  const [ready, setReady] = useState(false)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const stageRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const sectionsRef = useRef(page.sections)
  useEffect(() => {
    sectionsRef.current = page.sections
  }, [page.sections])

  const routeSlug = page.slug === "/" ? "home" : page.slug
  const src = `/admin/sayfalar/${encodeURIComponent(routeSlug)}/onizleme`
  const bp = BREAKPOINTS[breakpoint]

  // Panel boyutu: iframe sayfanın gerçek genişliğinde çizilip panele sığdırılır
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const post = React.useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { source: BUILDER_MSG_SOURCE, type: "sections", sections: sectionsRef.current },
      window.location.origin
    )
  }, [])

  // iframe hazır olduğunu bildirince güncel bölümleri gönder
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.source !== frameRef.current?.contentWindow) return
      const data = e.data as { source?: string; type?: string }
      if (data?.source === PREVIEW_MSG_SOURCE && data.type === "ready") {
        post()
        setReady(true)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [post])

  // Her değişiklikte (kısa gecikmeyle) gönder
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(post, SYNC_DELAY_MS)
    return () => clearTimeout(t)
  }, [page.sections, ready, post])

  const reload = () => {
    setReady(false)
    setReloadKey((k) => k + 1)
  }

  // Cihaz ekranının tamamı panele sığar; ortalanır
  const availW = Math.max(1, box.w - STAGE_PAD * 2)
  const availH = Math.max(1, box.h - STAGE_PAD * 2)
  const scale = box.w > 0 ? Math.min(1, availW / bp.width, availH / bp.height) : 1
  const frameW = bp.width
  const frameH = bp.height
  const offsetX = Math.max(0, (box.w - frameW * scale) / 2)
  const offsetY = Math.max(0, (box.h - frameH * scale) / 2)

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#f7f7f5]">
      {/* Araç çubuğu */}
      <div className="flex items-center gap-2 px-3 h-11 border-b border-[#CCCCCC] shrink-0">
        <span className="relative flex w-2 h-2 shrink-0" aria-hidden>
          <span className={cn("absolute inset-0 rounded-full bg-[#ff4fd8]", ready && "animate-ping opacity-60")} />
          <span className="relative w-2 h-2 rounded-full bg-[#ff4fd8]" />
        </span>
        <span className="text-[11px] font-semibold text-[#333333] truncate">
          {compact ? "Canlı Önizleme" : `Önizleme — ${page.title}`}
        </span>
        <span className="hidden 2xl:inline text-[10px] text-[#666666] shrink-0">
          {bp.label} · {bp.width}×{bp.height}{scale < 1 ? ` · %${Math.round(scale * 100)}` : ""}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5 shrink-0">
          {(Object.entries(BREAKPOINTS) as [Breakpoint, typeof bp][]).map(([key, val]) => {
            const Icon = val.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => setBreakpoint(key)}
                title={val.label}
                aria-pressed={breakpoint === key}
                className={cn(
                  "ff-shape-button w-7 h-7 flex items-center justify-center transition-colors",
                  breakpoint === key
                    ? "text-[#ff4fd8] bg-[#ff4fd8]/10"
                    : "text-[#666666] hover:text-[#ff4fd8]"
                )}
              >
                <Icon size={14} />
              </button>
            )
          })}
          <div className="w-px h-4 bg-[#CCCCCC] mx-1" />
          <button
            type="button"
            onClick={reload}
            title="Önizlemeyi yenile"
            className="ff-shape-button w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Sahne */}
      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 overflow-hidden bg-[#0b0b0f]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,79,216,0.12) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {box.w > 0 && (
          <iframe
            key={`${src}-${reloadKey}`}
            ref={frameRef}
            src={src}
            title={`${page.title} canlı önizleme`}
            className="absolute border-0 bg-[#0b0b0f] shadow-[0_0_0_1px_rgba(255,79,216,0.25),0_20px_50px_-12px_rgba(0,0,0,0.6)]"
            style={{
              left: offsetX,
              top: offsetY,
              width: frameW,
              height: frameH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        )}

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0b0f]">
            <div className="w-6 h-6 border-2 border-[#ff4fd8] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-white/60">Sayfa yükleniyor…</span>
          </div>
        )}
      </div>
    </div>
  )
}
