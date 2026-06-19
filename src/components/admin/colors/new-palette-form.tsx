"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — New Palette Form (Client)
// POST /api/palettes → redirect to /admin/theme/{id}
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DEFAULT_PALETTES } from "@/lib/colors/defaults"
import {
  FFSelect,
  FFSelectItem,
  FFSelectGroup,
  FFSelectLabel,
  FFSelectSeparator,
} from "@/components/ui/ff-select"
import type { ColorPalette } from "@/lib/colors/types"

interface NewPaletteFormProps {
  existingPalettes: ColorPalette[]
}

export function NewPaletteForm({ existingPalettes }: NewPaletteFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [copyFrom, setCopyFrom] = React.useState<string>("blank")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Combine passed palettes with defaults (deduplicated by id)
  const allPalettes = React.useMemo<ColorPalette[]>(() => {
    const map = new Map<string, ColorPalette>()
    for (const p of DEFAULT_PALETTES) map.set(p.id, p)
    for (const p of existingPalettes) map.set(p.id, p)
    return Array.from(map.values())
  }, [existingPalettes])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Tema Düzeni adı zorunludur.")
      return
    }

    // Resolve base colors
    const base =
      copyFrom === "blank"
        ? DEFAULT_PALETTES[0].colors  // FlixFlex Default as structural template
        : allPalettes.find((p) => p.id === copyFrom)?.colors ??
        DEFAULT_PALETTES[0].colors

    setSubmitting(true)
    try {
      const res = await fetch("/api/palettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          colors: base,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Bir hata oluştu")
        return
      }

      const data = await res.json() as { palette: { id: string } }
      router.push(`/admin/theme/${data.palette.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ff-card max-w-xl bg-[#f7f7f5] border border-[#E0E0E0] space-y-6"
      noValidate
    >
      {/* Palette name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="palette-name"
          className="text-[11px] font-semibold text-[#888888]"
        >
          Tema Düzeni Adı <span className="text-red-500">*</span>
        </label>
        <input
          id="palette-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: Bahar Teması"
          className="ff-input h-10 bg-white border-[#ccc] focus:ring-2 focus:ring-[#ff4fd8] focus:border-transparent text-[#0d0d0d]" 
          maxLength={64}
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="palette-desc"
          className="text-[11px] font-semibold text-[#888888]"
        >
          Açıklama
        </label>
        <input
          id="palette-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kısa bir açıklama (opsiyonel)"
          className="ff-input h-10 bg-[#FFFFFF] border border-[#CCCCCC] focus:ring-2 focus:ring-[#ff4fd8] focus:border-transparent text-[#0d0d0d]"
          maxLength={256}
        />
      </div>

      {/* Copy from */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="palette-copy"
          className="text-[11px] font-semibold text-[#888888]"
        >
          Başlangıç Teması
        </label>
        <FFSelect
          id="palette-copy"
          value={copyFrom}
          onValueChange={setCopyFrom}
          ariaLabel="Başlangıç teması"
        >
          <FFSelectItem value="blank" hint="FlixFlex Default'tan başla">
            Boş başla
          </FFSelectItem>
          <FFSelectSeparator />
          <FFSelectGroup>
            <FFSelectLabel>Mevcut temalardan kopyala</FFSelectLabel>
            {allPalettes.map((p) => (
              <FFSelectItem
                key={p.id}
                value={p.id}
                hint={p.isActive ? "Aktif Tema" : undefined}
              >
                {p.name}
              </FFSelectItem>
            ))}
          </FFSelectGroup>
        </FFSelect>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 px-4 py-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#E0E0E0]">
        <Link
          href="/admin/theme"
          className="ff-btn ff-btn-ghost h-9 bg-[#f7f7f5] border border-[#E0E0E0] text-[#0d0d0d] hover:bg-red-500 hover:text-white text-[12px]"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="ff-btn ff-btn-primary h-9 bg-[#ff4fd8]/10 border border-[#ff4fd8]/40 text-[#ff4fd8] hover:bg-[#ff4fd8] hover:text-white text-[12px] disabled:opacity-40"
        >
          {submitting ? "Oluşturuluyor..." : "Palet Oluştur"}
        </button>
      </div>
    </form>
  )
}
