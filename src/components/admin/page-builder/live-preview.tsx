"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Live Preview
// Renders visible sections inline (no iframe)
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useState, useEffect } from "react"
import { Monitor, Tablet, Smartphone } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { PageData } from "@/types/page-builder"
import { PageRenderer } from "@/components/public/page-renderer"

// ── Breakpoint config ─────────────────────────────
type Breakpoint = "mobile" | "tablet" | "desktop"

const BREAKPOINTS: Record<Breakpoint, { label: string; width: string; icon: React.ComponentType<{ size?: number }> }> = {
  mobile: { label: "Mobil", width: "375px", icon: Smartphone },
  tablet: { label: "Tablet", width: "768px", icon: Tablet },
  desktop: { label: "Masaüstü", width: "100%", icon: Monitor },
}

// ── Main component ────────────────────────────────
interface LivePreviewProps {
  page: PageData
}

export function LivePreview({ page }: LivePreviewProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const bp = BREAKPOINTS[breakpoint]

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.items) {
          setPortfolioItems(data.items)
        }
      })
      .catch((err) => console.error("Failed to fetch portfolios", err))
  }, [])

  const visibleSections = [...page.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--foreground-faint)]">
          Önizleme — {page.title}
        </span>

        {/* Breakpoint toggle */}
        <div className="flex items-center gap-0.5">
          {(Object.entries(BREAKPOINTS) as [Breakpoint, typeof bp][]).map(([key, val]) => {
            const Icon = val.icon
            return (
              <button
                key={key}
                onClick={() => setBreakpoint(key)}
                title={val.label}
                className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  breakpoint === key
                    ? "text-[var(--ff-purple)] bg-[var(--ff-purple)]/10"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>

        <span className="text-[10px] text-[var(--foreground-faint)]">
          {bp.label} · {bp.width}
        </span>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-[#111] flex justify-center py-6 px-4">
        <div
          className="bg-[var(--background)] transition-all duration-300 overflow-hidden"
          style={{ width: bp.width, minHeight: "100vh" }}
        >
          {visibleSections.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-center">
              <p className="text-[var(--foreground-faint)] text-sm">
                Görüntülenecek section yok
              </p>
            </div>
          ) : (
            <PageRenderer sections={visibleSections} portfolioItems={portfolioItems} />
          )}
        </div>
      </div>
    </div>
  )
}
