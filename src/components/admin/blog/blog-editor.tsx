"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Blog editor (modern, containerized)
// Cover image + inline content images + template + live preview
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useRouter } from "next/navigation"
import { Save, Eye, AlertTriangle, Loader2, Image as ImageIcon, X, FileText, LayoutGrid, Sparkles } from "@/lib/icons"
import { cn, slugify, formatDate } from "@/lib/utils"
import { FFButton } from "@/components/ui"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import { MarkdownRenderer } from "@/components/public/blog/markdown-renderer"
import { MediaPicker } from "@/components/admin/media/media-picker"
import type { BlogPostRecord } from "@/lib/ai/blog-store"

const CATEGORIES = ["Strateji", "Yaratıcılık", "Performans", "SEO", "Sosyal Medya", "Marka"]

const TEMPLATES = [
  { value: "classic", label: "Klasik", hint: "Tek sütun · tipografi odaklı", icon: FileText },
  { value: "editorial", label: "Editöryal", hint: "Yan panel · içindekiler", icon: LayoutGrid },
  { value: "visual", label: "Görsel Ağırlıklı", hint: "Full-width görseller", icon: Sparkles },
] as const

const GRADIENTS = [
  "from-[#FF4FD8]/30 via-[#6A0FCC]/20 to-[#0D0D0D]",
  "from-[#1A3A6B]/40 via-[#0D2447]/30 to-[#0D0D0D]",
  "from-[#FF6B35]/25 via-[#C23616]/20 to-[#0D0D0D]",
  "from-[#16A34A]/25 via-[#0D6931]/20 to-[#0D0D0D]",
  "from-[#D97706]/25 via-[#92400E]/20 to-[#0D0D0D]",
  "from-[#0EA5E9]/25 via-[#0369A1]/20 to-[#0D0D0D]",
  "from-[#EC4899]/25 via-[#9D174D]/20 to-[#0D0D0D]",
  "from-[#7C3AED]/30 via-[#4C1D95]/20 to-[#0D0D0D]",
  "from-[#2563EB]/25 via-[#1D4ED8]/20 to-[#0D0D0D]",
  "from-[#DC2626]/20 via-[#7F1D1D]/20 to-[#0D0D0D]",
]

interface BlogEditorProps {
  mode: "new" | "edit"
  initial?: BlogPostRecord
}

interface FormState {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string
  template: (typeof TEMPLATES)[number]["value"]
  coverImage: string | null
  coverGradient: string
  status: "draft" | "published"
}

export function BlogEditor({ mode, initial }: BlogEditorProps) {
  const router = useRouter()
  const contentRef = React.useRef<HTMLTextAreaElement>(null)

  const [form, setForm] = React.useState<FormState>(() => ({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "Strateji",
    tags: (initial?.tags ?? []).join(", "),
    template: initial?.template ?? "classic",
    coverImage: initial?.coverImage ?? null,
    coverGradient: initial?.coverGradient ?? GRADIENTS[0],
    status: initial?.status ?? "draft",
  }))
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  const [slugDirty, setSlugDirty] = React.useState(false)
  const [coverPicker, setCoverPicker] = React.useState(false)
  const [contentPicker, setContentPicker] = React.useState(false)

  React.useEffect(() => {
    if (mode === "new" && form.title && !slugDirty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-slug derived state
      setForm((f) => ({ ...f, slug: slugify(f.title) }))
    }
  }, [form.title, slugDirty, mode])

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  // Insert a markdown snippet at the content cursor.
  function insertAtCursor(snippet: string) {
    const el = contentRef.current
    if (!el) {
      patch({ content: form.content + snippet })
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = form.content.slice(0, start) + snippet + form.content.slice(end)
    patch({ content: next })
    setTimeout(() => {
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    }, 0)
  }

  async function save(nextStatus?: "draft" | "published") {
    setBusy(true)
    setError(null)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        template: form.template,
        coverImage: form.coverImage,
        coverGradient: form.coverGradient,
        status: nextStatus ?? form.status,
      }
      const url = mode === "new" ? "/api/blog" : `/api/blog/${initial!.slug}`
      const method = mode === "new" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Kayıt başarısız")
      router.push("/admin/blog")
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const canSave = !busy && form.title.trim().length >= 4 && form.content.trim().length >= 20

  return (
    <div className="px-6 md:px-10 pb-12 pt-2">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
            {mode === "new" ? "Yeni Yazı" : "Yazıyı Düzenle"}
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            Modern editör — kapak & metin-içi görseller, markdown, canlı önizleme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FFButton variant="outline" leftIcon={<Eye size={13} />} onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Editör" : "Önizleme"}
          </FFButton>
          <FFButton variant="outline" onClick={() => save("draft")} disabled={!canSave}>
            Kaydet
          </FFButton>
          <FFButton
            leftIcon={busy ? <Loader2 className="animate-spin" size={14} /> : <Save size={13} />}
            onClick={() => save("published")}
            disabled={!canSave}
          >
            Yayınla
          </FFButton>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/40">
          <AlertTriangle size={14} className="text-red-500 mt-0.5" />
          <p className="text-[12px] text-red-500">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {showPreview ? (
            <LivePreview form={form} />
          ) : (
            <>
              {/* Temel bilgiler */}
              <Card title="Temel Bilgiler">
                <Field label="Başlık">
                  <input value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Yazının başlığı" className={inputCls} />
                </Field>
                <Field label="Slug">
                  <input
                    value={form.slug}
                    onChange={(e) => { setSlugDirty(true); patch({ slug: e.target.value }) }}
                    placeholder="yazinin-slug-u"
                    className={cn(inputCls, "font-mono text-[12px]")}
                  />
                </Field>
                <Field label="Özet">
                  <textarea value={form.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} rows={3} placeholder="Yazının kısa özeti" className={cn(inputCls, "h-auto resize-y min-h-[72px]")} />
                </Field>
              </Card>

              {/* İçerik */}
              <Card title="İçerik" subtitle="Markdown destekli — başlık, kalın, liste, alıntı ve görsel ekleyin">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <TbBtn onClick={() => insertAtCursor("\n\n## Başlık\n\n")}>H2</TbBtn>
                  <TbBtn onClick={() => insertAtCursor("\n\n### Alt Başlık\n\n")}>H3</TbBtn>
                  <TbBtn onClick={() => insertAtCursor("**kalın**")}><strong>B</strong></TbBtn>
                  <TbBtn onClick={() => insertAtCursor("\n\n- Madde\n- Madde\n\n")}>• Liste</TbBtn>
                  <TbBtn onClick={() => insertAtCursor("\n\n> Alıntı\n\n")}>&ldquo; Alıntı</TbBtn>
                  <button
                    type="button"
                    onClick={() => setContentPicker(true)}
                    className="ff-shape-button inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/30 text-[var(--ff-purple)] hover:bg-[var(--ff-purple)]/15 transition-colors"
                  >
                    <ImageIcon size={12} /> Görsel Ekle
                  </button>
                </div>
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(e) => patch({ content: e.target.value })}
                  rows={22}
                  placeholder={"## Başlık\n\nParagraf...\n\n![Görsel açıklaması](görsel-url)\n\n- Madde 1\n\n> Alıntı"}
                  className={cn(inputCls, "h-auto resize-y min-h-[460px] font-mono text-[13px] leading-relaxed")}
                />
              </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Kapak */}
          <Card title="Kapak Görseli">
            <div className="ff-shape-container relative aspect-[16/10] overflow-hidden border border-[var(--border)] mb-3">
              {form.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImage} alt="Kapak" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className={cn("absolute inset-0 bg-gradient-to-br", form.coverGradient)} />
              )}
              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => patch({ coverImage: null })}
                  className="absolute top-2 right-2 ff-shape-button w-7 h-7 flex items-center justify-center bg-black/60 text-white hover:bg-black/80"
                  title="Kapağı kaldır"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <FFButton variant="outline" className="w-full" leftIcon={<ImageIcon size={13} />} onClick={() => setCoverPicker(true)}>
              {form.coverImage ? "Kapağı Değiştir" : "Kapak Görseli Seç"}
            </FFButton>

            {!form.coverImage && (
              <div className="mt-4">
                <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-faint)] mb-1.5">Görsel yoksa gradient</p>
                <div className="grid grid-cols-5 gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => patch({ coverGradient: g })}
                      className={cn(
                        "aspect-square bg-gradient-to-br border transition-all",
                        g,
                        form.coverGradient === g ? "border-[var(--ff-purple)] ring-2 ring-[var(--ff-purple)]/40" : "border-[var(--border)]"
                      )}
                      aria-label="Gradient seç"
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Şablon */}
          <Card title="Şablon" subtitle="Yazı detay sayfasının düzeni">
            <div className="space-y-2">
              {TEMPLATES.map((t) => {
                const Icon = t.icon
                const active = form.template === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => patch({ template: t.value })}
                    className={cn(
                      "ff-shape-container w-full flex items-center gap-3 p-3 border text-left transition-colors",
                      active ? "border-[var(--ff-purple)] bg-[var(--ff-purple)]/10" : "border-[var(--border)] hover:border-[var(--ff-purple)]/40"
                    )}
                  >
                    <span className={cn("ff-shape-button w-8 h-8 flex items-center justify-center shrink-0", active ? "bg-[var(--ff-purple)] text-white" : "bg-[var(--surface)] text-[var(--foreground-muted)]")}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <p className={cn("text-[13px] font-semibold", active ? "text-[var(--ff-purple)]" : "text-[var(--foreground)]")}>{t.label}</p>
                      <p className="text-[11px] text-[var(--foreground-faint)]">{t.hint}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Sınıflandırma */}
          <Card title="Sınıflandırma">
            <Field label="Kategori">
              <FFSelect value={form.category} onValueChange={(v) => patch({ category: v })} ariaLabel="Kategori">
                {CATEGORIES.map((c) => <FFSelectItem key={c} value={c}>{c}</FFSelectItem>)}
              </FFSelect>
            </Field>
            <Field label="Etiketler (virgülle)">
              <input value={form.tags} onChange={(e) => patch({ tags: e.target.value })} placeholder="seo, içerik, strateji" className={inputCls} />
            </Field>
          </Card>

          {/* Yayın */}
          <Card title="Yayın Durumu">
            <div className="flex items-center gap-2">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => patch({ status: s })}
                  className={cn(
                    "flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.08em] border transition-colors",
                    form.status === s ? "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]" : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--ff-purple)]"
                  )}
                >
                  {s === "draft" ? "Taslak" : "Yayında"}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* Media pickers */}
      {coverPicker && (
        <MediaPicker
          allowedTypes={["image"]}
          onSelect={(url) => { patch({ coverImage: url }); setCoverPicker(false) }}
          onClose={() => setCoverPicker(false)}
        />
      )}
      {contentPicker && (
        <MediaPicker
          allowedTypes={["image"]}
          onSelect={(url) => { insertAtCursor(`\n\n![Görsel](${url})\n\n`); setContentPicker(false) }}
          onClose={() => setContentPicker(false)}
        />
      )}
    </div>
  )
}

// ── Live preview ───────────────────────────────────────────
function LivePreview({ form }: { form: FormState }) {
  const tpl = TEMPLATES.find((t) => t.value === form.template)
  return (
    <Card title="Canlı Önizleme" subtitle={`Şablon: ${tpl?.label ?? form.template}`}>
      <div className="ff-shape-container border border-[var(--border)] overflow-hidden bg-[var(--background)]">
        {/* Cover */}
        <div className="relative w-full h-[220px]">
          {form.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImage} alt={form.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className={cn("absolute inset-0 bg-gradient-to-br", form.coverGradient)} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/70 mb-1">{form.category}</p>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-white leading-tight">
              {form.title || "Başlık önizlemesi"}
            </h2>
          </div>
        </div>
        {/* Body */}
        <div className={cn("p-6", form.template === "classic" && "max-w-2xl mx-auto")}>
          {form.excerpt && <p className="text-[var(--foreground-muted)] text-base mb-5 leading-relaxed">{form.excerpt}</p>}
          {form.content ? <MarkdownRenderer content={form.content} /> : <p className="text-[var(--foreground-faint)]">İçerik boş.</p>}
          <p className="mt-8 text-[11px] text-[var(--foreground-faint)]">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </Card>
  )
}

// ── Presentational helpers ─────────────────────────────────
const inputCls = cn(
  "ff-shape-button w-full h-10 bg-[var(--surface)] border border-[var(--border)]",
  "px-3 py-2 text-[13px] text-[var(--foreground)] outline-none",
  "placeholder:text-[var(--foreground-faint)]",
  "focus:border-[var(--ff-purple)] focus:shadow-[0_0_0_3px_var(--ff-purple)]/12"
)

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="ff-shape-container bg-[var(--surface)]/40 border border-[var(--border)] p-5">
      <header className="mb-4">
        <h2 className="font-display text-sm font-bold text-[var(--foreground)]">{title}</h2>
        {subtitle && <p className="text-[11px] text-[var(--foreground-faint)] mt-0.5">{subtitle}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)] mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function TbBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ff-shape-button px-2.5 py-1.5 text-[11px] font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)] transition-colors"
    >
      {children}
    </button>
  )
}
