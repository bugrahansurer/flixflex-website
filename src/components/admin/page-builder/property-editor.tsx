"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Property Editor (right rail)
// Dynamic form generated from SECTION_SCHEMAS
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useCallback } from "react"
import { X } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { usePageBuilder } from "@/store/page-builder"
import { useShallow } from "zustand/react/shallow"
import { SECTION_SCHEMAS } from "@/types/page-builder"
import { SECTION_REGISTRY } from "@/lib/page-builder/section-registry"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Image as ImageIcon, Video } from "@/lib/icons"

// ── Field renderers ───────────────────────────────
interface FieldProps {
  name: string
  value: unknown
  schema: { description?: string }
  onChange: (val: unknown) => void
}

function FieldLabel({ name }: { name: string }) {
  const labels: Record<string, string> = {
    headline: "Başlık",
    subheadline: "Alt Başlık",
    videoUrl: "Video URL",
    videoUrlMobile: "Mobil Video URL",
    posterUrl: "Kapak Görseli",
    ctaLabel: "Buton Yazısı",
    ctaHref: "Buton Linki",
    secondaryCtaLabel: "2. Buton Yazısı",
    secondaryCtaHref: "2. Buton Linki",
    hideMobileDock: "Mobil Dock Gizle",
    filterEnabled: "Filtre Aktif",
    maxItems: "Maksimum Öğe",
    showAll: "Hepsini Göster",
    eyebrow: "Üst Başlık",
    description: "Açıklama",
    variant: "Varyant",
    body: "İçerik",
    imageUrl: "Görsel URL",
    imageAlt: "Görsel Alt Metni",
    imagePosition: "Görsel Pozisyonu",
    aspectRatio: "En-Boy Oranı",
    autoplay: "Otomatik Oynat",
    question: "Soru",
    answer: "Cevap",
    showMap: "Harita Göster",
    primaryColor: "Ana Renk",
    leftText: "Sol Manifesto Metni ([media1-3] içerir)",
    mediaUrl1: "1. Medya URL / Dosya",
    mediaType1: "1. Medya Tipi",
    mediaUrl2: "2. Medya URL / Dosya",
    mediaType2: "2. Medya Tipi",
    mediaUrl3: "3. Medya URL / Dosya",
    mediaType3: "3. Medya Tipi",
    rightContent: "Sağ Açıklama Metni (Yeni satır destekler)",
    backgroundColor: "Arka Plan Rengi",
    textColor: "Yazı Rengi",
    accentColor: "Vurgu Rengi",
  }

  const label = labels[name] || name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
  return (
    <label className="text-[10px] font-semibold text-[#666666] block mb-1">
      {label}
    </label>
  )
}

function TextField({ name, value, onChange }: FieldProps) {
  return (
    <div>
      <FieldLabel name={name} />
      <input
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "ff-shape-container w-full px-3 py-2 text-[12px]",
          "bg-[#f7f7f5] border border-[#CCCCCC]",
          "text-[#333333] placeholder:text-[#666666]",
          "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
        )}
      />
    </div>
  )
}

function TextareaField({ name, value, onChange }: FieldProps) {
  return (
    <div>
      <FieldLabel name={name} />
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={cn(
          "ff-shape-container w-full px-3 py-2 text-[12px] resize-y min-h-[72px]",
          "bg-[#f7f7f5] border border-[#CCCCCC]",
          "text-[#333333] placeholder:text-[#666666]",
          "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
        )}
      />
    </div>
  )
}

function ManifestoTextEditor({ name, value, onChange }: FieldProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const valStr = typeof value === "string" ? value : ""

  const insertMediaToken = (tokenNumber: number) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const token = `[media${tokenNumber}]`

    const newValue = valStr.substring(0, start) + token + valStr.substring(end)
    onChange(newValue)

    // Focus back and set cursor position after the inserted token
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + token.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel name={name} />
      <textarea
        ref={textareaRef}
        value={valStr}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={cn(
          "ff-shape-container w-full px-3 py-2 text-[12px] resize-y min-h-[80px]",
          "bg-[#f7f7f5] border border-[#CCCCCC]",
          "text-[#333333] placeholder:text-[#666666]",
          "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
        )}
        placeholder="Manifesto metnini girin..."
      />

      {/* Quick insert media buttons */}
      <div className="flex items-center gap-1.5 mt-1">
        {[1, 2, 3].map((num) => {
          const hasToken = valStr.includes(`[media${num}]`)
          return (
            <button
              key={num}
              type="button"
              onClick={() => insertMediaToken(num)}
              className={cn(
                "ff-shape-button px-2.5 py-1 text-[10px] font-semibold border transition-all duration-150",
                hasToken
                  ? "bg-[#ff4fd8]/5 border-[#ff4fd8] text-[#ff4fd8]"
                  : "bg-white border-[#CCCCCC] text-[#666666] hover:border-[#ff4fd8] hover:text-[#ff4fd8]"
              )}
            >
              + Medya {num}
            </button>
          )
        })}
      </div>
      <p className="text-[9px] text-[#999999] leading-normal mt-0.5">
        Metin içerisinde görsel/videoların görüneceği yerlere tıklayıp yukarıdaki butonlarla medya alanları yerleştirebilirsiniz.
      </p>
    </div>
  )
}

function BooleanField({ name, value, onChange }: FieldProps) {
  return (
    <div className="flex items-center justify-between">
      <FieldLabel name={name} />
      <button
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={cn(
          "ff-shape-container relative w-11 h-6 border transition-colors duration-200 shrink-0",
          value
            ? "bg-[#ff4fd8] border-[#ff4fd8]"
            : "bg-[#f7f7f5] border-[#CCCCCC]"
        )}
      >
        <span
          className={cn(
            "ff-shape-container absolute top-0.5 w-4.5 h-4.5 bg-white transition-transform duration-200",
            value ? "translate-x-0" : "translate-x-[-18px]"
          )}
        />
      </button>
    </div>
  )
}

function SelectField({
  name,
  value,
  onChange,
  options,
}: FieldProps & { options: string[] }) {
  return (
    <div>
      <FieldLabel name={name} />
      <FFSelect
        value={typeof value === "string" ? value : ""}
        onValueChange={onChange}
        size="sm"
        ariaLabel={name}
      >
        {options.map((opt) => (
          <FFSelectItem key={opt} value={opt}>
            {opt}
          </FFSelectItem>
        ))}
      </FFSelect>
    </div>
  )
}

function NumberField({ name, value, onChange }: FieldProps) {
  return (
    <div>
      <FieldLabel name={name} />
      <input
        type="number"
        value={typeof value === "number" ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "ff-shape-container w-full px-3 py-2 text-[12px]",
          "bg-[#f7f7f5] border border-[#CCCCCC]",
          "text-[#333333]",
          "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
        )}
      />
    </div>
  )
}

function ColorField({ name, value, onChange }: FieldProps) {
  return (
    <div>
      <FieldLabel name={name} />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={typeof value === "string" ? value : "#ff4d8d"}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-10 h-10 rounded-full border border-[#CCCCCC] cursor-pointer bg-transparent p-0 overflow-hidden shrink-0",
            "[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full",
            "[&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
          )}
        />
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "ff-shape-container flex-1 px-3 py-2 text-[12px]",
            "bg-[#f7f7f5] border border-[#CCCCCC]",
            "text-[#333333]",
            "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
          )}
          placeholder="#ff4d8d veya CSS renk değeri"
        />
      </div>
    </div>
  )
}

interface MediaFieldProps extends FieldProps {
  sectionType?: string
  sectionProps?: Record<string, unknown>
}

function MediaField({ name, value, onChange, sectionType, sectionProps }: MediaFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isVideo =
    name.toLowerCase().includes("video") ||
    name.toLowerCase().includes("videourl") ||
    (sectionType === "scroll-expansion-hero" && name === "mediaSrc" && sectionProps?.mediaType === "video")

  const currentUrl = typeof value === "string" ? value : ""
  const fileName = currentUrl ? currentUrl.split("/").pop() ?? currentUrl : ""

  return (
    <div>
      <FieldLabel name={name} />

      {/* Seçili dosya göstergesi */}
      {fileName && (
        <div className={cn(
          "ff-shape-container flex items-center gap-2 px-3 py-1.5 mb-2",
          "bg-[#f7f7f5] border border-[#CCCCCC]"
        )}>
          <span className="text-[#ff4fd8] shrink-0">
            {isVideo ? <Video size={11} /> : <ImageIcon size={11} />}
          </span>
          <span className="text-[10px] text-[#333333] truncate flex-1">{fileName}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[#999999] hover:text-[#e03434] transition-colors shrink-0"
            title="Kaldır"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Medya kütüphanesi butonu */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "ff-shape-button w-full h-9 flex items-center justify-center gap-2",
          "border border-dashed border-[#CCCCCC]",
          "text-[11px] font-semibold text-[#666666]",
          "hover:border-[#ff4fd8] hover:text-[#ff4fd8] hover:bg-[#ff4fd8]/5",
          "transition-all duration-150"
        )}
      >
        {isVideo ? <Video size={13} /> : <ImageIcon size={13} />}
        {isVideo ? "Video Seç" : "Görsel Seç"}
      </button>

      {isOpen && (
        <MediaPicker
          allowedTypes={isVideo ? ["video"] : ["image"]}
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

// ── Determine field renderer from Zod shape ───────
function inferFieldType(fieldDef: Record<string, unknown>): string {
  // Walk _def chain to find type name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let def: any = fieldDef
  while (def) {
    const typeName: string = def.typeName ?? def.type ?? ""
    if (typeName === "ZodBoolean" || typeName === "boolean") return "boolean"
    if (typeName === "ZodNumber" || typeName === "number") return "number"
    if (typeName === "ZodEnum" || typeName === "enum") return "select"
    if (typeName === "ZodArray" || typeName === "array") return "array"
    if (typeName === "ZodObject" || typeName === "object") return "object"
    // unwrap optional / default
    if (def.innerType) { def = def.innerType._def ?? def.innerType; continue }
    if (def.schema) { def = def.schema._def ?? def.schema; continue }
    break
  }
  return "string"
}

function getEnumOptions(fieldDef: Record<string, unknown>): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let def: any = fieldDef
  while (def) {
    if (def.typeName === "ZodEnum" || def.type === "enum") {
      return def.entries ? Object.keys(def.entries) : (def.values ?? [])
    }
    if (def.innerType) { def = def.innerType._def ?? def.innerType; continue }
    if (def.schema) { def = def.schema._def ?? def.schema; continue }
    break
  }
  return []
}

// ── JSON Draft Field ──────────────────────────────
// draft-then-commit pattern (cf. HexInput in palette-editor.tsx):
// only call handleChange on valid JSON blur, show red border + error on parse failure.
function JsonDraftField({
  name,
  value,
  onChange,
}: {
  name: string
  value: unknown
  onChange: (val: unknown) => void
}) {
  const [draft, setDraft] = React.useState<string>(() => JSON.stringify(value, null, 2))
  const [hasParseError, setHasParseError] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Sync from outside when value changes externally (e.g. undo/redo),
  // but skip if the textarea is currently focused to avoid clobbering
  // in-progress edits.
  React.useEffect(() => {
    if (document.activeElement === textareaRef.current) return
    setDraft(JSON.stringify(value, null, 2))
    setHasParseError(false)
  }, [value])

  function commit() {
    try {
      const parsed = JSON.parse(draft)
      setHasParseError(false)
      onChange(parsed)
      // Normalise draft to pretty JSON after successful parse
      setDraft(JSON.stringify(parsed, null, 2))
    } catch {
      setHasParseError(true)
    }
  }

  return (
    <div>
      <FieldLabel name={name} />
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          if (hasParseError) setHasParseError(false)
        }}
        onBlur={commit}
        rows={5}
        className={cn(
          "ff-shape-container w-full px-3 py-2 text-[11px] font-mono resize-y",
          "bg-[#f7f7f5] border",
          hasParseError ? "border-red-500" : "border-[#CCCCCC]",
          "text-[#333333]",
          "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
        )}
      />
      {hasParseError && (
        <p className="text-[11px] text-red-500 mt-1">Geçersiz JSON</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────
export function PropertyEditor() {
  // Scoped selectors — avoids re-renders triggered by unrelated store slices
  const { page, selectedSectionId } = usePageBuilder(
    useShallow((s) => ({ page: s.page, selectedSectionId: s.selectedSectionId }))
  )
  const selectSection = usePageBuilder((s) => s.selectSection)
  const updateSectionProps = usePageBuilder((s) => s.updateSectionProps)

  const updateSectionTransition = usePageBuilder((s) => s.updateSectionTransition)

  const section = page?.sections.find((s) => s.id === selectedSectionId)

  const handleChange = useCallback(
    (fieldName: string, val: unknown) => {
      if (!selectedSectionId) return
      updateSectionProps(selectedSectionId, { [fieldName]: val })
    },
    [selectedSectionId, updateSectionProps]
  )

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <div className="ff-shape-button w-8 h-8 border border-[var(--border)] flex items-center justify-center mb-3">
          <span className="text-[var(--foreground-faint)] text-xs">←</span>
        </div>
        <p className="text-[12px] text-[var(--foreground-faint)]">
          Bir section seçin
        </p>
        <p className="text-[11px] text-[var(--foreground-faint)] mt-1 opacity-70">
          Canvas&apos;tan bir bölüme tıklayın
        </p>
      </div>
    )
  }

  const meta = SECTION_REGISTRY[section.type]
  const schema = SECTION_SCHEMAS[section.type]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape = (schema as any).shape ?? {}
  const props = section.props as Record<string, unknown>

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#CCCCCC] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#ff4fd8]">
            {meta ? <meta.icon size={14} /> : <X size={14} />}
          </span>
          <span className="text-[12px] font-semibold text-[#333333]">
            {meta?.label ?? "Section Yok"}
          </span>
        </div>
        <button
          onClick={() => selectSection(null)}
          className="text-[#666666] hover:text-[#333333] transition-colors"
          aria-label="Kapat"
        >
          <X size={14} />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {Object.entries(shape)
          .filter(([fieldName]) => fieldName !== "hideMobileDock")
          .map(([fieldName, fieldDef]) => {
            const fDef = fieldDef as Record<string, unknown>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const innerDef = (fDef as any)._def ?? fDef
            const currentVal = props[fieldName]

            if (fieldName === "leftText" && section.type === "modern-manifesto") {
              return (
                <ManifestoTextEditor
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  schema={innerDef as { description?: string }}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            const fieldType = inferFieldType(innerDef)

            // Skip complex/array types for now — render them as JSON textarea
            if (fieldType === "array" || fieldType === "object") {
              return (
                <JsonDraftField
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            if (fieldType === "boolean") {
              return (
                <BooleanField
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  schema={innerDef}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            if (fieldType === "select") {
              const options = getEnumOptions(innerDef)
              return (
                <SelectField
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  schema={innerDef}
                  options={options}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            if (fieldType === "number") {
              return (
                <NumberField
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  schema={innerDef}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            // Check for color fields by naming convention
            if (
              fieldName.toLowerCase().includes("color") ||
              fieldName.toLowerCase().includes("colour")
            ) {
              return (
                <ColorField
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  schema={innerDef}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            // Media fields (detect by name)
            if (
              fieldName.toLowerCase().includes("image") ||
              fieldName.toLowerCase().includes("video") ||
              fieldName.toLowerCase().includes("url") ||
              fieldName.toLowerCase().includes("src") ||
              fieldName.toLowerCase().includes("cover") ||
              fieldName.toLowerCase().includes("thumbnail")
            ) {
              // Exceptions that should stay as plain text
              const isPlainLink = fieldName.toLowerCase().includes("link") && !fieldName.toLowerCase().includes("image")

              if (!isPlainLink) {
                return (
                  <MediaField
                    key={fieldName}
                    name={fieldName}
                    value={currentVal}
                    schema={innerDef}
                    sectionType={section.type}
                    sectionProps={props}
                    onChange={(v) => handleChange(fieldName, v)}
                  />
                )
              }
            }

            // Long text fields
            if (
              fieldName === "body" ||
              fieldName === "description" ||
              fieldName === "content" ||
              fieldName === "rightContent" ||
              fieldName.toLowerCase().includes("description")
            ) {
              return (
                <TextareaField
                  key={fieldName}
                  name={fieldName}
                  value={currentVal}
                  schema={innerDef}
                  onChange={(v) => handleChange(fieldName, v)}
                />
              )
            }

            return (
              <TextField
                key={fieldName}
                name={fieldName}
                value={currentVal}
                schema={innerDef}
                onChange={(v) => handleChange(fieldName, v)}
              />
            )
          })}

        {/* Scroll Transition */}
        <div>
          <label className="text-[10px] font-semibold text-[#666666] block mb-1">
            Scroll Geçiş Türü
          </label>
          <FFSelect
            value={section.transition || "normal"}
            onValueChange={(val) => updateSectionTransition(section.id, val as "normal" | "sticky" | "parallax" | "overlap" | "story-scroll")}
            size="sm"
            ariaLabel="scroll-transition-type"
          >
            <FFSelectItem value="normal">Normal</FFSelectItem>
            <FFSelectItem value="sticky">Sticky</FFSelectItem>
            <FFSelectItem value="parallax">Parallax</FFSelectItem>
            <FFSelectItem value="overlap">Overlap</FFSelectItem>
            <FFSelectItem value="story-scroll">Story Scroll</FFSelectItem>
          </FFSelect>
        </div>

        {/* Universal mobile-dock control — available on EVERY section,
            independent of the section's prop schema. Writes props.hideMobileDock
            which the public PageRenderer's IntersectionObserver reads. */}
        <div className="mt-2 pt-4 border-t border-[#CCCCCC]">
          <BooleanField
            name="hideMobileDock"
            value={props.hideMobileDock}
            schema={{}}
            onChange={(v) => handleChange("hideMobileDock", v)}
          />
          <p className="text-[9px] text-[#999999] leading-normal mt-1">
            Açıkken, bu section ekranda görünürken mobil alt navigasyon (dock) gizlenir.
            Hero / tam-ekran alanlar için idealdir.
          </p>
        </div>
      </div>
    </div>
  )
}
