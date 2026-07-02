"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Send, AlertTriangle, Image as ImageIcon, Trash2, Plus, ArrowLeft, Check, Sparkles, X } from "@/lib/icons"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import { slugify, cn } from "@/lib/utils"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Can } from "@/components/admin/rbac/permission-context"
import type { AdminPortfolioRecord, AdminServiceOption } from "./types"

interface PortfolioEditorProps {
  mode: "new" | "edit"
  initial?: AdminPortfolioRecord
  services: AdminServiceOption[]
}

const CATEGORIES = [
  "Performance Marketing",
  "Design & Brand",
  "Development & Software",
  "Video Production",
  "Social Media Management",
  "AI & Automation Integration",
]

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

const defaultStats = [
  { value: 920, suffix: "%", label: "ROAS Artışı", description: "Kampanya sonunda" },
  { value: 62, suffix: "%", label: "CPA Düşüşü", description: "Optimizasyon sonrası" },
]

const PRESET_GRADIENTS = [
  { name: "Gece Mavisi", class: "bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]" },
  { name: "Şafak", class: "bg-gradient-to-r from-[#f7971e] via-[#ffd200] to-[#f7971e]" },
  { name: "Okyanus Derinliği", class: "bg-gradient-to-r from-[#1a2980] via-[#26d0ce] to-[#1a2980]" },
  { name: "Kiraz Çiçeği", class: "bg-gradient-to-r from-[#f953c6] via-[#b91d73] to-[#f953c6]" },
  { name: "Ormanlık", class: "bg-gradient-to-r from-[#134e5e] via-[#71b280] to-[#134e5e]" },
  { name: "Mor Sis", class: "bg-gradient-to-r from-[#4776e6] via-[#8e54e9] to-[#4776e6]" },
  { name: "Çöl Güneşi", class: "bg-gradient-to-r from-[#e44d26] via-[#f16529] to-[#e8a117]" },
  { name: "Buz Mavisi", class: "bg-gradient-to-r from-[#e0f7fa] via-[#80deea] to-[#006064]" },
  { name: "Kızıl Alevler", class: "bg-gradient-to-r from-[#cb2d3e] via-[#ef473a] to-[#cb2d3e]" },
  { name: "Zümrüt Vadi", class: "bg-gradient-to-r from-[#11998e] via-[#38ef7d] to-[#11998e]" },
  { name: "Altın Saat", class: "bg-gradient-to-r from-[#f7b733] via-[#fc4a1a] to-[#f7b733]" },
  { name: "Şeker Pembe", class: "bg-gradient-to-r from-[#fd79a8] via-[#e84393] to-[#6c5ce7]" },
  { name: "Karanlık Çöküş", class: "bg-gradient-to-r from-[#1f1c2c] via-[#928dab] to-[#1f1c2c]" },
  { name: "Kuzey Işıkları", class: "bg-gradient-to-r from-[#43c6ac] via-[#191654] to-[#43c6ac]" },
  { name: "Lavanta Rüyası", class: "bg-gradient-to-r from-[#c3cfe2] via-[#a18cd1] to-[#fbc2eb]" },
]

function parseTailwindGradient(className: string): string {
  const fromMatch = className.match(/from-\[#([A-Fa-f0-9]+)\]/)
  const viaMatch = className.match(/via-\[#([A-Fa-f0-9]+)\]/)
  const toMatch = className.match(/to-\[#([A-Fa-f0-9]+)\]/)

  const fromColor = fromMatch ? `#${fromMatch[1]}` : "#000000"
  const viaColor = viaMatch ? `#${viaMatch[1]}` : null
  const toColor = toMatch ? `#${toMatch[1]}` : "#000000"

  if (viaColor) {
    return `linear-gradient(135deg, ${fromColor}, ${viaColor}, ${toColor})`
  }
  return `linear-gradient(135deg, ${fromColor}, ${toColor})`
}

function GradientPicker({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [showCustom, setShowCustom] = React.useState(false)
  const currentBackground = React.useMemo(() => parseTailwindGradient(value), [value])

  return (
    <div className="space-y-3">
      <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">Gradient Renk Sınıfı</span>

      {/* Live Preview Banner */}
      <div
        style={{ background: currentBackground }}
        className="h-20 w-full ff-shape-container border border-[#CCCCCC] flex items-center justify-center text-white text-[10px] font-bold shadow-inner relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#f7f7f5]/10" />
        <span className="relative z-10 drop-shadow-md tracking-wider">Canlı Önizleme Gradienti</span>
      </div>

      {/* Grid of Preset Gradients */}
      <div className="flex flex-wrap gap-2.5 p-2 bg-[#f7f7f5] border border-[#E0E0E0] ff-shape-container shadow-inner justify-start">
        {PRESET_GRADIENTS.map((grad) => {
          const isSelected = value === grad.class
          const backgroundStyle = parseTailwindGradient(grad.class)
          return (
            <button
              key={grad.name}
              type="button"
              onClick={() => {
                onChange(grad.class)
              }}
              style={{ background: backgroundStyle }}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all relative shrink-0 shadow-sm",
                isSelected
                  ? "border-[#ff4fd8] ring-4 ring-[#ff4fd8]/20 scale-[1.08] shadow"
                  : "border-white hover:scale-[1.08] hover:shadow"
              )}
              title={grad.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/15 rounded-[inherit]">
                  <Check size={11} className="stroke-[3.5] text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Collapsible Custom Input */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-[10px] font-bold text-[#ff4fd8] hover:underline"
        >
          {showCustom ? "Hazır Renkleri Göster" : "Özel Sınıf Gir (Gelişmiş)"}
        </button>

        {showCustom && (
          <div className="pt-1.5">
            <input
              className={inputCls}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="from-[#HEX] via-[#HEX] to-[#HEX]"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function AccentColorPicker({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}) {
  const colorInputRef = React.useRef<HTMLInputElement>(null)

  const hexValue = React.useMemo(() => {
    if (value.startsWith("#")) return value
    if (value === "#ff4fd8") return "#ff4fd8"
    return "#ff4fd8" // default fallback
  }, [value])

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">Vurgu Rengi</span>
      <div className="flex gap-2 items-center">
        <input
          ref={colorInputRef}
          type="color"
          value={hexValue}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />

        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          className="flex-1 h-9 bg-white border border-[#CCCCCC] px-3 py-2 text-[12px] text-[#333333] placeholder:text-[#999999] outline-none focus:border-[#ff4fd8] transition-colors ff-shape-container flex items-center justify-between text-left"
        >
          <span className="font-mono text-xs">{value}</span>
          <div
            style={{ backgroundColor: hexValue }}
            className="w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0"
          />
        </button>

        <div className="flex gap-1">
          {["#ff4fd8", "#38ca6e", "#3b82f6", "#f59e0b", "#8b5cf6"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              style={{ backgroundColor: c }}
              className={cn(
                "w-6 h-6 rounded-full border transition-all hover:scale-110 shrink-0",
                value === c ? "border-[#ff4fd8] ring-2 ring-[#ff4fd8]/20 scale-110" : "border-black/10"
              )}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Custom Form Components ─────────────────────────
function FormField({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">
        {label}
      </label>
      {children}
      {description && (
        <p className="text-[10px] text-[#888888]">{description}</p>
      )}
    </div>
  )
}

function VisualMediaField({
  label,
  value,
  onChange,
  className
}: {
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">{label}</span>

      {value ? (
        <div className="relative group ff-shape-container ff-card p-0 overflow-hidden aspect-video flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 duration-150">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ff-shape-button px-3 py-1.5 bg-white text-[11px] font-semibold text-[#333333] hover:text-[#ff4fd8] transition-colors"
            >
              Görseli Değiştir
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="ff-shape-button p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Görseli Kaldır"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-32 border-2 border-dashed border-[#CCCCCC] hover:border-[#ff4fd8]/50 bg-[#F7F7F5] hover:bg-[#ff4fd8]/2 ff-shape-container flex flex-col items-center justify-center gap-2 text-[#666666] hover:text-[#ff4fd8] transition-all"
        >
          <ImageIcon size={20} className="stroke-[1.5]" />
          <span className="text-xs font-semibold">Görsel Seç</span>
        </button>
      )}

      {isOpen && (
        <MediaPicker
          allowedTypes={["image"]}
          onSelect={(url) => {
            onChange(url)
            setIsOpen(false)
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

function VisualLogoField({
  label,
  value,
  onChange,
  className
}: {
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">{label}</span>

      {value ? (
        <div className="relative group ff-shape-container border border-[#CCCCCC] p-4 bg-[#F7F7F5] w-full h-24 flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 duration-150">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ff-shape-button px-2.5 py-1 bg-white text-[10px] font-semibold text-[#333333] hover:text-[#ff4fd8] transition-colors"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="ff-shape-button p-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Kaldır"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-24 border-2 border-dashed border-[#CCCCCC] hover:border-[#ff4fd8]/50 bg-[#F7F7F5] hover:bg-[#ff4fd8]/2 ff-shape-container flex flex-col items-center justify-center gap-1.5 text-[#666666] hover:text-[#ff4fd8] transition-all"
        >
          <ImageIcon size={16} className="stroke-[1.5]" />
          <span className="text-[11px] font-semibold">Logo Seç</span>
        </button>
      )}

      {isOpen && (
        <MediaPicker
          allowedTypes={["image"]}
          onSelect={(url) => {
            onChange(url)
            setIsOpen(false)
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

function VisualMediaListField({
  label,
  values,
  onChange
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">{label}</span>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ff-shape-button inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold bg-transparent border border-[#ff4fd8] text-[#ff4fd8] hover:text-white hover:bg-[#ff4fd8] hover:border-[#ff4fd8] transition-colors"
        >
          <Plus size={12} />
          Görsel Ekle
        </button>
      </div>

      {values.length === 0 ? (
        <div className="h-24 border border-dashed border-[#CCCCCC] bg-[#F7F7F5] ff-shape-container flex items-center justify-center text-xs text-[#999999]">
          Henüz galeri görseli eklenmedi.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {values.map((url, index) => (
            <div key={index} className="relative group ff-shape-container border border-[#CCCCCC] aspect-video bg-[#f7f7f5] overflow-hidden flex items-center justify-center">
              <img
                src={url}
                alt={`Galeri ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 duration-150">
                <button
                  type="button"
                  onClick={() => onChange(values.filter((_, i) => i !== index))}
                  className="ff-shape-button p-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors"
                  title="Sil"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <MediaPicker
          allowedTypes={["image"]}
          multiple
          onSelectMany={(items) => {
            const urls = items.map((i) => i.url)
            // Append, skipping any URL already in the gallery.
            const merged = [...values, ...urls.filter((u) => !values.includes(u))]
            onChange(merged)
            setIsOpen(false)
          }}
          onSelect={(url) => {
            if (!values.includes(url)) onChange([...values, url])
            setIsOpen(false)
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

const inputCls =
  "ff-shape-container w-full h-9 bg-white border border-[#CCCCCC] px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#999999] outline-none focus:border-[#ff4fd8] transition-colors"


// ── Main Component ─────────────────────────────────
export function PortfolioEditor({ mode, initial, services }: PortfolioEditorProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [slugDirty, setSlugDirty] = React.useState(Boolean(initial?.slug))
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState(() => ({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    client: initial?.client ?? "",
    clientLogo: initial?.clientLogo ?? "",
    category: initial?.category ?? "Performance Marketing",
    description: initial?.description ?? "",
    content: initial?.content ?? "",
    linkUrl: initial?.linkUrl ?? "",
    linkLabel: initial?.linkLabel ?? "",
    coverImage: initial?.coverImage ?? "",
    images: initial?.images ?? [],
    tags: initial?.tags ?? [],
    year: initial?.year ?? new Date().getFullYear(),
    gradient: initial?.gradient ?? PRESET_GRADIENTS[0].class,
    accentColor: initial?.accentColor ?? "var(--ff-purple)",
    tall: initial?.tall ?? false,
    narrativeParagraphs: Array.isArray(initial?.narrativeParagraphs)
      ? (initial?.narrativeParagraphs as string[]).filter(Boolean)
      : ["", "", ""],
    sidebarItems: Array.isArray(initial?.sidebarItems)
      ? initial?.sidebarItems as { heading: string; body: string }[]
      : [
        { heading: "Problem", body: "" },
        { heading: "Çözüm", body: "" },
        { heading: "Sonuç", body: "" },
      ],
    resultStats: Array.isArray(initial?.resultStats)
      ? initial?.resultStats as typeof defaultStats
      : defaultStats,
    serviceIds: initial?.services?.map((service) => service.id) ?? [],
    isPublished: initial?.isPublished ?? false,
    order: initial?.order ?? 0,
  }))

  React.useEffect(() => {
    if (mode === "new" && form.title && !slugDirty) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [form.title, mode, slugDirty])

  function patch(patchValue: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...patchValue }))
  }

  async function save(publish?: boolean) {
    setBusy(true)
    setError(null)
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        client: form.client.trim(),
        clientLogo: form.clientLogo.trim() || null,
        description: form.description.trim(),
        linkUrl: form.linkUrl.trim() || null,
        linkLabel: form.linkLabel.trim() || null,
        coverImage: form.coverImage.trim(),
        images: form.images.map((item) => item.trim()).filter(Boolean),
        tags: form.tags.map((item) => item.trim()).filter(Boolean),
        narrativeParagraphs: form.narrativeParagraphs.map((item) => item.trim()).filter(Boolean),
        sidebarItems: form.sidebarItems.filter((item) => item.heading.trim() && item.body.trim()),
        resultStats: form.resultStats.filter((item) => item.label.trim()),
        isPublished: publish ?? form.isPublished,
      }
      const res = await fetch(mode === "new" ? "/api/portfolio" : `/api/portfolio/${initial!.id}`, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Kayıt başarısız")
      router.push("/admin/portfolyo")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-16">
      {/* ── Sub Header ───────────────────────────────── */}
      <div className="px-6 md:px-10 pt-6 pb-2">
        <Link
          href="/admin/portfolyo"
          className="ff-shape-button inline-flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#ff4fd8] transition-colors"
        >
          <ArrowLeft size={13} />
          Portfolyo Listesi
        </Link>
      </div>

      <div className="px-6 md:px-10 space-y-6">
        {/* Header Title & Actions */}
        <div className="flex items-end justify-between gap-4 flex-wrap border-b border-[#CCCCCC] pb-5">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#333333] tracking-tight flex items-center gap-2">
              {mode === "new" ? "Yeni Proje Ekle" : "Projeyi Düzenle"}
              <Sparkles size={16} className="text-[#ff4fd8]" />
            </h1>
            <p className="text-xs text-[#666666] mt-1.5">
              Vaka analizlerini, proje görsel ve hikayelerini modern UI sistemiyle yönetin.
            </p>
          </div>
          <div className="flex gap-2">
            {mode === "edit" && initial?.id && (
              <Can resource="portfolio" action="delete">
                <button
                  type="button"
                  onClick={() => { setDeleteError(null); setDeleteOpen(true) }}
                  disabled={busy}
                  className="ff-shape-button inline-flex items-center gap-1.5 px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Sil
                </button>
              </Can>
            )}
            <button
              onClick={() => save(false)}
              disabled={busy}
              className="ff-shape-button inline-flex items-center gap-2 px-4 py-2 border border-[#ff4fd8] bg-transparent text-xs font-bold text-[#ff4fd8] hover:bg-[#ff4fd8] hover:text-white hover:border-[#ff4fd8] transition-all disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
              Taslak Kaydet
            </button>
            <button
              onClick={() => save(true)}
              disabled={busy}
              className="ff-shape-button inline-flex items-center gap-2 px-4 py-2 bg-[#ff4fd8] border border-[#ff4fd8] text-xs font-bold text-white hover:opacity-95 transition-all disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={13} /> : <Send size={13} />}
              Yayına Al
            </button>
          </div>
        </div>

        {/* Silme onay diyaloğu */}
        <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-ff-fadeIn" />
            <Dialog.Content className="ff-shape-container fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E0E0E0] p-6 shadow-2xl ff-shape-container animate-ff-fadeIn">
              <Dialog.Close asChild>
                <button className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#333333] transition-colors" aria-label="Kapat">
                  <X size={14} />
                </button>
              </Dialog.Close>
              <div className="ff-shape-button w-10 h-10 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-4">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <Dialog.Title className="text-base font-extrabold text-[#333333] mb-2">Portfolyoyu Sil</Dialog.Title>
              <div className="space-y-4">
                <Dialog.Description className="text-xs text-[#666666] leading-relaxed">
                  <strong className="text-[#333333]">{initial?.title ?? "Bu proje"}</strong> portfolyo kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </Dialog.Description>
                {deleteError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold ff-shape-container">{deleteError}</div>
                )}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button className="ff-shape-button px-5 h-9 border border-[#CCCCCC] bg-[#f7f7f5] text-[#666666] text-[11px] font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] transition-colors" disabled={deleteLoading}>
                      Vazgeç
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={async () => {
                      if (!initial?.id) return
                      setDeleteLoading(true)
                      setDeleteError(null)
                      try {
                        const res = await fetch(`/api/portfolio/${initial.id}`, { method: "DELETE" })
                        const json = await res.json().catch(() => ({}))
                        if (!res.ok || !json.ok) throw new Error(json.message ?? json.error ?? "Silme işlemi başarısız")
                        setDeleteOpen(false)
                        router.push("/admin/portfolyo")
                        router.refresh()
                      } catch (err) {
                        setDeleteError(err instanceof Error ? err.message : String(err))
                      } finally {
                        setDeleteLoading(false)
                      }
                    }}
                    disabled={deleteLoading}
                    className="ff-shape-button inline-flex items-center gap-1.5 px-6 h-9 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} />}
                    Portfolyoyu Sil
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-4 text-red-500 text-[12px] flex gap-2 ff-shape-container">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Hata:</span> {error}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* ── Left Column: Project Info ─────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="ff-shape-container ff-card space-y-4">
              <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider border-b border-[#F0F0F0] pb-2">Proje Temel Bilgileri</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Proje Başlığı" description="Örn: Trendyol ROAS Artışı">
                  <input className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]" value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Başlık girin..." />
                </FormField>
                <FormField label="URL Yolu (Slug)" description="Kayıt başlığından otomatik oluşturulur">
                  <input className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]" value={form.slug} onChange={(e) => { setSlugDirty(true); patch({ slug: e.target.value }) }} placeholder="slug-degeri" />
                </FormField>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField label="Müşteri" description="Marka veya firma ismi">
                  <input className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]" value={form.client} onChange={(e) => patch({ client: e.target.value })} placeholder="Müşteri ismi..." />
                </FormField>
                <FormField label="Kategori" description="Hizmet kategorisi">
                  <select
                    className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                    value={form.category}
                    onChange={(e) => patch({ category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Yıl" description="Proje tamamlanma tarihi">
                  <select
                    className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                    value={form.year}
                    onChange={(e) => patch({ year: Number(e.target.value) })}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Kısa Açıklama" description="Kartlarda görünecek 1-2 cümlelik özet metin">
                <textarea rows={2} className="ff-shape-container items-center justify-start w-full h-9 px-4 py-2.5 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]" value={form.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Açıklama girin..." />
              </FormField>

              <div className="grid md:grid-cols-[1fr_220px] gap-4">
                <FormField label="Proje Bağlantısı (Opsiyonel)" description="Proje sitesi, sosyal medya veya ilgili bir link. Detay sayfasında ziyaret butonu olarak gösterilir.">
                  <input
                    type="url"
                    className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                    value={form.linkUrl}
                    onChange={(e) => patch({ linkUrl: e.target.value })}
                    placeholder="https://ornek.com veya https://instagram.com/marka"
                  />
                </FormField>
                <FormField label="Buton Metni" description='Boşsa "Projeyi Ziyaret Et"'>
                  <input
                    className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                    value={form.linkLabel}
                    onChange={(e) => patch({ linkLabel: e.target.value })}
                    placeholder="Projeyi Ziyaret Et"
                  />
                </FormField>
              </div>
            </div>

            {/* Narrative Story Paragraphs */}
            <div className="ff-shape-container ff-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2">
                <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider">Proje Hikayesi</h2>
                <button
                  type="button"
                  onClick={() => patch({ narrativeParagraphs: [...form.narrativeParagraphs, ""] })}
                  className="ff-shape-button inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border border-[#CCCCCC] text-[#666666] hover:text-[#ff4fd8] transition-colors"
                >
                  <Plus size={11} /> Paragraf Ekle
                </button>
              </div>

              <div className="space-y-3">
                {form.narrativeParagraphs.map((value, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-semibold text-[#888888]">Paragraf {index + 1}</span>
                      <textarea
                        rows={3}
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 py-2.5 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={value}
                        onChange={(e) => patch({
                          narrativeParagraphs: form.narrativeParagraphs.map((item, i) => (i === index ? e.target.value : item))
                        })}
                        placeholder="Vaka hikayesini buraya yazın..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => patch({
                        narrativeParagraphs: form.narrativeParagraphs.filter((_, i) => i !== index)
                      })}
                      className="ff-shape-button mt-5 flex justify-center items-center w-9 h-9 shrink-0 border border-[#CCCCCC] text-[#666666] hover:text-red-500 transition-colors"
                      aria-label="Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge / Approach / Results Columns */}
            <div className="ff-shape-container ff-card space-y-4">
              <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider border-b border-[#F0F0F0] pb-2">Problem / Çözüm / Sonuç Yapısı</h2>
              <div className="space-y-4">
                {form.sidebarItems.map((item, index) => (
                  <div key={index} className="grid md:grid-cols-[180px_1fr] gap-3 items-start border-b border-[#F7F7F5] pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="text-[10px] font-bold text-[#888888] block mb-1">Başlık</span>
                      <input
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={item.heading}
                        onChange={(e) => patch({
                          sidebarItems: form.sidebarItems.map((x, i) => i === index ? { ...x, heading: e.target.value } : x)
                        })}
                        placeholder="Örn: Problem"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#888888] block mb-1">Açıklama İçeriği</span>
                      <textarea
                        rows={2}
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 py-2.5 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={item.body}
                        onChange={(e) => patch({
                          sidebarItems: form.sidebarItems.map((x, i) => i === index ? { ...x, body: e.target.value } : x)
                        })}
                        placeholder="Detay metnini yazın..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics & Results stats */}
            <div className="ff-shape-container ff-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2">
                <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider">Metrikler &amp; Başarı İstatistikleri</h2>
                <button
                  type="button"
                  onClick={() => patch({
                    resultStats: [...form.resultStats, { value: 0, suffix: "", label: "", description: "" }]
                  })}
                  className="ff-shape-button inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border border-[#CCCCCC] text-[#666666] hover:text-[#ff4fd8] transition-colors"
                >
                  <Plus size={11} /> Metrik Ekle
                </button>
              </div>

              <div className="space-y-3">
                {form.resultStats.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[100px_80px_1fr_1fr_40px] gap-2 items-center border border-[#F0F0F0] p-3 ff-shape-container bg-[#f7f7f5]/30">
                    <div>
                      <span className="text-[9px] font-bold text-[#888888] block mb-0.5">Sayısal Değer</span>
                      <input
                        type="number"
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={item.value}
                        onChange={(e) => patch({
                          resultStats: form.resultStats.map((x, i) => i === index ? { ...x, value: Number(e.target.value) } : x)
                        })}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#888888] block mb-0.5">Sembol/Ek</span>
                      <input
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={item.suffix ?? ""}
                        placeholder="%"
                        onChange={(e) => patch({
                          resultStats: form.resultStats.map((x, i) => i === index ? { ...x, suffix: e.target.value } : x)
                        })}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#888888] block mb-0.5">Metrik Adı</span>
                      <input
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={item.label}
                        placeholder="ROAS Artışı"
                        onChange={(e) => patch({
                          resultStats: form.resultStats.map((x, i) => i === index ? { ...x, label: e.target.value } : x)
                        })}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#888888] block mb-0.5">Detay/Periyot</span>
                      <input
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={item.description ?? ""}
                        placeholder="Kampanya Sonu"
                        onChange={(e) => patch({
                          resultStats: form.resultStats.map((x, i) => i === index ? { ...x, description: e.target.value } : x)
                        })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => patch({
                        resultStats: form.resultStats.filter((_, i) => i !== index)
                      })}
                      className="ff-shape-button mt-4 w-9 h-9 flex items-center justify-center bg-transparent hover:bg-[#fa4d4d] border border-[#fa4d4d] text-[#fa4d4d] hover:text-white"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column: Assets & Config ──────────────── */}
          <aside className="space-y-6">
            {/* Visual Assets Card */}
            <div className="ff-shape-container ff-card space-y-4">
              <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider border-b border-[#F0F0F0] pb-2">Görsel Varlıklar</h2>

              <VisualMediaField
                label="Kapak Görseli"
                value={form.coverImage}
                onChange={(url) => patch({ coverImage: url })}
              />

              <VisualLogoField
                label="Müşteri Logosu"
                value={form.clientLogo}
                onChange={(url) => patch({ clientLogo: url })}
              />

              <VisualMediaListField
                label="Proje Galerisi"
                values={form.images}
                onChange={(images) => patch({ images })}
              />
            </div>

            {/* Layout Settings Card */}
            <div className="ff-shape-container ff-card space-y-4">
              <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider border-b border-[#F0F0F0] pb-2">Tasarım &amp; Akış Ayarları</h2>

              <GradientPicker
                value={form.gradient}
                onChange={(val) => patch({ gradient: val })}
              />

              <AccentColorPicker
                value={form.accentColor}
                onChange={(val) => patch({ accentColor: val })}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Sıralama Sırası" description="Grid dizilim sırası">
                  <input type="number" className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]" value={form.order} onChange={(e) => patch({ order: Number(e.target.value) })} />
                </FormField>
                <div className="space-y-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#666666] cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-[#ff4fd8]"
                      checked={form.tall}
                      onChange={(e) => patch({ tall: e.target.checked })}
                    />
                    Uzun Grid Kartı
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#666666] cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-[#ff4fd8]"
                      checked={form.isPublished}
                      onChange={(e) => patch({ isPublished: e.target.checked })}
                    />
                    Yayında / Aktif
                  </label>
                </div>
              </div>

              {/* Tags/Etiketler list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">Etiketler</span>
                  <button
                    type="button"
                    onClick={() => patch({ tags: [...form.tags, ""] })}
                    className="ff-shape-button px-2 py-1 text-[10px] font-bold border border-[#CCCCCC] text-[#666666] hover:text-[#ff4fd8] transition-all"
                  >
                    Ekle
                  </button>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {form.tags.map((tag, index) => (
                    <div key={index} className="flex gap-1.5 items-center">
                      <input
                        className="ff-shape-container items-center justify-start w-full h-9 px-4 bg-transparent border border-[#CCCCCC] text-xs text-[#666666] placeholder:text-[#999999]"
                        value={tag}
                        placeholder="Örn: SEO"
                        onChange={(e) => patch({
                          tags: form.tags.map((x, i) => i === index ? e.target.value : x)
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => patch({ tags: form.tags.filter((_, i) => i !== index) })}
                        className="ff-shape-button w-8 h-8 flex items-center justify-center border border-[#CCCCCC] text-[#666666] hover:text-red-500 bg-white shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Connected Services Grid Selector */}
            <div className="ff-shape-container ff-card space-y-4">
              <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider border-b border-[#F0F0F0] pb-1">Bağlı Hizmetler</h2>

              {services.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#999999]">Bağlanabilecek hizmet bulunmamaktadır.</div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {services.map((service) => {
                    const isSelected = form.serviceIds.includes(service.id)
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          patch({
                            serviceIds: isSelected
                              ? form.serviceIds.filter((id) => id !== service.id)
                              : [...form.serviceIds, service.id]
                          })
                        }}
                        className={cn(
                          "w-full text-left p-2.5 border transition-all flex items-center justify-between ff-shape-container",
                          isSelected
                            ? "border-[#ff4fd8]/50 bg-[#ff4fd8]/5 text-[#ff4fd8]"
                            : "border-[#CCCCCC] bg-[#F9f9f9] text-[#666666] hover:border-[#ff4fd8]/30 hover:bg-[#ff4fd8]/2"
                        )}
                      >
                        <span className="text-[11px] font-bold truncate pr-2">{service.title}</span>
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-extrabold shrink-0 transition-all",
                          isSelected
                            ? "border-[#ff4fd8] bg-[#ff4fd8] text-white"
                            : "border-[#CCCCCC] bg-transparent"
                        )}>
                          {isSelected && <Check size={8} className="stroke-[3.5]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
