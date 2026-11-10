"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Canlı önizleme köprüsü (iframe içinde çalışır)
// Düzenleyiciden gelen kaydedilmemiş bölümleri PageRenderer'a verir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import type { SectionBlock } from "@/types/page-builder"
import {
  BuilderPreviewContext,
  BUILDER_MSG_SOURCE,
  PREVIEW_MSG_SOURCE,
} from "@/components/shared/builder-preview-context"

export function PreviewBridge({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = React.useState<SectionBlock[] | null>(null)

  React.useEffect(() => {
    const parent = window.parent
    if (parent === window) return

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== parent) return
      const data = e.data as { source?: string; type?: string; sections?: SectionBlock[] }
      if (data?.source !== BUILDER_MSG_SOURCE) return
      if (data.type === "sections" && Array.isArray(data.sections)) setSections(data.sections)
    }

    // Önizlemede link sayfayı terk etmesin, form gerçek mesaj/randevu göndermesin.
    const blockLink = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]")
      if (!a) return
      const href = a.getAttribute("href") ?? ""
      if (!href.startsWith("#")) e.preventDefault()
    }
    const blockSubmit = (e: Event) => e.preventDefault()

    window.addEventListener("message", onMessage)
    document.addEventListener("click", blockLink, true)
    document.addEventListener("submit", blockSubmit, true)
    parent.postMessage({ source: PREVIEW_MSG_SOURCE, type: "ready" }, window.location.origin)

    return () => {
      window.removeEventListener("message", onMessage)
      document.removeEventListener("click", blockLink, true)
      document.removeEventListener("submit", blockSubmit, true)
    }
  }, [])

  return <BuilderPreviewContext.Provider value={sections}>{children}</BuilderPreviewContext.Provider>
}
