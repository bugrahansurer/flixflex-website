"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — AI Studio (6-step wizard)
//
//   1. Topic       → ask AI for title suggestions
//   2. Title       → pick one (or write your own)
//   3. Outline     → editable structured outline
//   4. Write       → full markdown article
//   5. Images      → placeholder gallery with captions
//   6. Template    → pick layout + save draft / publish
//
// The component is one big client file on purpose — each step
// is pure JSX, the state machine is dead-simple, and splitting
// it into 6 files would inflate the file count without
// improving readability. Sub-components are extracted only
// where they pay for themselves (preview, image card).
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import { FFButton } from "@/components/ui"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import { MarkdownRenderer } from "@/components/public/blog/markdown-renderer"
import type {
  Outline,
  ImageSuggestion,
  TemplateName,
} from "@/lib/ai/blog-pipeline"

// ── Types ──────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Konu" },
  { id: 2, label: "Başlık" },
  { id: 3, label: "Taslak" },
  { id: 4, label: "Yazı" },
  { id: 5, label: "Görseller" },
  { id: 6, label: "Şablon & Yayın" },
] as const

type StepId = (typeof STEPS)[number]["id"]

interface WizardState {
  topic: string
  titles: string[]
  chosenTitle: string
  outline: Outline | null
  markdown: string
  images: ImageSuggestion[]
  template: TemplateName
  category: string
  tags: string
}

const INITIAL_STATE: WizardState = {
  topic: "",
  titles: [],
  chosenTitle: "",
  outline: null,
  markdown: "",
  images: [],
  template: "classic",
  category: "Strateji",
  tags: "",
}

interface AIStudioProps {
  keyConfigured: boolean
  defaultModel: string
}

// ═══════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════
export function AIStudio({ keyConfigured, defaultModel }: AIStudioProps) {
  const router = useRouter()
  const [step, setStep] = React.useState<StepId>(1)
  const [state, setState] = React.useState<WizardState>(INITIAL_STATE)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const patch = React.useCallback((p: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...p }))
  }, [])

  const goto = React.useCallback((next: StepId) => {
    setError(null)
    setStep(next)
  }, [])

  // ── Stage callers ────────────────────────────────────────
  async function callTitles() {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/ai/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: state.topic, model: defaultModel }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Hata")
      patch({ titles: json.titles ?? [] })
      goto(2)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function callOutline() {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/ai/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: state.chosenTitle, model: defaultModel }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Hata")
      patch({ outline: json.outline })
      goto(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function callWrite() {
    if (!state.outline) return
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: state.chosenTitle, outline: state.outline, model: defaultModel }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Hata")
      patch({ markdown: json.markdown ?? "" })
      goto(4)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function callImages() {
    if (!state.markdown) return
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/ai/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: state.markdown, model: defaultModel }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Hata")
      patch({ images: json.images ?? [] })
      goto(5)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function callTemplate() {
    if (!state.markdown) return
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/ai/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: state.markdown, model: defaultModel }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Hata")
      patch({ template: json.template ?? "classic" })
      goto(6)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function save(status: "draft" | "published") {
    setLoading(true); setError(null)
    try {
      const tagsArr = state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.chosenTitle,
          content: state.markdown,
          template: state.template,
          category: state.category,
          tags: tagsArr,
          status,
          aiGenerated: true,
          aiOutline: state.outline,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Kayıt başarısız")
      router.push("/admin/blog")
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  // ── UI ───────────────────────────────────────────────────
  return (
    <div className="px-6 md:px-10 pb-12 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] flex items-center gap-2">
            <Sparkles size={20} className="text-[var(--ff-purple)]" />
            AI Studio
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Adım {step} / {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/ai")}
          className="text-[12px] text-[var(--foreground-faint)] hover:text-[var(--foreground)] transition-colors"
        >
          İptal
        </button>
      </div>

      {/* Progress strip */}
      <ProgressStrip current={step} />

      {/* Key warning */}
      {!keyConfigured && (
        <div className="ff-shape-container mb-6 flex items-center justify-start gap-3 h-9 px-4 bg-yellow-500/10 border border-yellow-500/40">
          <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
          <div className="text-[12px] text-yellow-500">
            <strong>ANTHROPIC_API_KEY tanımlı değil.</strong> Arayüz çalışmaya devam eder
            fakat AI çağrıları 500 hatasıyla geri döner. .env.local&apos;i güncelleyin.
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="ff-shape-container mb-6 flex items-center justify-start gap-3 h-9 px-4 bg-red-500/10 border border-red-500/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-[12px] text-red-500">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-400"
            aria-label="Kapat"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <Step1Topic
              topic={state.topic}
              onChange={(topic) => patch({ topic })}
              onSubmit={callTitles}
              loading={loading}
            />
          )}
          {step === 2 && (
            <Step2Title
              titles={state.titles}
              chosen={state.chosenTitle}
              onChoose={(chosenTitle) => patch({ chosenTitle })}
              onBack={() => goto(1)}
              onContinue={() => state.chosenTitle.trim() && callOutline()}
              onRegenerate={callTitles}
              loading={loading}
            />
          )}
          {step === 3 && state.outline && (
            <Step3Outline
              outline={state.outline}
              onUpdate={(outline) => patch({ outline })}
              onBack={() => goto(2)}
              onContinue={callWrite}
              loading={loading}
            />
          )}
          {step === 4 && (
            <Step4Write
              markdown={state.markdown}
              onChange={(markdown) => patch({ markdown })}
              onBack={() => goto(3)}
              onContinue={callImages}
              onRegenerate={callWrite}
              loading={loading}
            />
          )}
          {step === 5 && (
            <Step5Images
              images={state.images}
              onUpdate={(images) => patch({ images })}
              onBack={() => goto(4)}
              onContinue={callTemplate}
              onRegenerate={callImages}
              loading={loading}
            />
          )}
          {step === 6 && (
            <Step6Publish
              state={state}
              onUpdate={patch}
              onBack={() => goto(5)}
              onSaveDraft={() => save("draft")}
              onPublish={() => save("published")}
              loading={loading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Progress strip
// ═══════════════════════════════════════════════════════════
function ProgressStrip({ current }: { current: StepId }) {
  return (
    <ol className="flex items-center gap-2 mb-8 overflow-x-auto">
      {STEPS.map((s) => {
        const active = s.id === current
        const done = s.id < current
        return (
          <li key={s.id} className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "ff-shape-container w-7 h-7 flex items-center justify-center text-[11px] font-bold font-display",
                active && "bg-[var(--ff-purple)] text-white",
                done && "bg-[rgba(255, 79, 216, 0.2)] text-[var(--ff-purple)] border border-[var(--ff-purple)]",
                !active && !done && "bg-[var(--surface)] text-[var(--foreground-faint)] border border-[var(--border)]"
              )}
            >
              {done ? <CheckCircle2 size={13} /> : s.id}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium hidden md:inline",
                active ? "text-[var(--foreground)]" : "text-[var(--foreground-faint)]"
              )}
            >
              {s.label}
            </span>
            {s.id < STEPS.length && (
              <span className="w-6 h-px bg-[var(--border)] hidden md:inline-block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 1 — Topic
// ═══════════════════════════════════════════════════════════
function Step1Topic({
  topic,
  onChange,
  onSubmit,
  loading,
}: {
  topic: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <label className="text-[11px] font-semibold text-[var(--foreground-muted)]">
          Konu / Anahtar Kelime
        </label>
        <textarea
          value={topic}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Örn: 'TikTok algoritması 2026', 'B2B SaaS lead generation', 'rebranding süreci'..."
          rows={5}
          className={cn(
            "ff-shape-container w-full bg-[var(--surface)] border border-[var(--border)]",
            "px-4 py-3 text-[15px] text-[var(--foreground)] resize-y",
            "placeholder:text-[var(--foreground-faint)] outline-none",
            "focus:border-[var(--ff-purple)] focus:shadow-[0_0_0_3px_rgba(255, 79, 216, 0.12)]"
          )}
        />
        <p className="text-[11px] text-[var(--foreground-faint)]">
          AI bu konu için 5-10 başlık önerecek. Sonra istediğini seçer veya
          kendin yazarsın.
        </p>
        <FFButton
          onClick={onSubmit}
          disabled={loading || !topic.trim()}
          leftIcon={loading ? <Loader2 className="animate-spin" size={15} /> : <Wand2 size={15} />}
        >
          {loading ? "Düşünüyorum..." : "Başlık Öner"}
        </FFButton>
      </div>

      <aside className="ff-shape-container bg-[var(--surface)] border border-[var(--border)] p-5 h-fit">
        <h3 className="font-display font-bold text-[var(--foreground)] mb-2">
          İpuçları
        </h3>
        <ul className="text-[12px] text-[var(--foreground-muted)] space-y-2 list-disc pl-4">
          <li>Spesifik ol: &ldquo;reklam&rdquo; yerine &ldquo;Google Ads&apos;te smart bidding&rdquo;</li>
          <li>Hedef kitleyi belirt: B2B / e-ticaret / sosyal medya</li>
          <li>2026 trendlerini referans alabilirsin</li>
          <li>Sektör jargonu kullan — AI ona göre cevaplar</li>
        </ul>
      </aside>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 2 — Title selection
// ═══════════════════════════════════════════════════════════
function Step2Title({
  titles,
  chosen,
  onChoose,
  onBack,
  onContinue,
  onRegenerate,
  loading,
}: {
  titles: string[]
  chosen: string
  onChoose: (t: string) => void
  onBack: () => void
  onContinue: () => void
  onRegenerate: () => void
  loading: boolean
}) {
  const [custom, setCustom] = React.useState("")
  const [titleMode, setTitleMode] = React.useState<"suggested" | "custom" | "none">("none")

  const selectedTitle = titleMode === "custom" ? custom : chosen

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--foreground-muted)]">
          {titles.length} başlık önerisi — birini seç veya kendin yaz.
        </p>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="ff-shape-button inline-flex items-center gap-1.5 text-[12px] text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <ul className="space-y-2">
        {titles.map((t, i) => {
          const active = titleMode === "suggested" && chosen === t
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  setTitleMode("suggested")
                  onChoose(t)
                }}
                className={cn(
                  "w-full text-left p-4 flex items-start gap-3 border transition-all",
                  active
                    ? "bg-[rgba(255, 79, 216, 0.08)] border-[var(--ff-purple)]"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--ff-purple)]"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 mt-0.5 shrink-0 border rounded-full flex items-center justify-center",
                    active ? "border-[var(--ff-purple)]" : "border-[var(--border)]"
                  )}
                >
                  {active && <span className="w-2 h-2 rounded-full bg-[var(--ff-purple)]" />}
                </span>
                <span
                  className={cn(
                    "text-[15px] leading-snug",
                    active ? "text-[var(--foreground)] font-medium" : "text-[var(--foreground-muted)]"
                  )}
                >
                  {t}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="pt-2">
        <label className="text-[11px] font-semibold text-[var(--foreground-muted)] mb-2 block">
          Veya kendi başlığını yaz
        </label>
        <input
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value)
            setTitleMode("custom")
          }}
          onBlur={() => {
            if (titleMode === "custom" && custom.trim()) {
              onChoose(custom)
            }
          }}
          placeholder="Kendi başlığını buraya yaz..."
          className={cn(
            "ff-shape-container w-full bg-[var(--surface)] border border-[var(--border)]",
            "px-4 py-3 text-[15px] text-[var(--foreground)] outline-none",
            "placeholder:text-[var(--foreground-faint)]",
            "focus:border-[var(--ff-purple)] focus:shadow-[0_0_0_3px_rgba(255, 79, 216, 0.12)]",
            titleMode === "custom" && custom.length > 0 && "border-[var(--ff-purple)]"
          )}
        />
      </div>

      <NavRow
        onBack={onBack}
        onContinue={() => {
          if (titleMode === "custom" && custom.trim()) {
            onChoose(custom)
          }
          onContinue()
        }}
        continueDisabled={!selectedTitle.trim() || loading}
        loading={loading}
        continueLabel={loading ? "Taslak Üretiliyor..." : "Devam"}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 3 — Outline editor
// ═══════════════════════════════════════════════════════════
function Step3Outline({
  outline,
  onUpdate,
  onBack,
  onContinue,
  loading,
}: {
  outline: Outline
  onUpdate: (o: Outline) => void
  onBack: () => void
  onContinue: () => void
  loading: boolean
}) {
  function updateHeading(i: number, value: string) {
    const next = { ...outline, outline: [...outline.outline] }
    next.outline[i] = { ...next.outline[i], heading: value }
    onUpdate(next)
  }
  function updatePoint(si: number, pi: number, value: string) {
    const next = { ...outline, outline: outline.outline.map((s) => ({ ...s, points: [...s.points] })) }
    next.outline[si].points[pi] = value
    onUpdate(next)
  }
  function addPoint(si: number) {
    const next = { ...outline, outline: outline.outline.map((s) => ({ ...s, points: [...s.points] })) }
    next.outline[si].points.push("")
    onUpdate(next)
  }
  function removePoint(si: number, pi: number) {
    const next = { ...outline, outline: outline.outline.map((s) => ({ ...s, points: [...s.points] })) }
    next.outline[si].points.splice(pi, 1)
    onUpdate(next)
  }
  function addSection() {
    onUpdate({
      ...outline,
      outline: [...outline.outline, { heading: "Yeni başlık", points: ["Yeni alt madde"] }],
    })
  }
  function removeSection(i: number) {
    const next = { ...outline, outline: [...outline.outline] }
    next.outline.splice(i, 1)
    onUpdate(next)
  }

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-[var(--foreground-muted)]">
        Taslak üzerinde düzenleme yap; AI bunu kullanarak yazıyı yazacak.
      </p>

      <div className="space-y-4">
        {outline.outline.map((s, si) => (
          <div key={si} className="bg-[var(--surface)] border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[11px] text-[var(--ff-purple)] w-6">
                {String(si + 1).padStart(2, "0")}
              </span>
              <input
                value={s.heading}
                onChange={(e) => updateHeading(si, e.target.value)}
                className="flex-1 bg-transparent border-b border-[var(--border)] focus:border-[var(--ff-purple)] outline-none px-1 py-1.5 font-display font-bold text-[15px] text-[var(--foreground)]"
              />
              <button
                type="button"
                onClick={() => removeSection(si)}
                className="text-[var(--foreground-faint)] hover:text-red-500 transition-colors"
                aria-label="Bölümü sil"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <ul className="space-y-1.5 pl-8">
              {s.points.map((p, pi) => (
                <li key={pi} className="flex items-center gap-2">
                  <span className="text-[var(--foreground-faint)] text-[11px]">•</span>
                  <input
                    value={p}
                    onChange={(e) => updatePoint(si, pi, e.target.value)}
                    className="flex-1 bg-transparent border-b border-transparent focus:border-[var(--border)] hover:border-[var(--border)] outline-none px-1 py-1 text-[13px] text-[var(--foreground-muted)]"
                  />
                  <button
                    type="button"
                    onClick={() => removePoint(si, pi)}
                    className="text-[var(--foreground-faint)] hover:text-red-500 transition-colors"
                    aria-label="Maddeyi sil"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => addPoint(si)}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--foreground-faint)] hover:text-[var(--ff-purple)] transition-colors"
                >
                  <Plus size={11} /> Madde Ekle
                </button>
              </li>
            </ul>
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className={cn(
            "w-full p-4 border border-dashed border-[var(--border)]",
            "text-[12px] text-[var(--foreground-faint)]",
            "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)] transition-colors",
            "inline-flex items-center justify-center gap-2"
          )}
        >
          <Plus size={13} /> Yeni Bölüm Ekle
        </button>
      </div>

      {outline.keyArguments.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
          <h4 className="font-display font-bold text-[13px] text-[var(--foreground-muted)] mb-2">
            Ana Argümanlar
          </h4>
          <ul className="text-[12px] text-[var(--foreground-muted)] space-y-1 list-disc pl-5">
            {outline.keyArguments.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <NavRow
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={outline.outline.length === 0 || loading}
        loading={loading}
        continueLabel={loading ? "Yazıyor..." : "Yazıyı Üret"}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 4 — Article preview + edit
// ═══════════════════════════════════════════════════════════
function Step4Write({
  markdown,
  onChange,
  onBack,
  onContinue,
  onRegenerate,
  loading,
}: {
  markdown: string
  onChange: (m: string) => void
  onBack: () => void
  onContinue: () => void
  onRegenerate: () => void
  loading: boolean
}) {
  const [mode, setMode] = React.useState<"preview" | "edit">("preview")
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--foreground-muted)]">
            {wordCount} kelime
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "ff-shape-button px-3 py-1.5 text-[11px] border transition-colors",
              mode === "preview"
                ? "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]"
                : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--ff-purple)]"
            )}
          >
            Önizleme
          </button>
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={cn(
              "ff-shape-button px-3 py-1.5 text-[11px] border transition-colors",
              mode === "edit"
                ? "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]"
                : "bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--ff-purple)]"
            )}
          >
            Markdown
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="ff-shape-button inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            Tekrar Üret
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 md:p-8 min-h-[500px] max-h-[700px] overflow-y-auto">
        {mode === "preview" ? (
          markdown ? (
            <MarkdownRenderer content={markdown} />
          ) : (
            <p className="text-[var(--foreground-faint)] text-center">Yazı henüz üretilmedi.</p>
          )
        ) : (
          <textarea
            value={markdown}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full min-h-[500px] bg-transparent border-0 outline-none resize-none font-mono text-[13px] leading-relaxed text-[var(--foreground)]"
          />
        )}
      </div>

      <NavRow
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!markdown || loading}
        loading={loading}
        continueLabel={loading ? "Görseller Hazırlanıyor..." : "Görseller"}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 5 — Images gallery
// ═══════════════════════════════════════════════════════════
function Step5Images({
  images,
  onUpdate,
  onBack,
  onContinue,
  onRegenerate,
  loading,
}: {
  images: ImageSuggestion[]
  onUpdate: (i: ImageSuggestion[]) => void
  onBack: () => void
  onContinue: () => void
  onRegenerate: () => void
  loading: boolean
}) {
  function update(i: number, patch: Partial<ImageSuggestion>) {
    const next = [...images]
    next[i] = { ...next[i], ...patch }
    onUpdate(next)
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const next = [...images]
      ;[next[i], next[j]] = [next[j], next[i]]
    onUpdate(next)
  }
  function remove(i: number) {
    const next = [...images]
    next.splice(i, 1)
    onUpdate(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--foreground-muted)]">
          {images.length} görsel önerisi — placeholder gradient&apos;ler. Sıralama yazıdaki yerleşimi belirler.
        </p>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="ff-shape-button inline-flex items-center gap-1.5 text-[12px] text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img, i) => (
          <div key={i} className="ff-shape-container bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
            <div className="aspect-[16/10] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.placeholder}
                alt={img.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-mono">
                #{i + 1}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="w-6 h-6 bg-black/60 text-white flex items-center justify-center hover:bg-[var(--ff-purple)] disabled:opacity-30 transition-colors"
                  aria-label="Yukarı taşı"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="w-6 h-6 bg-black/60 text-white flex items-center justify-center hover:bg-[var(--ff-purple)] disabled:opacity-30 transition-colors"
                  aria-label="Aşağı taşı"
                >
                  <ChevronRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="w-6 h-6 bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  aria-label="Sil"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <label className="text-[10px] text-[var(--foreground-faint)]">
                Altyazı
              </label>
              <input
                value={img.caption}
                onChange={(e) => update(i, { caption: e.target.value })}
                className="ff-shape-container w-full bg-[var(--surface-elevated)] border border-[var(--border)] px-2 py-1.5 text-[12px] text-[var(--foreground)] outline-none focus:border-[var(--ff-purple)]"
              />
              <label className="text-[10px] text-[var(--foreground-faint)]">
                Yerleşim (başlık)
              </label>
              <input
                value={img.placement}
                onChange={(e) => update(i, { placement: e.target.value })}
                className="ff-shape-container w-full bg-[var(--surface-elevated)] border border-[var(--border)] px-2 py-1.5 text-[11px] font-mono text-[var(--foreground-muted)] outline-none focus:border-[var(--ff-purple)]"
              />
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="md:col-span-2 p-8 border border-dashed border-[var(--border)] text-center">
            <ImageIcon className="mx-auto text-[var(--foreground-faint)]" size={24} />
            <p className="text-[12px] text-[var(--foreground-muted)] mt-2">
              Henüz görsel önerisi yok.
            </p>
          </div>
        )}
      </div>

      <NavRow
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={loading}
        loading={loading}
        continueLabel={loading ? "Şablon Öneriliyor..." : "Şablon Seç"}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STEP 6 — Template + publish
// ═══════════════════════════════════════════════════════════
const TEMPLATE_OPTIONS: Array<{ id: TemplateName; label: string; desc: string }> = [
  { id: "classic", label: "Klasik", desc: "Tipografi odaklı, tek sütun" },
  { id: "editorial", label: "Editorial", desc: "Magazin tarzı, geniş kapak" },
  { id: "visual", label: "Visual", desc: "Görsel ağırlıklı, motion" },
]

const CATEGORIES = [
  "Strateji",
  "Yaratıcılık",
  "Performans",
  "SEO",
  "Sosyal Medya",
  "Marka",
]

function Step6Publish({
  state,
  onUpdate,
  onBack,
  onSaveDraft,
  onPublish,
  loading,
}: {
  state: WizardState
  onUpdate: (p: Partial<WizardState>) => void
  onBack: () => void
  onSaveDraft: () => void
  onPublish: () => void
  loading: boolean
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left — preview */}
      <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] p-6 md:p-8 max-h-[700px] overflow-y-auto">
        <p className="text-[10px] text-[var(--ff-purple)] font-mono mb-2">
          {`// ÖNİZLEME — ${state.template}`}
        </p>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[var(--foreground)] mb-2 leading-tight">
          {state.chosenTitle || "Başlık yok"}
        </h1>
        <p className="text-[12px] text-[var(--foreground-muted)] mb-6">
          {state.category} &middot; {state.markdown.trim().split(/\s+/).filter(Boolean).length} kelime
        </p>
        {state.markdown ? (
          <MarkdownRenderer content={state.markdown} />
        ) : (
          <p className="text-[var(--foreground-faint)]">İçerik bulunamadı.</p>
        )}
      </div>

      {/* Right — controls */}
      <aside className="space-y-4">
        {/* Template selector */}
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
          <h4 className="font-display font-bold text-[12px] text-[var(--foreground-muted)] mb-3">
            Şablon
          </h4>
          <p className="text-[11px] text-[var(--foreground-faint)] mb-3">
            AI önerisi: <span className="text-[var(--ff-purple)] font-semibold">{state.template}</span>
          </p>
          <div className="space-y-2">
            {TEMPLATE_OPTIONS.map((opt) => {
              const active = state.template === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdate({ template: opt.id })}
                  className={cn(
                    "w-full text-left p-3 border transition-colors",
                    active
                      ? "bg-[rgba(255, 79, 216, 0.08)] border-[var(--ff-purple)]"
                      : "bg-[var(--surface-elevated)] border-[var(--border)] hover:border-[var(--ff-purple)]"
                  )}
                >
                  <p className={cn("text-[13px] font-semibold", active ? "text-[var(--ff-purple)]" : "text-[var(--foreground)]")}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Category */}
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold text-[var(--foreground-muted)]">
            Kategori
          </label>
          <div className="mt-2">
            <FFSelect
              value={state.category}
              onValueChange={(v) => onUpdate({ category: v })}
              size="sm"
              ariaLabel="Kategori"
            >
              {CATEGORIES.map((c) => (
                <FFSelectItem key={c} value={c}>
                  {c}
                </FFSelectItem>
              ))}
            </FFSelect>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
          <label className="text-[11px] font-semibold text-[var(--foreground-muted)]">
            Etiketler (virgülle ayır)
          </label>
          <input
            value={state.tags}
            onChange={(e) => onUpdate({ tags: e.target.value })}
            placeholder="örnek, ai, içerik"
            className="ff-shape-container mt-2 w-full bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--ff-purple)]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <FFButton onClick={onPublish} disabled={loading} fullWidth>
            {loading ? <Loader2 className="animate-spin" size={15} /> : null}
            {loading ? "Kaydediliyor..." : "Yayınla"}
          </FFButton>
          <FFButton variant="outline" onClick={onSaveDraft} disabled={loading} fullWidth>
            Taslak Olarak Kaydet
          </FFButton>
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] text-[var(--foreground-faint)] hover:text-[var(--foreground)] py-2 transition-colors"
          >
            ← Geri
          </button>
        </div>
      </aside>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Shared nav row
// ═══════════════════════════════════════════════════════════
function NavRow({
  onBack,
  onContinue,
  continueDisabled,
  continueLabel,
  loading,
}: {
  onBack: () => void
  onContinue: () => void
  continueDisabled: boolean
  continueLabel: string
  loading: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
      <button
        type="button"
        onClick={onBack}
        className="ff-shape-button inline-flex items-center gap-1.5 text-[12px] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ChevronLeft size={13} />
        Geri
      </button>
      <FFButton
        onClick={onContinue}
        disabled={continueDisabled}
        rightIcon={loading ? <Loader2 className="animate-spin" size={14} /> : <ChevronRight size={14} />}
      >
        {continueLabel}
      </FFButton>
    </div>
  )
}
