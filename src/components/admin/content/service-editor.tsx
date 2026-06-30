"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import {
  Save, Loader2, Send, AlertTriangle, ArrowLeft, Check,
  Search, Target, Film, LayoutGrid, PenTool, Clapperboard,
  Camera, FileText, MessageCircle, Video, TrendingUp, Shapes,
  BookOpen, Lightbulb, Layout, Monitor, Code2, Zap, Sparkles,
  Scissors, Globe, BarChart3, Palette, MessageSquare, Fingerprint, Plus, Trash2, X, Image as ImageIcon
} from "@/lib/icons"
import { slugify, cn } from "@/lib/utils"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { MotionDesignPicker } from "@/components/admin/content/motion-design-picker"
import type { AdminServiceRecord } from "./types"

// Available Icons for Services
const ICON_MAP = {
  Search,
  Target,
  Film,
  LayoutGrid,
  PenTool,
  Clapperboard,
  Camera,
  FileText,
  MessageCircle,
  Video,
  TrendingUp,
  Shapes,
  BookOpen,
  Lightbulb,
  Layout,
  Monitor,
  Code2,
  Zap,
  Sparkles,
  Scissors,
  Globe,
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint
}

type IconName = keyof typeof ICON_MAP

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

const inputCls =
  "ff-shape-container w-full h-9 bg-[#f7f7f5] border border-[#CCCCCC] px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#666666] outline-none focus:border-[#ff4fd8] transition-colors"

type ServiceOption = { id: string; title: string; slug: string }

interface ServiceEditorProps {
  mode: "new" | "edit"
  initial?: AdminServiceRecord
  allServices: ServiceOption[]
}

export function ServiceEditor({ mode, initial, allServices }: ServiceEditorProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [slugDirty, setSlugDirty] = React.useState(Boolean(initial?.slug))
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false)
  const [iconSearch, setIconSearch] = React.useState("")
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState(() => ({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    body: initial?.body ?? "",
    icon: (initial?.icon as IconName) ?? "Globe",
    features: initial?.features ?? [""],
    processSteps: Array.isArray(initial?.processSteps)
      ? initial?.processSteps as { title: string; description: string }[]
      : [
        { title: "Keşif", description: "" },
        { title: "Strateji", description: "" },
        { title: "Uygulama", description: "" },
      ],
    deliverables: initial?.deliverables ?? [""],
    isPublished: initial?.isPublished ?? false,
    order: initial?.order ?? 0,
    metaTitle: initial?.metaTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
    parentId: initial?.parentId ?? "",
    coverImage: initial?.coverImage ?? "",
    accentColor: initial?.accentColor ?? "#ff4fd8",
    gradient: initial?.gradient ?? "bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]",
    motionDesign: initial?.motionDesign ?? "",
  }))

  const availableParents = React.useMemo(() => {
    return allServices.filter((s) => s.id !== initial?.id)
  }, [allServices, initial?.id])

  const children = Array.isArray(initial?.children) ? initial.children : []
  const hasChildren = children.length > 0

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
        description: form.description.trim(),
        body: form.body.trim(),
        features: form.features.map((item) => item.trim()).filter(Boolean),
        deliverables: form.deliverables.map((item) => item.trim()).filter(Boolean),
        processSteps: form.processSteps.filter((item) => item.title.trim() && item.description.trim()),
        isPublished: publish ?? form.isPublished,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        parentId: form.parentId || null,
        coverImage: form.coverImage || null,
        accentColor: form.accentColor || null,
        gradient: form.gradient || null,
        motionDesign: form.motionDesign || null,
      }
      const res = await fetch(mode === "new" ? "/api/services" : `/api/services/${initial!.id}`, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Kayıt başarısız")
      router.push("/admin/hizmetler")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  // Filter icons for visual dialog picker
  const filteredIcons = React.useMemo(() => {
    const keys = Object.keys(ICON_MAP) as IconName[]
    if (!iconSearch) return keys
    return keys.filter((key) => key.toLowerCase().includes(iconSearch.toLowerCase()))
  }, [iconSearch])

  const SelectedIconComponent = ICON_MAP[form.icon] ?? Globe

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-[#E0E0E0] pb-5">
        <div className="space-y-1.5">
          <Link
            href="/admin/hizmetler"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <ArrowLeft size={12} />
            Hizmetler
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-[#333333]">
            {mode === "new" ? "Yeni Hizmet Oluştur" : "Hizmeti Düzenle"}
          </h1>
          <p className="text-xs text-[#666666]">
            Hizmet detay sayfası, alt hizmetler ve verilecek çıktılar bu form üzerinden yapılandırılır.
          </p>
        </div>

        <div className="flex gap-2">
          {mode === "edit" && (
            <button
              type="button"
              className="ff-shape-button px-3 h-9 border border-red-500/20 hover:border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold text-[12px] flex items-center gap-1.5 transition-all disabled:opacity-50"
              disabled={busy}
              onClick={() => {
                setDeleteError(null)
                setDeleteOpen(true)
              }}
            >
              <Trash2 size={13} />
              Sil
            </button>
          )}
          <button
            type="button"
            className="ff-shape-button px-3 h-9 border border-[#CCCCCC] text-[#666666] hover:text-[#ff4fd8] hover:border-[#ff4fd8]/30 bg-white font-bold text-[12px] flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={busy}
            onClick={() => save(form.isPublished)}
          >
            {busy ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Taslağı Kaydet
          </button>
          <button
            type="button"
            className="ff-shape-button px-3 h-9 bg-[#ff4fd8] text-white font-bold text-[12px] flex items-center gap-2 hover:bg-[#ff4fd8]/90 transition-all disabled:opacity-50"
            disabled={busy}
            onClick={() => save(true)}
          >
            {busy ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
            Yayınla
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/10 p-3.5 px-4 text-red-500 text-xs font-semibold flex gap-2 ff-shape-container">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column (Main Form Content) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Temel Bilgiler */}
          <div className="ff-shape-container ff-card space-y-4">
            <h3 className="text-xs font-bold text-[#ff4fd8] border-b border-[#F0F0F0] pb-2">Temel Bilgiler</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Hizmet Başlığı" description="Hizmetin public adıdır.">
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="örn. Dijital Pazarlama Yönetimi"
                />
              </FormField>

              <FormField label="Slug (URL Yolu)" description="Tarayıcıda görünecek adresi belirler.">
                <input
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => { setSlugDirty(true); patch({ slug: e.target.value }) }}
                  placeholder="dijital-pazarlama-yonetimi"
                />
              </FormField>
            </div>

            <FormField label="Kısa Açıklama" description="Kartlarda ve listelerde görünecek özet açıklama.">
              <textarea
                rows={3}
                className={cn(inputCls, "h-auto py-2.5")}
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Veri odaklı ve yüksek dönüşümlü pazarlama stratejilerimiz..."
              />
            </FormField>

            <FormField label="Detay Sayfası Hero Metni" description="Hizmet detay sayfasının en üstünde yer alan ana açıklama paragrafı.">
              <textarea
                rows={6}
                className={cn(inputCls, "h-auto py-2.5")}
                value={form.body}
                onChange={(e) => patch({ body: e.target.value })}
                placeholder="Müşterilerinize sunduğunuz bu hizmetin tüm süreçlerini, detaylarını ve ne işe yaradığını geniş bir dille açıklayın..."
              />
            </FormField>
          </div>

          {/* Card: Görsel & Tasarım */}
          <div className="ff-shape-container ff-card space-y-4">
            <h3 className="text-xs font-bold text-[#ff4fd8] border-b border-[#F0F0F0] pb-2">Görsel & Tasarım</h3>

            <VisualMediaField
              label="Kapak Görseli"
              value={form.coverImage}
              onChange={(url) => patch({ coverImage: url })}
            />

            <MotionDesignPicker
              value={form.motionDesign || null}
              onChange={(v) => patch({ motionDesign: v ?? "" })}
            />

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <AccentColorPicker
                value={form.accentColor}
                onChange={(color) => patch({ accentColor: color })}
              />
              <GradientPicker
                value={form.gradient}
                onChange={(gradientClass) => patch({ gradient: gradientClass })}
              />
            </div>
          </div>

          {/* Card: Süreç Adımları */}
          <div className="ff-shape-container ff-card space-y-4">
            <div className="flex justify-between items-center border-b border-[#F0F0F0] pb-2">
              <h3 className="text-xs font-bold text-[#ff4fd8]">Süreç Adımları</h3>
              <button
                type="button"
                onClick={() => patch({
                  processSteps: [...form.processSteps, { title: "", description: "" }]
                })}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff4fd8] hover:underline"
              >
                <Plus size={12} />
                Adım Ekle
              </button>
            </div>

            <div className="space-y-4">
              {form.processSteps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-[#f7f7f5] border border-[#E0E0E0] ff-shape-container relative group">
                  <div className="w-8 h-8 rounded-full bg-[#ff4fd8]/10 text-[#ff4fd8] text-xs font-bold flex items-center justify-center shrink-0 border border-[#ff4fd8]/20">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="flex-1 grid gap-3">
                    <input
                      className={cn(inputCls, "bg-white")}
                      placeholder="Adım Başlığı (örn. Keşif)"
                      value={step.title}
                      onChange={(e) => patch({
                        processSteps: form.processSteps.map((x, i) => i === index ? { ...x, title: e.target.value } : x)
                      })}
                    />
                    <textarea
                      rows={2}
                      className={cn(inputCls, "bg-white h-auto py-1.5")}
                      placeholder="Açıklama (Bu aşamada ne yapılır?)"
                      value={step.description}
                      onChange={(e) => patch({
                        processSteps: form.processSteps.map((x, i) => i === index ? { ...x, description: e.target.value } : x)
                      })}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => patch({
                      processSteps: form.processSteps.filter((_, i) => i !== index)
                    })}
                    className="w-7 h-7 flex items-center justify-center border border-[#CCCCCC] hover:border-red-500/30 hover:bg-red-500/10 text-[#666666] hover:text-red-500 transition-all ff-shape-button shrink-0"
                    title="Adımı Kaldır"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {form.processSteps.length === 0 && (
                <div className="py-8 text-center border border-dashed border-[#CCCCCC] ff-shape-container text-xs text-[#999999]">
                  Henüz bir süreç adımı eklenmedi.
                </div>
              )}
            </div>
          </div>

          {/* Card: Kart Özellikleri & Teslim Edilenler */}
          <div className="ff-shape-container ff-card space-y-4">
            <PremiumListField
              label="Hizmet Kartı Özellikleri"
              values={form.features}
              onChange={(values) => patch({ features: values })}
              placeholder="Özellik yazın..."
            />

            <PremiumListField
              label="Teslim Edilen Çıktılar"
              values={form.deliverables}
              onChange={(values) => patch({ deliverables: values })}
              placeholder="Teslimat çıktısı yazın..."
            />
          </div>
        </div>

        {/* Right Column (Sidebar Settings) */}
        <aside className="space-y-6">

          {/* Card: Hizmet Ayarları */}
          <div className="ff-shape-container ff-card space-y-4">
            <h3 className="text-xs font-bold text-[#ff4fd8] border-b border-[#F0F0F0] pb-2">Hizmet Ayarları</h3>

            <FormField label="Hiyerarşi (Üst Hizmet)" description="Bir alt hizmet ise üst hizmetini seçin.">
              <select
                className={cn(inputCls, "h-9 py-0 appearance-none bg-[image:var(--select-arrow)] bg-[position:right_10px_center] bg-no-repeat")}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundSize: '18px'
                }}
                value={form.parentId}
                onChange={(e) => patch({ parentId: e.target.value })}
              >
                <option value="">— Yok (Ana Hizmet) —</option>
                {availableParents.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </FormField>

            {/* Visual Icon Picker Trigger */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#666666] block">
                Temsili İkon
              </label>
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 bg-[#ff4fd8]/10 border border-[#ff4fd8]/20 flex items-center justify-center shrink-0 ff-shape-container">
                  <SelectedIconComponent size={20} className="text-[#ff4fd8]" />
                </div>
                <div className="flex-1 flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-[#333333]">{form.icon}</span>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(true)}
                    className="text-[10px] font-bold text-[#ff4fd8] hover:underline"
                  >
                    İkonu Değiştir
                  </button>
                </div>
              </div>
            </div>

            <FormField label="Görüntüleme Sırası" description="Listelerdeki ağırlık (küçük olan önce gelir).">
              <input
                type="number"
                className={inputCls}
                value={form.order}
                onChange={(e) => patch({ order: Number(e.target.value) })}
              />
            </FormField>

            <div className="flex items-center justify-between p-3.5 bg-[#f7f7f5] border border-[#E0E0E0] ff-shape-container">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#333333] block">Yayın Durumu</span>
                <span className="text-[10px] text-[#666666] block">Hizmet public listelerde görünsün.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => patch({ isPublished: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#CCCCCC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff4fd8]"></div>
              </label>
            </div>
          </div>

          {/* Card: SEO Meta Verileri */}
          <div className="ff-shape-container ff-card space-y-4">
            <h3 className="text-xs font-bold text-[#ff4fd8] border-b border-[#F0F0F0] pb-2">Arama Motoru (SEO)</h3>

            <FormField label="Meta Başlık" description="Arama motorlarında sayfa başlığı olarak görünür.">
              <input
                className={inputCls}
                value={form.metaTitle}
                onChange={(e) => patch({ metaTitle: e.target.value })}
                placeholder={form.title || "Meta sayfa başlığı"}
              />
            </FormField>

            <FormField label="Meta Açıklama" description="Arama motorlarında sayfa özeti olarak listelenir.">
              <textarea
                rows={3}
                className={cn(inputCls, "h-auto py-2.5")}
                value={form.metaDescription}
                onChange={(e) => patch({ metaDescription: e.target.value })}
                placeholder={form.description || "Meta açıklama metni"}
              />
            </FormField>
          </div>
        </aside>
      </div>

      {/* ── Dialog: Visual Icon Selector Popup ── */}
      <Dialog.Root open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[70vh] bg-[#F7F7F5] border border-[#CCCCCC] shadow-2xl flex flex-col z-50 overflow-hidden outline-none animate-in zoom-in-95 duration-200 ff-shape-container">

            {/* Dialog Header */}
            <div className="p-4 px-6 border-b border-[#CCCCCC] bg-white flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <Dialog.Title className="text-sm font-extrabold text-[#333333]">İkon Seçici</Dialog.Title>
                <Dialog.Description className="text-[10px] text-[#666666]">
                  Hizmeti temsil edecek modern bir Lucide ikonu belirleyin.
                </Dialog.Description>
              </div>
              <button
                onClick={() => setIconPickerOpen(false)}
                className="p-1.5 border border-[#E0E0E0] bg-white hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-colors ff-shape-button"
              >
                <X size={14} />
              </button>
            </div>

            {/* Dialog Search Bar */}
            <div className="p-3 px-6 bg-white border-b border-[#CCCCCC] flex justify-between gap-3 shrink-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" size={14} />
                <input
                  type="text"
                  placeholder="İkon ara..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full bg-[#f7f7f5] border border-[#CCCCCC] placeholder:text-[#999999] text-xs h-8 pl-9 pr-4 outline-none focus:border-[#ff4fd8] transition-colors ff-shape-container"
                />
              </div>
            </div>

            {/* Dialog Icon Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {filteredIcons.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-[#CCCCCC] ff-shape-container bg-[#f7f7f5] text-xs text-[#999999]">
                  Arama kriterlerinize uygun ikon bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {filteredIcons.map((key) => {
                    const IconComponent = ICON_MAP[key]
                    const isSelected = form.icon === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          patch({ icon: key })
                          setIconPickerOpen(false)
                        }}
                        className={cn(
                          "aspect-square border flex flex-col items-center justify-center p-2.5 hover:border-[#ff4fd8] hover:shadow-sm transition-all ff-shape-container gap-1.5 relative group bg-[#f7f7f5]/40",
                          isSelected
                            ? "border-[#ff4fd8] bg-white ring-4 ring-[#ff4fd8]/10 scale-95"
                            : "border-[#CCCCCC] bg-white"
                        )}
                        title={key}
                      >
                        <IconComponent size={20} className={cn("transition-transform group-hover:scale-110", isSelected ? "text-[#ff4fd8]" : "text-[#555555]")} />
                        <span className="text-[9px] text-[#777777] truncate w-full text-center font-semibold">{key}</span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#ff4fd8] text-white rounded-full flex items-center justify-center shadow">
                            <Check size={8} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="p-4 px-6 border-t border-[#CCCCCC] bg-white flex items-center justify-between shrink-0">
              <div className="text-[11px] text-[#888888] font-semibold">
                Seçili İkon: <strong className="text-[#ff4fd8]">{form.icon}</strong>
              </div>
              <button
                type="button"
                onClick={() => setIconPickerOpen(false)}
                className="ff-shape-button px-5 h-8 border border-[#CCCCCC] text-[#666666] text-xs font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] hover:border-[#ff4fd8]/30 transition-colors"
              >
                Kapat
              </button>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Dialog: Confirm Deletion Modal ── */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-[#E0E0E0] p-6 shadow-2xl ff-shape-container animate-in zoom-in-95 duration-200 overflow-hidden outline-none">
            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#333333] transition-colors"
                aria-label="Kapat"
              >
                <X size={14} />
              </button>
            </Dialog.Close>

            <div className="ff-shape-button w-10 h-10 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-4">
              <Trash2 size={18} className="text-red-500" />
            </div>

            <Dialog.Title className="text-base font-extrabold text-[#333333] mb-2">
              Hizmeti Sil
            </Dialog.Title>

            {hasChildren ? (
              <div className="space-y-4">
                <Dialog.Description className="text-xs text-[#666666] leading-relaxed">
                  <strong className="text-[#333333]">{form.title}</strong> hizmetine bağlı alt hizmetler bulunmaktadır.
                  Veri bütünlüğünü korumak adına, alt hizmetleri olan bir ana hizmetin silinmesine izin verilmez.
                </Dialog.Description>
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold ff-shape-container leading-relaxed">
                  Lütfen önce bu hizmete bağlı alt uzmanlık alanlarını silin veya başka bir ana hizmete bağlayın.
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button className="ff-shape-button px-5 h-9 bg-[#f7f7f5] border border-[#CCCCCC] text-[#666666] text-[11px] font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] transition-colors">
                      Kapat
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Dialog.Description className="text-xs text-[#666666] leading-relaxed">
                  <strong className="text-[#333333]">{form.title}</strong> hizmetini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bu hizmete bağlı tüm veriler silinir.
                </Dialog.Description>

                {deleteError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold ff-shape-container">
                    {deleteError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button className="ff-shape-button px-5 h-9 border border-[#CCCCCC] bg-[#f7f7f5] text-[#666666] text-[11px] font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] transition-colors" disabled={deleteLoading}>
                      Vazgeç
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={async () => {
                      setDeleteLoading(true)
                      setDeleteError(null)
                      try {
                        const res = await fetch(`/api/services/${initial!.id}`, { method: "DELETE" })
                        const json = await res.json()
                        if (!res.ok || !json.ok) throw new Error(json.message ?? "Silme işlemi başarısız")
                        setDeleteOpen(false)
                        router.push("/admin/hizmetler")
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
                    Hizmeti Sil
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

// ── Supporting Components ─────────────────────────

function FormField({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-bold text-[#666666] block">
        {label}
      </label>
      {children}
      {description && (
        <p className="text-[10px] text-[#888888] leading-normal">{description}</p>
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
      <span className="text-[11px] font-bold text-[#666666] block">{label}</span>

      {value ? (
        <div className="relative group ff-shape-container ff-card overflow-hidden aspect-video max-w-md flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 duration-150">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ff-shape-button px-3.5 py-1.5 bg-white text-[11px] font-semibold text-[#333333] hover:text-[#ff4fd8] transition-colors"
            >
              Görseli Değiştir
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="ff-shape-button px-3.5 py-1.5 bg-[#ff4fd8] text-[11px] font-semibold text-white hover:bg-[#ff4fd8]/90 transition-colors"
            >
              Kaldır
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full max-w-md aspect-video border border-dashed border-[#CCCCCC] bg-[#f7f7f5] hover:border-[#ff4fd8]/40 hover:bg-[#ff4fd8]/5 transition-all flex flex-col items-center justify-center gap-2 ff-shape-container group"
        >
          <div className="w-10 h-10 rounded-full border border-[#CCCCCC] group-hover:border-[#ff4fd8]/30 group-hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm text-[#666666] group-hover:text-[#ff4fd8]">
            <ImageIcon size={16} />
          </div>
          <span className="text-[11px] font-bold text-[#666666] group-hover:text-[#ff4fd8]">Görsel Seç</span>
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
    return "#ff4fd8" // default fallback
  }, [value])

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-bold text-[#666666] block">Vurgu Rengi</span>
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
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-[#666666] block">Gradient Arka Plan</span>

      {/* Live Preview Banner */}
      <div
        style={{ background: currentBackground }}
        className="h-10 w-full ff-shape-container border border-[#CCCCCC] flex items-center justify-center text-white text-[9px] font-bold shadow-inner relative overflow-hidden shrink-0"
      >
        <div className="absolute inset-0 bg-[#f7f7f5]/10" />
        <span className="relative z-10 drop-shadow-md tracking-wider">GRADIENT ÖNİZLEME</span>
      </div>

      {/* Grid of Preset Gradients */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#f7f7f5] border border-[#E0E0E0] ff-shape-container shadow-inner justify-start">
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
                "w-7 h-7 rounded-full border-2 transition-all relative shrink-0 shadow-sm",
                isSelected
                  ? "border-[#ff4fd8] ring-4 ring-[#ff4fd8]/20 scale-105 shadow"
                  : "border-white hover:scale-105 hover:shadow"
              )}
              title={grad.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/15 rounded-[inherit]">
                  <Check size={9} className="stroke-[3.5] text-white" />
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
          className="text-[9px] font-bold text-[#ff4fd8] hover:underline"
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

function PremiumListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  function patch(index: number, value: string) {
    onChange(values.map((item, i) => (i === index ? value : item)))
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center border-b border-[#F0F0F0] pb-2">
        <span className="text-xs font-bold text-[#ff4fd8]">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff4fd8] hover:underline"
        >
          <Plus size={12} />
          Ekle
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              value={value}
              onChange={(e) => patch(index, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="ff-shape-button flex justify-center items-center w-9 h-9 border border-[#CCCCCC] hover:border-red-500/30 hover:bg-red-500/10 text-[#666666] hover:text-red-500 transition-all shrink-0"
              aria-label="Sil"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {values.length === 0 && (
          <div className="py-8 text-center border border-dashed border-[#CCCCCC] ff-shape-container text-xs text-[#999999]">
            Henüz ekleme yapılmadı.
          </div>
        )}
      </div>
    </div>
  )
}
