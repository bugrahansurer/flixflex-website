"use client"

import { useState } from "react"
import Link from "next/link"
import { FFButton, FFInput } from "@/components/ui"
import { Save, Loader2, ExternalLink, PenTool, Check, AlertTriangle } from "@/lib/icons"
import { toast } from "sonner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Section = { id: string; type: string; order: number; visible?: boolean; props: Record<string, any>;[k: string]: any }

export interface PolicyEntry {
  slug: string
  defaultTitle: string
  page: {
    id: string
    title: string
    isPublished: boolean
    sections: Section[]
  } | null
}

/** First text-content section's body (the editable policy text), or "". */
function extractBody(sections: Section[]): string {
  const sec = sections.find((s) => s.type === "text-content")
  return (sec?.props?.body as string) ?? ""
}

export function PoliciesManager({ policies }: { policies: PolicyEntry[] }) {
  return (
    <div className="space-y-6">
      {policies.map((p) => (
        <PolicyCard key={p.slug} entry={p} />
      ))}
    </div>
  )
}

function PolicyCard({ entry }: { entry: PolicyEntry }) {
  const { slug, defaultTitle, page } = entry
  const [title, setTitle] = useState(page?.title ?? defaultTitle)
  const [body, setBody] = useState(page ? extractBody(page.sections) : "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Policy page yoksa: oluşturma yönlendirmesi göster.
  if (!page) {
    return (
      <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={18} className="text-[#d97706]" />
          <h2 className="font-display text-lg text-[#333333] font-bold">{defaultTitle}</h2>
        </div>
        <p className="text-sm text-[#666666] mb-4">
          Bu politika sayfası henüz oluşturulmamış (<code className="text-[#ff4fd8]">/{slug}</code>).
        </p>
        <Link
          href="/admin/sayfalar/yeni"
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#FF4FD8] text-white text-[12px] font-semibold hover:bg-[#e041c0] transition-colors"
        >
          Sayfayı Oluştur
        </Link>
      </section>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    // Mevcut section'ları koru; ilk text-content'in body'sini güncelle.
    // text-content yoksa başa bir tane ekle.
    let sections = [...page.sections]
    const idx = sections.findIndex((s) => s.type === "text-content")
    if (idx >= 0) {
      sections[idx] = { ...sections[idx], props: { ...sections[idx].props, headline: title, body } }
    } else {
      sections = [
        {
          id: `policy-${slug}-${sections.length}`,
          type: "text-content",
          order: 0,
          visible: true,
          props: { headline: title, body, alignment: "left", maxWidthProse: true },
        },
        ...sections.map((s) => ({ ...s, order: s.order + 1 })),
      ]
    }

    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sections }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Kaydetme hatası")
      }
      toast.success(`${title} kaydedildi`)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydetme hatası")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="ff-card ff-card space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#CCCCCC]">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg text-[#333333] font-bold">{defaultTitle}</h2>
          <span
            className="text-[10px] font-semibold px-2 py-0.5"
            style={{
              backgroundColor: page.isPublished ? "rgba(22,163,74,0.12)" : "rgba(217,119,6,0.12)",
              color: page.isPublished ? "#16a34a" : "#d97706",
            }}
          >
            {page.isPublished ? "Yayında" : "Taslak"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <ExternalLink size={13} /> Görüntüle
          </a>
          <Link
            href={`/admin/sayfalar/${slug}/edit`}
            className="inline-flex items-center gap-1 text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <PenTool size={13} /> Gelişmiş Düzenle
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#333333]">Başlık</label>
        <FFInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333]"
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#333333]">İçerik</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          spellCheck={false}
          className="ff-shape-container w-full bg-white border border-[#CCCCCC] p-3 text-[13px] leading-relaxed text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#ff4fd8] transition-colors resize-y font-mono"
          placeholder="<p>Politika metni...</p>"
        />
        <p className="text-[10px] text-[#999999] leading-relaxed">
          Basit HTML desteklenir: <code>&lt;p&gt;</code>, <code>&lt;h3&gt;</code>, <code>&lt;ul&gt;&lt;li&gt;</code>,
          <code>&lt;a href&gt;</code>. Daha görsel bir düzen için &quot;Gelişmiş Düzenle&quot;yi kullan.
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <FFButton onClick={handleSave} disabled={saving} className="px-8 h-11">
          {saving ? (
            <Loader2 className="animate-spin mr-2" size={16} />
          ) : saved ? (
            <Check size={16} className="mr-2" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          {saved ? "Kaydedildi" : "Kaydet"}
        </FFButton>
      </div>
    </section>
  )
}
