"use client"

// Debounced arama efekti dış kaynağı (API) senkronize eder; setState bilinçli.
/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Search, X, Loader2 } from "@/lib/icons"
import { cn } from "@/lib/utils"

interface SearchItem {
  id: string
  title: string
  subtitle?: string
  href: string
}
interface SearchGroup {
  resource: string
  label: string
  items: SearchItem[]
}

export function AdminSearch() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [groups, setGroups] = React.useState<SearchGroup[]>([])
  const [loading, setLoading] = React.useState(false)
  const [active, setActive] = React.useState(0)

  const wrapRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Düz sonuç listesi — klavye ile gezinme için.
  const flat = React.useMemo(() => groups.flatMap((g) => g.items), [groups])

  // ── Aç/kapa ────────────────────────────────────────────
  const openSearch = React.useCallback(() => {
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const closeSearch = React.useCallback(() => {
    setOpen(false)
    setQuery("")
    setGroups([])
    setActive(0)
  }, [])

  // ── Dışarı tıklama + Escape ────────────────────────────
  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open, closeSearch])

  // ── Debounced arama ────────────────────────────────────
  React.useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setGroups([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        const json = await res.json()
        setGroups(json.ok ? json.groups : [])
        setActive(0)
      } catch (err) {
        if ((err as Error).name !== "AbortError") setGroups([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

  const go = React.useCallback((href: string) => {
    closeSearch()
    router.push(href)
  }, [router, closeSearch])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { closeSearch(); return }
    if (!flat.length) return
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % flat.length) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + flat.length) % flat.length) }
    else if (e.key === "Enter") { e.preventDefault(); const item = flat[active]; if (item) go(item.href) }
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      {/* Tek eleman: genişliği 36px ↔ 300px arası animasyonla değişir.
          Buton/input arası mount-unmount yok → dikey sıçrama olmaz. */}
      <motion.div
        animate={{ width: open ? 300 : 36 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className={cn(
          "ff-shape-button flex items-center h-9 overflow-hidden transition-colors duration-150",
          open ? "border border-[#ff4fd8] bg-white" : "border border-[#E0E0E0]"
        )}
      >
        <button
          type="button"
          aria-label="Ara"
          onClick={() => (open ? inputRef.current?.focus() : openSearch())}
          className={cn(
            "w-9 h-9 grid place-items-center shrink-0 transition-colors duration-150",
            open ? "text-[#ff4fd8]" : "text-[#666666] hover:text-[#ff4fd8]"
          )}
        >
          <Search size={15} className="mr-0.5" />
        </button>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          tabIndex={open ? 0 : -1}
          placeholder="Portföy, hizmet, sayfa, kullanıcı ara…"
          className="flex-1 min-w-0 bg-transparent text-[13px] text-[#333333] placeholder:text-[#999999] outline-none"
        />
        {open && loading && <Loader2 size={14} className="animate-spin text-[#999999] shrink-0 mr-1" />}
        {open && (
          <button
            type="button"
            aria-label="Aramayı kapat"
            onClick={closeSearch}
            className="shrink-0 pr-2.5 pl-1 text-[#999999] hover:text-[#ff4fd8] transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </motion.div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "ff-shape-container absolute right-0 mt-2 w-[340px] max-w-[86vw] z-50",
              "bg-[#F7F7F5] border border-[#E0E0E0] shadow-2xl overflow-hidden"
            )}
          >
            <div className="max-h-[60vh] overflow-y-auto py-1">
              {!loading && flat.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12px] text-[#888888]">
                  <span className="font-semibold text-[#666666]">&quot;{query.trim()}&quot;</span> için sonuç bulunamadı.
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.resource} className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#999999]">
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const idx = flat.findIndex((f) => f === item)
                      const isActive = idx === active
                      return (
                        <button
                          key={`${group.resource}-${item.id}`}
                          type="button"
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => go(item.href)}
                          className={cn(
                            "w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors",
                            isActive ? "bg-[#ff4fd8]/8" : "hover:bg-[#ff4fd8]/5"
                          )}
                        >
                          <span className="text-[12px] font-semibold text-[#333333] truncate">{item.title}</span>
                          {item.subtitle && (
                            <span className="text-[11px] text-[#888888] truncate">{item.subtitle}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
