"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Palette Card Actions (Client)
// Handles: Düzenle, Aktive Et, Çoğalt, Sil
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil, CopyPlus, Trash2 } from "@/lib/icons"
import type { ColorPalette } from "@/lib/colors/types"

interface PaletteListActionsProps {
  palette: ColorPalette
}

export function PaletteListActions({ palette }: PaletteListActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState<string | null>(null)

  async function handleActivate() {
    setLoading("activate")
    try {
      const res = await fetch(`/api/palettes/${palette.id}/activate`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        alert(data.error ?? "Bir hata oluştu")
        return
      }
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  async function handleDuplicate() {
    setLoading("duplicate")
    try {
      const res = await fetch("/api/palettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${palette.name} (Kopya)`,
          description: palette.description,
          colors: palette.colors,
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        alert(data.error ?? "Bir hata oluştu")
        return
      }
      const data = await res.json() as { palette: { id: string } }
      router.push(`/admin/theme/${data.palette.id}`)
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `"${palette.name}" paletini silmek istediğinizden emin misiniz?`
      )
    ) {
      return
    }
    setLoading("delete")
    try {
      const res = await fetch(`/api/palettes/${palette.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        alert(data.error ?? "Bir hata oluştu")
        return
      }
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E0E0E0]">
      {/* Düzenle */}
      <a
        href={`/admin/theme/${palette.id}`}
        title="Paleti Düzenle"
        className="ff-btn ff-btn-ghost bg-[#F7f7f5] border border-[#cccccc] text-[#666666] hover:bg-[#ff4fd8]/10 hover:border-[#ff4fd8]/30 hover:text-[#ff4fd8] w-9 h-9 p-0 normal-case"
      >
        <Pencil size={16} />
      </a>

      {/* Çoğalt */}
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={loading === "duplicate"}
        title="Paleti Çoğalt"
        className="ff-btn ff-btn-ghost bg-[#F7f7f5] border border-[#cccccc] text-[#666666] hover:bg-[#ff4fd8]/10 hover:border-[#ff4fd8]/30 hover:text-[#ff4fd8] w-9 h-9 p-0 disabled:opacity-40 normal-case"
      >
        {loading === "duplicate" ? "..." : <CopyPlus size={16} />}
      </button>

      {/* Aktive Et */}
      {!palette.isActive && (
        <button
          type="button"
          onClick={handleActivate}
          disabled={loading === "activate"}
          title="Temayı Aktif Et"
          className="ff-btn ff-btn-outline bg-green-500/10 text-green-500 border border-green-500/30 text-[11px] py-1.5 px-3 h-9 disabled:opacity-40 normal-case"
        >
          {loading === "activate" ? "..." : "Aktif Et"}
        </button>
      )}

      {/* Sil — disabled for system or active palettes */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={
          loading === "delete" || palette.isSystem || palette.isActive
        }
        title={
          palette.isSystem
            ? "Sistem paletleri silinemez"
            : palette.isActive
              ? "Aktif tema silinemez"
              : "Paleti Sil"
        }
        className="ff-btn ff-btn-ghost w-9 h-9 p-0 text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed ml-auto normal-case"
      >
        {loading === "delete" ? "..." : <Trash2 size={16} />}
      </button>
    </div>
  )
}
