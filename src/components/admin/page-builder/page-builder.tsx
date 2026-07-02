"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Page Builder Workspace
// 3-column layout: SectionPanel | Canvas | PropertyEditor
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  Undo2,
  Redo2,
  Eye,
  Save,
  Send,
  CheckCircle2,
  Clock,
  Layers,
  Layout,
  Settings,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FFButton } from "@/components/ui/ff-button"
import { usePageBuilder } from "@/store/page-builder"
import { useUndoRedoKeys } from "@/hooks/use-history"
import type { PageData } from "@/types/page-builder"
import { SectionPanel } from "./section-panel"
import { SortableCanvas } from "./sortable-canvas"
import { PropertyEditor } from "./property-editor"
import { LivePreview } from "./live-preview"

interface PageBuilderProps {
  initialPage: PageData
}

export function PageBuilder({ initialPage }: PageBuilderProps) {
  const {
    page,
    setPage,
    setTitle,
    setStatus,
    isDirty,
    lastSavedAt,
    markSaved,
    canUndo,
    canRedo,
    undo,
    redo,
  } = usePageBuilder()

  // Hydrate store on mount
  useEffect(() => {
    setPage(initialPage)
  }, [initialPage, setPage])

  // Auto-save: debounced 30s after isDirty becomes true
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirtyRef = useRef(isDirty)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  // Below lg the 3-pane editor is tabbed — this picks the visible pane.
  const [mobilePane, setMobilePane] = useState<"sections" | "canvas" | "properties">("canvas")

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  const saveToApi = useCallback(async () => {
    const currentPage = usePageBuilder.getState().page
    if (!currentPage) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/pages/${currentPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentPage.title,
          description: currentPage.description,
          sections: currentPage.sections,
          status: currentPage.status,
        }),
      })
      // fetch HTTP 4xx/5xx'te reddetmez — başarıyı açıkça doğrula; aksi halde
      // markSaved() çağrılmamalı ki "Kaydedilmemiş değişiklik" göstergesi
      // doğru kalsın (sessiz veri kaybını önler).
      if (!res.ok) throw new Error(`Kaydetme başarısız (HTTP ${res.status})`)
      markSaved()
    } catch (err) {
      console.error("[PageBuilder] Auto-save failed:", err)
      toast.error("Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.")
    } finally {
      setIsSaving(false)
    }
  }, [markSaved])

  const flushSaveBeacon = useCallback(() => {
    const currentPage = usePageBuilder.getState().page
    if (!currentPage) return
    const payload = JSON.stringify({
      title: currentPage.title,
      description: currentPage.description,
      sections: currentPage.sections,
      status: currentPage.status,
    })
    fetch(`/api/pages/${currentPage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!isDirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(saveToApi, 30_000)
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = null
      }
      if (isDirtyRef.current) {
        flushSaveBeacon()
      }
    }
  }, [isDirty, saveToApi, flushSaveBeacon])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (usePageBuilder.getState().isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  // Keyboard shortcuts for undo/redo
  useUndoRedoKeys(canUndo, canRedo, undo, redo)

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [setTitle])

  const handlePublish = useCallback(async () => {
    const p = usePageBuilder.getState().page
    if (!p) return
    setIsSaving(true)
    try {
      // Save ALL changes (sections + title + description + status) atomik olarak
      const res = await fetch(`/api/pages/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: p.title,
          description: p.description,
          sections: p.sections,
          status: "published",
        }),
      })
      if (!res.ok) throw new Error(`Yayınlama başarısız (HTTP ${res.status})`)
      setStatus("published")
      markSaved()
    } catch (err) {
      console.error("[PageBuilder] Publish failed:", err)
      toast.error("Sayfa yayınlanamadı. Lütfen tekrar deneyin.")
    } finally {
      setIsSaving(false)
    }
  }, [markSaved, setStatus])

  const handleSaveDraft = useCallback(async () => {
    await saveToApi()
  }, [saveToApi])

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--ff-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isPublished = page.status === "published"

  return (
    <div className="flex flex-col h-[calc(92vh)] bg-[#f7f7f5] overflow-hidden">
      {/* ── Top Toolbar ─────────────────────────────── */}
      <header className="flex items-center gap-2 px-4 h-14 border-b border-[#CCCCCC] bg-[#f7f7f5] shrink-0 overflow-x-auto">
        {/* Title input */}
        <div className="w-36 shrink-0 sm:flex-1 sm:w-auto sm:min-w-0 max-w-sm">
          <input
            className={cn(
              "w-full bg-transparent text-sm font-medium text-[#333333]",
              "placeholder:text-[#666666]",
              "border-b border-transparent focus:border-[#ff4fd8]",
              "outline-none py-1 transition-colors duration-150"
            )}
            value={page.title}
            onChange={handleTitleChange}
            placeholder="Sayfa başlığı..."
            aria-label="Sayfa başlığı"
          />
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "ff-shape-button px-2 py-0.5 text-[12px] font-semibold border",
            isPublished
              ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
              : "text-amber-400  border-amber-400/40  bg-amber-400/10"
          )}
        >
          {isPublished ? "Yayında" : "Taslak"}
        </span>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Geri Al (Ctrl+Z)"
            className={cn(
              "w-8 h-8 flex items-center justify-center transition-colors",
              "text-[#666666] hover:text-[#ff4fd8]",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Yinele (Ctrl+Shift+Z)"
            className={cn(
              "w-8 h-8 flex items-center justify-center transition-colors",
              "text-[#666666] hover:text-[#ff4fd8]",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#CCCCCC]" />

        {/* Save state indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#666666]">
          {isSaving ? (
            <>
              <div className="w-3 h-3 border border-[#ff4fd8] border-t-transparent rounded-full animate-spin" />
              <span>Kaydediliyor...</span>
            </>
          ) : isDirty ? (
            <>
              <Clock size={12} />
              <span>Kaydedilmemiş değişiklik</span>
            </>
          ) : lastSavedAt ? (
            <>
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Kaydedildi</span>
            </>
          ) : null}
        </div>

        {/* Spacer */}
        <div className="hidden sm:block flex-1" />

        {/* Action buttons */}
        <button
          onClick={() => setShowPreview((v) => !v)}
          className={cn(
            "ff-shape-button shrink-0 flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium",
            "border transition-colors duration-150",
            showPreview
              ? "border-[#ff4fd8] text-[#ff4fd8] bg-[#ff4fd8]/10"
              : "border-[#CCCCCC] text-[#666666] hover:border-[#ff4fd8] hover:text-[#ff4fd8]"
          )}
        >
          <Eye size={12} />
          Önizle
        </button>

        <FFButton
          variant="secondary"
          size="sm"
          loading={isSaving}
          onClick={handleSaveDraft}
          leftIcon={<Save size={12} />}
        >
          Kaydet
        </FFButton>

        <FFButton
          variant="primary"
          size="sm"
          loading={isSaving}
          onClick={handlePublish}
          leftIcon={<Send size={12} />}
        >
          Yayınla
        </FFButton>
      </header>

      {/* ── Main Content ─────────────────────────── */}
      {showPreview ? (
        <div className="flex-1 overflow-hidden">
          <LivePreview page={page} />
        </div>
      ) : (
        <>
          {/* Mobile pane switcher — the 3-pane editor is tabbed below lg */}
          <div className="lg:hidden flex shrink-0 border-b border-[#CCCCCC] bg-[#f7f7f5]">
            {([
              { key: "sections", label: "Bölümler", Icon: Layers },
              { key: "canvas", label: "Tuval", Icon: Layout },
              { key: "properties", label: "Özellikler", Icon: Settings },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMobilePane(key)}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold border-b-2 transition-colors",
                  mobilePane === key
                    ? "border-[#ff4fd8] text-[#ff4fd8]"
                    : "border-transparent text-[#666666] hover:text-[#333333]"
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Left: Section Panel */}
            <aside
              className={cn(
                mobilePane === "sections" ? "block" : "hidden",
                "lg:block min-h-0 w-full lg:w-90 flex-1 lg:flex-none",
                "overflow-y-auto bg-[#f7f7f5] lg:border-r border-[#CCCCCC]",
              )}
            >
              <SectionPanel />
            </aside>

            {/* Center: Sortable Canvas — sıralama listesi (dar, sabit genişlik) */}
            <main
              className={cn(
                mobilePane === "canvas" ? "block" : "hidden",
                "lg:block min-h-0 w-full lg:w-[450px] lg:flex-none",
                "overflow-y-auto bg-[#f7f7f5] lg:border-r border-[#CCCCCC]",
              )}
            >
              <SortableCanvas />
            </main>

            {/* Right: Property Editor — asıl düzenleme alanı (kalan tüm genişlik) */}
            <aside
              className={cn(
                mobilePane === "properties" ? "block" : "hidden",
                "lg:block min-h-0 w-full flex-1 lg:min-w-0",
                "overflow-y-auto bg-[#f7f7f5] lg:border-r border-[#CCCCCC]",
              )}
            >
              <PropertyEditor />
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
