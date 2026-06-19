"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Palette Editor Component
//
// Two-column layout:
//   Left  — color fields (Light / Dark tabs) with react-colorful pickers
//   Right — live miniature site preview (CSS vars injected inline)
//
// Uses @radix-ui/react-popover for color picker popovers.
// Uses @radix-ui/react-tabs for Light / Dark mode tabs.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import * as Tabs from "@radix-ui/react-tabs"
import { HexColorPicker } from "react-colorful"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, LayoutGrid, Square, Hexagon, Scissors, Smartphone, Layers, MoreHorizontal, Trash2, ChevronLeft, RotateCcw, Save, X, Check } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { checkWCAG } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { paletteToStyleObject } from "@/lib/colors/inject-css-vars"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import {
  DEFAULT_THEME_SETTINGS,
  type ColorPalette,
  type ColorTokens,
  type ThemeSettings,
  type HeaderVariant,
  type ShapeVariant,
  type MobileNavbarVariant,
} from "@/lib/colors/types"
import { Minus, Plus } from "@/lib/icons"

const FONT_OPTIONS = [
  "Syne",
  "DM Sans",
  "Inter",
  "Outfit",
  "Plus Jakarta Sans",
  "Montserrat",
  "Playfair Display",
  "Poppins",
  "Roboto",
  "Space Grotesk",
  "Lexend",
  "Manrope"
]

// ── Helpers ───────────────────────────────────────────────

/** Extract a plain #hex from a value that may be hex or rgba */
function toPickerHex(value: string | undefined | null): string {
  if (!value) return "[var(--ff-purple)]"
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value
  // Try to parse rgba — use a neutral fallback if not hex-extractable
  const m = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (m) {
    const r = parseInt(m[1]).toString(16).padStart(2, "0")
    const g = parseInt(m[2]).toString(16).padStart(2, "0")
    const b = parseInt(m[3]).toString(16).padStart(2, "0")
    return `#${r}${g}${b}`
  }
  return "[var(--ff-purple)]"
}

// ── Field descriptor ──────────────────────────────────────

interface FieldDef {
  key: string
  label: string
  hint?: string
  allowRgba?: boolean
}

const LIGHT_FIELDS: FieldDef[] = [
  { key: "primary", label: "Primary (Brand)", hint: "Ana marka rengi" },
  { key: "primaryHover", label: "Primary Hover", hint: "Hover durumu" },
  { key: "primaryMuted", label: "Primary Muted", hint: "rgba değeri önerilir", allowRgba: true },
  { key: "primaryGlow", label: "Primary Glow", hint: "rgba değeri önerilir", allowRgba: true },
  { key: "secondary", label: "Secondary (Charcoal)", hint: "İkincil renk" },
  { key: "secondaryLight", label: "Secondary Light", hint: "Açık ton" },
  { key: "background", label: "Background", hint: "Sayfa arka planı" },
  { key: "backgroundAlt", label: "Background Alt", hint: "Alternatif arka plan" },
  { key: "surface", label: "Surface", hint: "Kart yüzeyi" },
  { key: "surfaceElevated", label: "Surface Elevated", hint: "Yükseltilmiş yüzey" },
  { key: "foreground", label: "Foreground", hint: "Ana metin rengi" },
  { key: "foregroundMuted", label: "Foreground Muted", hint: "İkincil metin" },
  { key: "foregroundFaint", label: "Foreground Faint", hint: "Soluk metin" },
  { key: "border", label: "Border", hint: "Kenarlık rengi" },
  { key: "borderStrong", label: "Border Strong", hint: "Güçlü kenarlık" },
  { key: "success", label: "Success", hint: "Başarı rengi" },
  { key: "warning", label: "Warning", hint: "Uyarı rengi" },
  { key: "error", label: "Error", hint: "Hata rengi" },
]

const DARK_FIELDS: FieldDef[] = [
  { key: "secondary", label: "Dark Secondary (Charcoal)", hint: "Koyu modda ikincil renk — boş bırakılırsa açık ton kullanılır" },
  { key: "secondaryLight", label: "Dark Secondary Light", hint: "Koyu modda açık ton" },
  { key: "background", label: "Dark Background" },
  { key: "backgroundAlt", label: "Dark Background Alt" },
  { key: "surface", label: "Dark Surface" },
  { key: "surfaceElevated", label: "Dark Surface Elevated" },
  { key: "foreground", label: "Dark Foreground" },
  { key: "foregroundMuted", label: "Dark Foreground Muted" },
  { key: "foregroundFaint", label: "Dark Foreground Faint" },
  { key: "border", label: "Dark Border" },
  { key: "borderStrong", label: "Dark Border Strong" },
]

// ── Color field row ───────────────────────────────────────

interface ColorFieldProps {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  allowRgba?: boolean
}

function ColorField({ label, hint, value, onChange, allowRgba }: ColorFieldProps) {
  const [inputVal, setInputVal] = React.useState(value)

  // Keep local input in sync when parent resets
  // eslint-disable-next-line react-hooks/set-state-in-effect -- prop sync — refactor pending design review
  React.useEffect(() => { setInputVal(value) }, [value])

  function commitInput(raw: string) {
    const trimmed = raw.trim()
    const hexOk = /^#[0-9a-fA-F]{6}$/.test(trimmed)
    const rgbaOk = allowRgba && /^rgba?\(/.test(trimmed)
    if (hexOk || rgbaOk) {
      onChange(trimmed)
    }
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#E0E0E0] last:border-b-0">
      {/* Swatch + Picker popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label={`${label} rengini seç`}
            className="ff-shape-button w-9 h-9 flex-shrink-0 border-2 border-[#E0E0E0] hover:border-[#FF4FD8] transition-colors"
            style={{ backgroundColor: value }}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="right"
            align="start"
            sideOffset={8}
            className="z-50 bg-[#F7F7F5] border border-[#E0E0E0] p-3 shadow-xl"
          >
            <HexColorPicker
              color={toPickerHex(value)}
              onChange={(hex) => {
                onChange(hex)
                setInputVal(hex)
              }}
            />
            <Popover.Arrow className="fill-[#E0E0E0]" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Label + hex input */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-[#666666] truncate">
            {label}
          </label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput((e.target as HTMLInputElement).value)
            }}
            className={cn(
              "ff-shape-container w-36 text-[12px] font-mono bg-[#F7F7F5]] border border-[#E0E0E0] focus:border-[#FF4FD8] focus:shadow-[0_0_5px_rgba(255,79,216,0.5)]",
              "px-2 py-1 outline-none text-[#666666]",
              "focus:border-[#FF4FD8] focus:shadow-[0_0_5px_rgba(255,79,216,0.5)]"
            )}
            spellCheck={false}
          />
        </div>
        {hint && (
          <p className="text-[10px] text-[#666666] mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  )
}

// ── Live preview ──────────────────────────────────────────

function LivePreview({
  colors,
  settings,
  fonts,
}: {
  colors: ColorTokens
  settings: ThemeSettings
  fonts: { display: string; body: string }
}) {
  const styleVars = paletteToStyleObject(colors, settings, fonts)

  // Inject Google Fonts via a stable <link> element — only updates when
  // the font names actually change, not on every parent re-render.
  const linkRef = React.useRef<HTMLLinkElement | null>(null)
  React.useEffect(() => {
    const href = `https://fonts.googleapis.com/css2?family=${fonts.display.replace(/\s+/g, "+")}:wght@400;700&family=${fonts.body.replace(/\s+/g, "+")}:wght@400;600&display=swap`
    if (!linkRef.current) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.id = "ff-palette-preview-fonts"
      link.href = href
      document.head.appendChild(link)
      linkRef.current = link
    } else {
      linkRef.current.href = href
    }
    return () => {
      // Only remove on full unmount, not on every font change — avoids
      // a flash when the user switches between font options.
    }
  }, [fonts.display, fonts.body])

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => {
      linkRef.current?.remove()
      linkRef.current = null
    }
  }, [])

  return (
    <div
      className="ff-shape-container border border-[#E0E0E0] overflow-hidden"
      style={styleVars as React.CSSProperties}
    >
      {/* Mini navbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          backgroundColor: "var(--ff-charcoal)",
          borderColor: "var(--border)",
        }}
      >
        <span
          className="text-[11px] font-bold"
          style={{ color: "var(--ff-purple)" }}
        >
          FlixFlex
        </span>
        <div className="flex gap-3">
          {["Anasayfa", "Blog", "İletişim"].map((item) => (
            <span
              key={item}
              className="text-[10px]"
              style={{ color: "#FFFFFF99" }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Hero strip */}
      <div
        className="px-4 py-5 text-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <p
          className="text-[13px] font-bold mb-2"
          style={{ color: "#0d0d0d", fontFamily: "var(--font-display)" }}
        >
          Dijital Reklamda Yeni Dönem
        </p>
        <p
          className="text-[10px] mb-3"
          style={{ color: "var(--foreground-muted)", fontFamily: "var(--font-body)" }}
        >
          Hız, güç ve esneklik bir arada.
        </p>
        <button
          type="button"
          className="ff-shape-button text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 border"
          style={{
            backgroundColor: "var(--ff-purple)",
            borderColor: "var(--ff-purple)",
            color: "#fff",
          }}
        >
          Başlayın
        </button>
      </div>

      {/* Card row */}
      <div
        className="px-4 py-4 grid grid-cols-2 gap-3"
        style={{ backgroundColor: "var(--background-alt)" }}
      >
        {["Kart A", "Kart B"].map((title) => (
          <div
            key={title}
            className="ff-shape-container p-3 border"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-[11px] font-bold mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {title}
            </p>
            <p
              className="text-[9px]"
              style={{ color: "var(--foreground-muted)" }}
            >
              İçerik metni örneği buraya gelir.
            </p>
          </div>
        ))}
      </div>

      {/* Status badges */}
      <div
        className="px-4 py-2 flex gap-2 border-t"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {[
          { label: "Başarılı", color: "var(--success)" },
          { label: "Uyarı", color: "var(--warning)" },
          { label: "Hata", color: "var(--error)" },
        ].map(({ label, color }) => (
          <span
            key={label}
            className="ff-shape-container text-[9px] px-2 py-0.5 font-semibold uppercase tracking-wider border"
            style={{ color, borderColor: color, backgroundColor: `${color}20` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── WCAG checker panel ────────────────────────────────────

function WcagPanel({ colors }: { colors: ColorTokens }) {
  const combos = [
    { label: "Primary / Background", fg: colors.primary, bg: colors.background },
    { label: "Foreground / Background", fg: colors.foreground, bg: colors.background },
    { label: "Primary / Dark BG", fg: colors.primary, bg: colors.dark.background },
    { label: "Foreground / Surface", fg: colors.foreground, bg: colors.surface },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--foreground-faint)]">
        WCAG Kontrast Kontrolü
      </p>
      {combos.map(({ label, fg, bg }) => {
        const result = checkWCAG(fg, bg)
        return (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--foreground-muted)] truncate">
              {label}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {result.aaa ? (
                <FFBadge variant="success">AAA {result.ratio}:1</FFBadge>
              ) : result.aa ? (
                <FFBadge variant="warning">AA {result.ratio}:1</FFBadge>
              ) : (
                <FFBadge variant="error">Fail {result.ratio}:1</FFBadge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Component-level theme pickers (Bileşenler & Mobil tabs)
// ═══════════════════════════════════════════════════════════

interface VariantTileProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  hint?: string
  preview?: React.ReactNode
}

function VariantTile({ active, onClick, icon, title, hint, preview }: VariantTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "ff-shape-container group relative flex flex-col gap-3 p-4 text-left",
        "border transition-all duration-200",
        active
          ? "border-[#ff4fd8]/40 bg-[rgba(255,79,216,0.1)] shadow-[0_0_0_3px_rgba(255,79,216,0.3)]"
          : "border-[#CCCCCC] hover:border-[#ff4fd8]/40 hover:bg-[rgba(255,79,216,0.1)]",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "ff-shape-container w-7 h-7 flex items-center justify-center",
            "transition-colors duration-200",
            active
              ? "bg-[#ff4fd8] text-white"
              : "bg-[#F0F0F0] text-[#0d0d0d] group-hover:bg-[#ff4fd8] group-hover:text-white"
          )}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-display text-sm font-bold leading-tight",
              active ? "text-[#ff4fd8]" : "text-[#0d0d0d]"
            )}
          >
            {title}
          </p>
          {hint && (
            <p className="text-[10px] text-[#010000] leading-tight mt-0.5">
              {hint}
            </p>
          )}
        </div>
      </div>
      {preview && (
        <div className="border-t border-[#CCCCCC] pt-3 mt-1">{preview}</div>
      )}
    </button>
  )
}

// ── Header variant picker ──────────────────────────
function HeaderVariantPicker({
  value,
  onChange,
}: {
  value: HeaderVariant
  onChange: (v: HeaderVariant) => void
}) {
  return (
    <section>
      <header className="mb-3">
        <p className="text-[10px] font-semibold text-[#010000] mb-1">
          Header Tasarımı
        </p>
        <p className="text-[12px] text-[var(--foreground-muted)] leading-relaxed">
          Sitenin üst gezinme barı. Klasik düzen yatay menü içerir; hamburger düzeni
          sadece bir menü butonu gösterir ve tıklayınca tam ekran overlay açar.
        </p>
      </header>
      <div className="grid sm:grid-cols-2 gap-3">
        <VariantTile
          active={value === "classic"}
          onClick={() => onChange("classic")}
          icon={<LayoutGrid size={14} />}
          title="Klasik"
          hint="Logo · Yatay nav · CTA"
          preview={
            <div className="flex items-center justify-between gap-1">
              <span className="w-6 h-3 bg-[#ff4fd8]" />
              <div className="flex-1 flex gap-1.5 justify-center">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="h-1 w-4 bg-[#888888]" />
                ))}
              </div>
              <span className="h-3 w-10 bg-[#888888]" />
            </div>
          }
        />
        <VariantTile
          active={value === "hamburger"}
          onClick={() => onChange("hamburger")}
          icon={<Menu size={14} />}
          title="Hamburger"
          hint="Logo · Menü → Tam ekran overlay"
          preview={
            <div className="flex items-center justify-between gap-2">
              <span className="w-6 h-3 bg-[#ff4fd8]" />
              <span className="flex items-center gap-1.5 px-2 py-1 border border-[#888888]">
                <span className="text-[8px] text-[#888888] font-bold">
                  Menü
                </span>
                <Menu size={9} className="text-[#888888]" />
              </span>
            </div>
          }
        />
      </div>
    </section>
  )
}

// ── Shape variant picker (button or container) ─────
const SHAPE_OPTIONS: {
  value: ShapeVariant
  label: string
  hint: string
  icon: React.ComponentType<{ size?: number }>
  /** Tailwind-ready border-radius / clip-path preview */
  previewStyle: React.CSSProperties
}[] = [
    {
      value: "sharp",
      label: "Keskin",
      hint: "border-radius: 0",
      icon: Square,
      previewStyle: { borderRadius: "0" },
    },
    {
      value: "rounded",
      label: "Yuvarlatılmış",
      hint: "border-radius: 12px",
      icon: MoreHorizontal,
      previewStyle: { borderRadius: "12px" },
    },
    {
      value: "hex",
      label: "Hexagonal",
      hint: "polygon hex clip-path",
      icon: Hexagon,
      previewStyle: {
        clipPath: "polygon(14% 0%, 86% 0%, 100% 50%, 86% 100%, 14% 100%, 0% 50%)",
      },
    },
    {
      value: "bevel",
      label: "Altıgen Bevel",
      hint: "kesik köşeler · sci-fi",
      icon: Scissors,
      previewStyle: {
        clipPath:
          "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
      },
    },
  ]

function ShapeVariantPicker({
  title,
  description,
  value,
  onChange,
}: {
  title: string
  description: string
  value: ShapeVariant
  onChange: (v: ShapeVariant) => void
}) {
  return (
    <section>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--foreground-faint)] mb-1">
          {title}
        </p>
        <p className="text-[12px] text-[var(--foreground-muted)] leading-relaxed">
          {description}
        </p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SHAPE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          return (
            <VariantTile
              key={opt.value}
              active={value === opt.value}
              onClick={() => onChange(opt.value)}
              icon={<Icon size={14} />}
              title={opt.label}
              hint={opt.hint}
              preview={
                <span
                  className="block h-7 bg-[#ff4fd8]/10 border border-[#ff4fd8] mx-auto"
                  style={opt.previewStyle}
                />
              }
            />
          )
        })}
      </div>
    </section>
  )
}

// ── Radius slider ──────────────────────────────────
// Controls the corner radius (px) used by the "rounded" shape variant.
function RadiusSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="ff-card bg-[#f7f7f5] border border-[#E0E0E0] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-[#333333]">{label}</label>
        <span className="text-[12px] font-mono font-bold text-[var(--ff-purple)]">{value}px</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="ff-shape-button w-8 h-8 flex items-center justify-center bg-[#ff4fd8] text-white border border-[#E0E0E0] hover:bg-[#dc2db6]"
        >
          <Minus size={14} />
        </button>
        <input
          type="range"
          min={0}
          max={48}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 accent-[var(--ff-purple)]"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(48, value + 1))}
          className="ff-shape-button w-8 h-8 flex items-center justify-center bg-[#ff4fd8] text-white border border-[#E0E0E0] hover:bg-[#dc2db6]"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Mobile navbar picker ───────────────────────────
function MobileNavbarPicker({
  enabled,
  variant,
  onToggle,
  onVariantChange,
}: {
  enabled: boolean
  variant: MobileNavbarVariant
  onToggle: (v: boolean) => void
  onVariantChange: (v: MobileNavbarVariant) => void
}) {
  return (
    <section>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--foreground-faint)] mb-1">
          Mobil Alt Navbar
        </p>
        <p className="text-[12px] text-[var(--foreground-muted)] leading-relaxed">
          Mobil cihazlarda ekranın alt kısmında sabit kalan, ana sayfalar arası
          hızlı geçiş sağlayan modern navbar. Açık olduğunda ziyaretçilere kolay
          gezinme deneyimi sunar.
        </p>
      </header>

      {/* On / Off toggle */}
      <div className="ff-shape-container flex items-center justify-between gap-3 px-4 py-3 border border-[#CCCCCC] mb-4">
        <div className="flex items-center gap-2.5">
          <Smartphone size={16} className="text-[#ff4fd8]" />
          <div>
            <p className="text-[13px] font-semibold text-[#0d0d0d]">
              Alt Navbar
            </p>
            <p className="text-[10px] text-[#010000]">
              {enabled ? "Açık" : "Kapalı"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200",
            "border",
            enabled
              ? "bg-[#ff4fd8]/80 border-[#ff4fd8]"
              : "bg-[#F0F0F0] border-[#CCCCCC]"
          )}
        >
          <span
            className={cn(
              "absolute top-0.25 left-0.25 w-5 h-5 rounded-full bg-[#f7f7f5] transition-transform duration-200",
              enabled && "translate-x-[20px]"
            )}
          />
        </button>
      </div>

      {/* Variant picker (only meaningful when enabled) */}
      <div
        className={cn(
          "transition-opacity duration-200",
          enabled ? "opacity-100" : "opacity-40 pointer-events-none"
        )}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <VariantTile
            active={variant === "dock"}
            onClick={() => onVariantChange("dock")}
            icon={<Layers size={14} />}
            title="Dock"
            hint="İkon + Etiket · 5 öğe"
            preview={
              <div className="flex justify-between gap-2 px-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "w-5 h-5",
                        i === 1
                          ? "bg-[#ff4fd8]"
                          : "bg-[#888888]"
                      )}
                    />
                    <span
                      className={cn(
                        "h-1 w-4",
                        i === 1
                          ? "bg-[#ff4fd8]"
                          : "bg-[#888888]"
                      )}
                    />
                  </div>
                ))}
              </div>
            }
          />
          <VariantTile
            active={variant === "minimal"}
            onClick={() => onVariantChange("minimal")}
            icon={<MoreHorizontal size={14} />}
            title="Minimal"
            hint="Sadece ikon · slim"
            preview={
              <div className="flex justify-between gap-3 px-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i === 1 ? "bg-[#ff4fd8]" : "bg-[#888888]"
                    )}
                  />
                ))}
              </div>
            }
          />
        </div>
      </div>
    </section>
  )
}

// ── Main Editor Component ─────────────────────────────────

interface PaletteEditorProps {
  initial: ColorPalette
}

export function PaletteEditor({ initial }: PaletteEditorProps) {
  const router = useRouter()
  const [customFonts, setCustomFonts] = React.useState<{ id: string, name: string, url: string }[]>([])
  const [uploadingFont, setUploadingFont] = React.useState(false)
  const [newFontFile, setNewFontFile] = React.useState<File | null>(null)
  const [newFontName, setNewFontName] = React.useState("")

  const [colors, setColors] = React.useState<ColorTokens>(initial.colors)
  const [settings, setSettings] = React.useState<ThemeSettings>(
    initial.settings ?? DEFAULT_THEME_SETTINGS
  )
  const [name, setName] = React.useState(initial.name)
  const [description, setDescription] = React.useState(
    initial.description ?? ""
  )
  const [fontDisplay, setFontDisplay] = React.useState(initial.fontDisplay || "Syne")
  const [fontBody, setFontBody] = React.useState(initial.fontBody || "DM Sans")
  const [saving, setSaving] = React.useState(false)
  const [activating, setActivating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // ── Fetch Custom Fonts ─────────────────────────
  const fetchCustomFonts = React.useCallback(async () => {
    try {
      const res = await fetch("/api/media/fonts")
      const data = await res.json()
      if (data.fonts) setCustomFonts(data.fonts)
    } catch (err) {
      console.error("Fontlar yüklenemedi", err)
    }
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate data fetch on mount
    fetchCustomFonts()
  }, [fetchCustomFonts])

  // ── Handle Font Upload ────────────────────────
  async function handleFontUpload() {
    if (!newFontFile || !newFontName) return
    setUploadingFont(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", newFontFile)
      formData.append("name", newFontName)

      const res = await fetch("/api/media/fonts", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Font yükleme hatası")
        return
      }

      setNewFontFile(null)
      setNewFontName("")
      fetchCustomFonts()
    } catch {
      setError("Font yüklenemedi")
    } finally {
      setUploadingFont(false)
    }
  }

  async function handleDeleteFont(id: string) {
    if (!confirm("Bu fontu silmek istediğinize emin misiniz?")) return
    try {
      await fetch("/api/media/fonts", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      })
      fetchCustomFonts()
    } catch (err) {
      console.error("Font silinemedi", err)
    }
  }

  const allFontOptions = React.useMemo(() => {
    const custom = customFonts.map(f => f.name)
    return [...new Set([...FONT_OPTIONS, ...custom])].sort()
  }, [customFonts])

  // Dirty tracking — memoised to avoid JSON.stringify on every render
  const initialSettings = initial.settings ?? DEFAULT_THEME_SETTINGS
  const isDirty = React.useMemo(
    () =>
      name !== initial.name ||
      description !== (initial.description ?? "") ||
      JSON.stringify(colors) !== JSON.stringify(initial.colors) ||
      JSON.stringify(settings) !== JSON.stringify(initialSettings) ||
      fontDisplay !== (initial.fontDisplay ?? "Syne") ||
      fontBody !== (initial.fontBody ?? "DM Sans"),
    [
      name,
      description,
      colors,
      settings,
      fontDisplay,
      fontBody,
      initial.name,
      initial.description,
      initial.colors,
      initial.fontDisplay,
      initial.fontBody,
      initialSettings,
    ]
  )

  // ── Helpers ────────────────────────────────────
  function setLightColor(key: string, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  function setDarkColor(key: string, value: string) {
    setColors((prev) => ({
      ...prev,
      dark: { ...prev.dark, [key]: value },
    }))
  }

  function patchSettings(patch: Partial<ThemeSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  // ── Save ───────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/palettes/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          colors,
          settings,
          fontDisplay,
          fontBody,
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Kaydetme hatası")
        return
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  // ── Activate ───────────────────────────────────
  async function handleActivate() {
    setActivating(true)
    setError(null)
    try {
      const res = await fetch(`/api/palettes/${initial.id}/activate`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Aktivasyon hatası")
        return
      }
      router.refresh()
    } finally {
      setActivating(false)
    }
  }

  // ── Reset ──────────────────────────────────────
  function handleCancel() {
    setColors(initial.colors)
    setSettings(initial.settings ?? DEFAULT_THEME_SETTINGS)
    setName(initial.name)
    setDescription(initial.description ?? "")
    setFontDisplay(initial.fontDisplay || "Syne")
    setFontBody(initial.fontBody || "DM Sans")
    setError(null)
  }

  function handleResetToSystemDefault() {
    const builtIn = DEFAULT_PALETTES.find(p => p.id === initial.id)
    if (!builtIn) {
      alert("Bu tema için sistem varsayılanı bulunamadı.")
      return
    }

    if (!confirm("Tüm ayarları sistem varsayılan değerlerine döndürmek istediğinizden emin misiniz? Bu işlem kaydedilmemiş tüm değişikliklerinizi siler.")) {
      return
    }

    setColors(builtIn.colors)
    setSettings(builtIn.settings ?? DEFAULT_THEME_SETTINGS)
    setFontDisplay(builtIn.fontDisplay || "Syne")
    setFontBody(builtIn.fontBody || "DM Sans")
    setName(builtIn.name)
    setDescription(builtIn.description || "")
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/theme"
            className="inline-flex items-center gap-1 text-[12px] text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <ChevronLeft size={13} />
            Temalar&apos;a Geri Dön
          </Link>
          <h1 className="font-display text-2xl font-bold text-[#0D0D0D] mt-1">
            {initial.name}
          </h1>
        </div>
        {initial.isActive && (
          <FFBadge variant="success" dot>
            Aktif Tema
          </FFBadge>
        )}
      </div>

      {/* Name + description */}
      <div className="ff-card bg-[#F7F7F5] border border-[#E0E0E0] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-[#666666]">
            Tema Düzeni Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={initial.isSystem}
            className={cn(
              "ff-shape-button ff-input font-bold bg-[#f7f7f5] border border-[#E0E0E0] text-[#666666] text-sm",
              initial.isSystem && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[#666666]">
            Açıklama
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kısa bir açıklama..."
            className="ff-shape-button ff-input font-bold bg-[#f7f7f5] border border-[#E0E0E0] text-[#666666] text-sm"
          />
        </div>
      </div>

      {/* Two-column editor layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left — color fields */}
        <div className="ff-card bg-[#F7F7F5] border border-[#E0E0E0] space-y-0">
          <Tabs.Root defaultValue="light">
            <Tabs.List className="flex border-b border-[#E0E0E0] mb-4 flex-wrap">
              {[
                { value: "light", label: "Aydınlık Renkler" },
                { value: "dark", label: "Karanlık Renkler" },
                { value: "fonts", label: "Yazı Tipleri" },
                { value: "components", label: "Bileşenler" },
                { value: "mobile", label: "Mobil" },
              ].map((tab) => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "px-5 py-2.5 text-[11px] font-semibold",
                    "border-b-2 border-transparent -mb-px transition-colors",
                    "text-[#666666] hover:text-[#0D0D0D]",
                    "data-[state=active]:border-[#ff4fd8] data-[state=active]:text-[#ff4fd8]"
                  )}
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="light" className="space-y-0">
              {LIGHT_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  allowRgba={field.allowRgba}
                  value={colors[field.key as keyof ColorTokens] as string}
                  onChange={(v) => setLightColor(field.key, v)}
                />
              ))}
            </Tabs.Content>

            <Tabs.Content value="dark" className="space-y-0">
              {DARK_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  value={
                    // Dark secondary may be unset on legacy palettes — fall
                    // back to the light value so the picker shows a sensible start.
                    (colors.dark[field.key as keyof ColorTokens["dark"]] as string | undefined) ??
                    (colors[field.key as keyof ColorTokens] as string)
                  }
                  onChange={(v) => setDarkColor(field.key, v)}
                />
              ))}
            </Tabs.Content>

            <Tabs.Content value="fonts" className="space-y-8">
              <section>
                <header className="mb-4">
                  <p className="text-[10px] font-semibold text-[#666666] mb-1">
                    Yazı Tipi Aileleri
                  </p>
                  <p className="text-[12px] text-[#666666]">
                    Başlıklar ve gövde metni için Google Fonts kütüphanesinden seçim yapın.
                  </p>
                </header>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#666666]">Başlık Fontu (Display)</label>
                    <select
                      value={fontDisplay}
                      onChange={(e) => setFontDisplay(e.target.value)}
                      className="ff-shape-button w-full h-10 px-3 bg-[#f7f7f5] border border-[#E0E0E0] text-[#666666] text-sm outline-none focus:border-[#8B1FE8]"
                    >
                      {allFontOptions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#666666]">Gövde Fontu (Body)</label>
                    <select
                      value={fontBody}
                      onChange={(e) => setFontBody(e.target.value)}
                      className="ff-shape-button w-full h-10 px-3 bg-[#f7f7f5] border border-[#E0E0E0] text-[#666666] text-sm outline-none focus:border-[#8B1FE8]"
                    >
                      {allFontOptions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="border-t border-[#E0E0E0] pt-8">
                <header className="mb-4">
                  <p className="text-[10px] font-semibold text-[#666666] mb-1">
                    Özel Font Yükle (.TTF)
                  </p>
                  <p className="text-[12px] text-[#666666]">
                    Kendi kurumsal fontlarınızı sisteme ekleyin.
                  </p>
                </header>

                <div className="ff-shape-container bg-[#f7f7f5] p-6 border border-[#E0E0E0] space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#666666]">Font Ailesi Adı</label>
                      <input
                        type="text"
                        placeholder="Örn: FlixFlex Sans"
                        value={newFontName}
                        onChange={(e) => setNewFontName(e.target.value)}
                        className="ff-shape-button w-full px-3 py-2 bg-[#f7f7f5] border border-[#E0E0E0] text-[#666666] text-sm outline-none focus:border-[#8B1FE8]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#666666]">.TTF Dosyası</label>
                      <input
                        type="file"
                        accept=".ttf"
                        onChange={(e) => setNewFontFile(e.target.files?.[0] || null)}
                        className="ff-shape-button border border-[#E0E0E0] w-full text-xs text-[#666666] file:mr-4 file:py-2 file:px-4 file:ff-shape-button file:border-0 file:text-xs file:font-semibold file:bg-[#ff4fd8] file:text-white hover:file:bg-[#ff4fd8]/90 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFontUpload}
                    disabled={uploadingFont || !newFontFile || !newFontName}
                    className="ff-shape-button px-6 py-2.5 bg-[#ff4fd8] text-white text-[11px] font-bold disabled:opacity-40"
                  >
                    {uploadingFont ? "Yükleniyor..." : "Fontu Sisteme Ekle"}
                  </button>
                </div>

                {customFonts.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-[10px] font-bold text-[#666666]">Yüklenen Fontlar</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {customFonts.map(f => (
                        <div key={f.id} className="ff-shape-container flex items-center justify-between p-3 bg-[#f7f7f5] border border-[#E0E0E0] group">
                          <div>
                            <p className="text-[12px] font-bold text-[#666666]">{f.name}</p>
                            <p className="text-[10px] text-[#666666] font-mono">.ttf</p>
                          </div>
                          <button
                            onClick={() => handleDeleteFont(f.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/10 transition-all"
                            title="Fontu Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section>
                <header className="mb-4">
                  <p className="text-[10px] font-semibold text-[#666666] mb-1">
                    Yazı Boyutları
                  </p>
                  <p className="text-[12px] text-[#666666]">
                    Sitenin temel tipografi ölçeğini ayarlayın.
                  </p>
                </header>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#666666]">Başlık Ölçeği</label>
                      <span className="text-[12px] font-mono font-bold text-[var(--ff-purple)]">{settings.fontHeadingSize}px</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => patchSettings({ fontHeadingSize: Math.max(12, settings.fontHeadingSize - 1) })} className="ff-shape-button w-8 h-8 flex items-center justify-center bg-[#ff4fd8] border border-[#E0E0E0] hover:bg-[#dc2db6]"><Minus size={14} /></button>
                      <input
                        type="range" min="12" max="120"
                        value={settings.fontHeadingSize}
                        onChange={(e) => patchSettings({ fontHeadingSize: parseInt(e.target.value) })}
                        className="flex-1 bg-[#f7f7f5] accent-[var(--ff-purple)]"
                      />
                      <button onClick={() => patchSettings({ fontHeadingSize: Math.min(120, settings.fontHeadingSize + 1) })} className="ff-shape-button w-8 h-8 flex items-center justify-center bg-[#ff4fd8] border border-[#E0E0E0] hover:bg-[#dc2db6]"><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#666666]">Gövde Boyutu</label>
                      <span className="text-[12px] font-mono font-bold text-[var(--ff-purple)]">{settings.fontBodySize}px</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => patchSettings({ fontBodySize: Math.max(8, settings.fontBodySize - 1) })} className="ff-shape-button w-8 h-8 flex items-center justify-center bg-[#ff4fd8] border border-[#E0E0E0] hover:bg-[#dc2db6]"><Minus size={14} /></button>
                      <input
                        type="range" min="8" max="32"
                        value={settings.fontBodySize}
                        onChange={(e) => patchSettings({ fontBodySize: parseInt(e.target.value) })}
                        className="flex-1 accent-[var(--ff-purple)]"
                      />
                      <button onClick={() => patchSettings({ fontBodySize: Math.min(32, settings.fontBodySize + 1) })} className="ff-shape-button w-8 h-8 flex items-center justify-center bg-[#ff4fd8] border border-[#E0E0E0] hover:bg-[#dc2db6]"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              </section>
            </Tabs.Content>

            <Tabs.Content value="components" className="space-y-6">
              <HeaderVariantPicker
                value={settings.headerVariant}
                onChange={(v) => patchSettings({ headerVariant: v })}
              />
              <ShapeVariantPicker
                title="Buton Köşeleri"
                description="Sitedeki tüm butonlar bu şekli alır."
                value={settings.buttonShape}
                onChange={(v) => patchSettings({ buttonShape: v })}
              />
              {settings.buttonShape === "rounded" && (
                <RadiusSlider
                  label="Buton Yuvarlaklığı (radius)"
                  value={settings.buttonRadius ?? 12}
                  onChange={(v) => patchSettings({ buttonRadius: v })}
                />
              )}
              <ShapeVariantPicker
                title="Konteyner Köşeleri"
                description="Kartlar, paneller, section bloklarına uygulanır."
                value={settings.containerShape}
                onChange={(v) => patchSettings({ containerShape: v })}
              />
              {settings.containerShape === "rounded" && (
                <RadiusSlider
                  label="Konteyner Yuvarlaklığı (radius)"
                  value={settings.containerRadius ?? 16}
                  onChange={(v) => patchSettings({ containerRadius: v })}
                />
              )}
            </Tabs.Content>

            <Tabs.Content value="mobile" className="space-y-6">
              <MobileNavbarPicker
                enabled={settings.mobileNavbar}
                variant={settings.mobileNavbarVariant}
                onToggle={(v) => patchSettings({ mobileNavbar: v })}
                onVariantChange={(v) =>
                  patchSettings({ mobileNavbarVariant: v })
                }
              />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* Right — live preview + WCAG */}
        <div className="space-y-4 xl:sticky xl:top-6">
          <div className="ff-card bg-[#f7f7f5] border border-[#E0E0E0] space-y-4">
            <p className="text-[10px] font-semibold text-[#666666]">
              Canlı Önizleme
            </p>
            <LivePreview
              colors={colors}
              settings={settings}
              fonts={{ display: fontDisplay, body: fontBody }}
            />
          </div>

          <div className="ff-card bg-[#f7f7f5] border border-[#E0E0E0]">
            <WcagPanel colors={colors} />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="ff-shape-container bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Sticky save bar */}
      <div
        className={cn(
          "ff-shape-container sticky bottom-2 z-10 flex items-center justify-center w-full gap-3 py-4 px-6 transition-all",
          "bg-[#f7f7f5]/60 backdrop-blur-sm border border-[#E0E0E0]/50  ",
          isDirty && "border-[#E0E0E0] shadow-[0_-4px_20px_rgba(255, 79, 216,0.1)]",
        )}
      >
        {isDirty && (
          <span className="text-[11px] text-[#666666] font-semibold">
            Kaydedilmemiş değişiklikler var.
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || saving}
            className="ff-btn ff-btn-ghost h-9 bg-[var(--error)]/10 text-[12px] border border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/20 group hover:scale-98"
          >
            <X size={14} className="mr-1" />
            İptal Et
          </button>

          {initial.isSystem && (
            <button
              type="button"
              onClick={handleResetToSystemDefault}
              disabled={saving}
              className="ff-btn ff-btn-ghost h-9 bg-[var(--warning)]/10 text-[12px] border border-[var(--warning)]/30 text-[var(--warning)] hover:bg-[var(--warning)]/20 group hover:scale-98"
              title="Sistem varsayılan ayarlarına dön"
            >
              <RotateCcw size={14} className="mr-1" />
              Varsayılana Sıfırla
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(
              "ff-btn ff-btn-primary h-9 bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/30 group hover:scale-98 text-[12px] disabled:opacity-40",
              isDirty && "shadow-[var(--success),0.4)]"
            )}
          >
            <Save size={14} className="mr-1" />
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
          {!initial.isActive && (
            <button
              type="button"
              onClick={handleActivate}
              disabled={activating}
              className="ff-btn ff-btn-outline h-9 bg-[var(--approve)]/10 text-[var(--approve)] border border-[var(--approve)]/30 text-[12px] disabled:opacity-40"
            >
              <Check size={14} className="mr-1" />  
              {activating ? "..." : "Aktif Et"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
