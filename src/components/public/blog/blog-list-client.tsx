"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { ease, staggerContainer, fadeInUp } from "@/lib/animations"
import { BlogCard } from "./blog-card"
import { BlogCategories } from "./blog-categories"
import { POSTS, type BlogCategory, type BlogPost } from "./blog-data"

const POSTS_PER_PAGE = 9

export function BlogListClient({ posts = POSTS }: { posts?: BlogPost[] } = {}) {
  const [category, setCategory] = useState<BlogCategory>("Tümü")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let results = posts

    if (category !== "Tümü") {
      results = results.filter((p) => p.category === category)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return results
  }, [category, search, posts])

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE
  )

  const handleCategoryChange = (cat: BlogCategory) => {
    setCategory(cat)
    setPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div>
      {/* ── Search + Filter row ─────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-faint)] pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Yazılarda ara..."
            value={search}
            onChange={handleSearch}
            className={cn(
              "ff-shape-container w-full ff-input h-9 pl-10",
              "text-sm placeholder:text-[var(--foreground-faint)]"
            )}
            aria-label="Blog yazılarında ara"
          />
        </div>

        {/* Category filters */}
        <BlogCategories active={category} onChange={handleCategoryChange} />
      </div>

      {/* ── Grid ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {paginated.length > 0 ? (
          <motion.div
            key={`${category}-${search}-${safePage}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
          >
            {paginated.map((post) => (
              <motion.div key={post.slug} variants={fadeInUp}>
                <BlogCard post={post} className="p-4 h-full" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center text-[var(--foreground-faint)] text-sm"
          >
            Arama kriterlerinize uygun yazı bulunamadı.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pagination ─────────────────────────────── */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: ease.smooth }}
          className="flex items-center justify-center gap-3 mt-12"
        >
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={cn(
              "ff-shape-button px-5 py-2.5 text-[11px] font-semibold border transition-all duration-200",
              safePage <= 1
                ? "border-[var(--border)] text-[var(--foreground-faint)] cursor-not-allowed opacity-40"
                : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)]/40 hover:text-[var(--ff-purple)]"
            )}
            aria-label="Önceki sayfa"
          >
            ← Önceki
          </button>

          <span className="text-[12px] text-[var(--foreground-muted)] tracking-wide px-2">
            Sayfa {safePage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={cn(
              "ff-shape-button px-5 py-2.5 text-[11px] font-semibold border transition-all duration-200",
              safePage >= totalPages
                ? "border-[var(--border)] text-[var(--foreground-faint)] cursor-not-allowed opacity-40"
                : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)]/40 hover:text-[var(--ff-purple)]"
            )}
            aria-label="Sonraki sayfa"
          >
            Sonraki →
          </button>
        </motion.div>
      )}
    </div>
  )
}
