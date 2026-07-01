"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Admin blog list with filters & inline actions
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Wand2,
  Sparkles,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from "@/lib/icons"
import { cn, formatDate } from "@/lib/utils"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import { FFButton } from "@/components/ui"
import type { BlogPostRecord } from "@/lib/ai/blog-store"
import { Can, useCan } from "@/components/admin/rbac/permission-context"

interface BlogListProps {
  initialPosts: BlogPostRecord[]
}

const STATUS_FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "draft", label: "Taslak" },
  { id: "published", label: "Yayında" },
] as const

const CATEGORIES = ["Tümü", "Strateji", "Yaratıcılık", "Performans", "SEO", "Sosyal Medya", "Marka"]

type StatusFilter = (typeof STATUS_FILTERS)[number]["id"]

export function BlogList({ initialPosts }: BlogListProps) {
  const router = useRouter()
  const [posts, setPosts] = React.useState<BlogPostRecord[]>(initialPosts)
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [category, setCategory] = React.useState<string>("Tümü")
  const [aiOnly, setAIOnly] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [busy, setBusy] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    return posts
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => (category === "Tümü" ? true : p.category === category))
      .filter((p) => (aiOnly ? p.aiGenerated : true))
      .filter((p) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      })
  }, [posts, status, category, aiOnly, search])

  async function toggleStatus(p: BlogPostRecord) {
    setBusy(p.id)
    try {
      const next = p.status === "published" ? "draft" : "published"
      const res = await fetch(`/api/blog/${p.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      const json = await res.json()
      if (json.ok) {
        setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: next } : x)))
      }
    } finally {
      setBusy(null)
    }
  }

  async function remove(p: BlogPostRecord) {
    if (!confirm(`"${p.title}" yazısını silmek istediğinden emin misin?`)) return
    setBusy(p.id)
    try {
      const res = await fetch(`/api/blog/${p.slug}`, { method: "DELETE" })
      const json = await res.json()
      if (json.ok) {
        setPosts((prev) => prev.filter((x) => x.id !== p.id))
      }
    } finally {
      setBusy(null)
    }
  }

  const can = useCan()

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] mb-2">
            Blog &amp; İçerik
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            {filtered.length} yazı &middot; {posts.filter((p) => p.aiGenerated).length} AI üretimi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Can resource="blog" action="create">
            <FFButton
              className="bg-transparent border-[#ff4fd8] text-[#ff4fd8] hover:text-white hover:bg-[#ff4fd8]/90 hover:border-[#ff4fd8]/90"
              variant="outline"
              leftIcon={<Plus size={13} />}
              onClick={() => router.push("/admin/blog/yeni")}
            >
              Yeni Blog Yazısı
            </FFButton>
          </Can>
          <Can resource="blog" action="create">
            <FFButton
              leftIcon={<Wand2 size={13} />}
              onClick={() => router.push("/admin/ai/studio")}
            >
              AI ile Üret
            </FFButton>
          </Can>
        </div>
      </div>

      {/* Filters */}
      <div className="ff-shape-container ff-card space-y-4">
        {/* Status pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const active = f.id === status
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatus(f.id)}
                  className={cn(
                    "ff-shape-button px-3 py-1.5 text-[11px] border transition-colors",
                    active
                      ? "bg-[#ff4fd8] text-white border-[#ff4fd8]"
                      : "bg-transparent text-[#666666] border-[#cccccc] hover:border-[#ff4fd8]"
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* AI toggle */}
          <label className="inline-flex items-center gap-2 text-[12px] text-[#666666] cursor-pointer">
            <input
              type="checkbox"
              checked={aiOnly}
              onChange={(e) => setAIOnly(e.target.checked)}
              className="accent-[#ff4fd8]"
            />
            <Sparkles size={12} className="text-[#ff4fd8]" />
            Sadece AI üretimi
          </label>
        </div>

        {/* Category + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <FFSelect
            value={category}
            onValueChange={setCategory}
            size="sm"
            fullWidth={false}
            triggerClassName="min-w-[160px]"
            ariaLabel="Kategori filtresi"
          >
            {CATEGORIES.map((c) => (
              <FFSelectItem key={c} value={c}>
                {c}
              </FFSelectItem>
            ))}
          </FFSelect>

          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
              size={13}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Başlık veya slug ara..."
              className="ff-shape-container w-full h-9 bg-[#f7f7f5] border border-[#cccccc] pl-9 pr-3 py-2 text-[13px] text-[#666666] outline-none focus:border-[#ff4fd8]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ff-shape-container ff-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="bg-[#f5f5f5] border-b border-[#cccccc]">
              <tr className="text-left">
                <Th>Başlık</Th>
                <Th>Kategori</Th>
                <Th>Durum</Th>
                <Th>Tarih</Th>
                <Th align="right">Aksiyonlar</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[#cccccc] last:border-0 hover:bg-[rgba(255, 79, 216,0.04)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.aiGenerated && (
                        <span title="AI tarafından üretildi">
                          <Sparkles size={12} className="text-[#ff4fd8] shrink-0" />
                        </span>
                      )}
                      <Link
                        href={`/admin/blog/${p.slug}`}
                        className="text-[13px] font-medium text-[#666666] hover:text-[#ff4fd8] transition-colors"
                      >
                        {p.title}
                      </Link>
                    </div>
                    <p className="text-[11px] font-mono text-[#666666] mt-0.5">
                      /{p.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-[#666666]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "ff-shape-container inline-block px-2 py-0.5 text-[9px] font-semibold border",
                        p.status === "published"
                          ? "bg-green-500/10 text-green-500 border-green-500/40"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/40"
                      )}
                    >
                      {p.status === "published" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#666666]">
                    {formatDate(p.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {can("blog", "publish") && (
                        <IconBtn
                          label={p.status === "published" ? "Taslağa al" : "Yayınla"}
                          onClick={() => toggleStatus(p)}
                          disabled={busy === p.id}
                        >
                          {p.status === "published" ? <EyeOff size={13} /> : <Eye size={13} />}
                        </IconBtn>
                      )}
                      {can("blog", "update") && (
                        <IconBtn
                          label="Düzenle"
                          onClick={() => router.push(`/admin/blog/${p.slug}`)}
                        >
                          <Pencil size={13} />
                        </IconBtn>
                      )}
                      {can("blog", "delete") && (
                        <IconBtn
                          label="Sil"
                          onClick={() => remove(p)}
                          disabled={busy === p.id}
                          danger
                        >
                          <Trash2 size={13} />
                        </IconBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[12px] text-[var(--foreground-faint)]">
                    Hiç yazı yok — filtreleri değiştir veya yeni blog yazısı oluştur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────
function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "px-4 py-2 text-[11px] font-semibold text-[#666666]",
        align === "right" && "text-right"
      )}
    >
      {children}
    </th>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "ff-shape-button w-8 h-8 flex items-center justify-center border transition-colors",
        "bg-[#f7f7f5] border-[#cccccc] text-[#666666]",
        danger
          ? "hover:border-red-500 hover:text-red-500"
          : "hover:border-[#ff4fd8] hover:text-[#ff4fd8]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  )
}
