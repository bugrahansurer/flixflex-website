"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — New Page Form (Client Component)
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FFInput, FFTextarea } from "@/components/ui/ff-input"
import { FFButton } from "@/components/ui/ff-button"
import { slugify } from "@/lib/utils"

export function NewPageForm() {
  const router = useRouter()

  const [title, setTitle]             = useState("")
  const [slug, setSlug]               = useState("")
  const [description, setDescription] = useState("")
  const [slugEdited, setSlugEdited]   = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!slugEdited) {
      setSlug(slugify(val))
    }
  }, [slugEdited])

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value)
    setSlugEdited(true)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Başlık zorunludur")
      return
    }
    if (!slug.trim()) {
      setError("Slug zorunludur")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/pages", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: title.trim(), slug: slug.trim(), description }),
      })
      const json = await res.json() as { success: boolean; data?: { id: string; slug: string }; error?: string }
      if (!res.ok || !json.success) {
        setError(json.error ?? "Sayfa oluşturulamadı")
        return
      }
      const pageSlug = json.data!.slug === "/" ? "home" : json.data!.slug
      router.push(`/admin/sayfalar/${pageSlug}/edit`)
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [title, slug, description, router])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title */}
      <FFInput
        label="Sayfa Başlığı"
        placeholder="Örn: Hizmetler, Hakkımızda..."
        value={title}
        onChange={handleTitleChange}
        required
      />

      {/* Slug */}
      <FFInput
        label="Slug (URL yolu)"
        placeholder="hizmetler"
        value={slug}
        onChange={handleSlugChange}
        hint="Örn: /hizmetler — otomatik oluşturulur veya düzenleyebilirsiniz"
      />

      {/* Description */}
      <FFTextarea
        label="Açıklama (opsiyonel)"
        placeholder="SEO meta açıklaması veya sayfa notu..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <FFButton
          type="submit"
          variant="primary"
          loading={loading}
        >
          Sayfa Oluştur
        </FFButton>
        <FFButton
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          İptal
        </FFButton>
      </div>
    </form>
  )
}
