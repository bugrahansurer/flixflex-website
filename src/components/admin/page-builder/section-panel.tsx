"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Section Panel (left rail)
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { usePageBuilder } from "@/store/page-builder"
import {
  SECTION_CATEGORIES,
  getSectionsByCategory,
  type SectionCategory,
} from "@/lib/page-builder/section-registry"
import type { SectionType } from "@/types/page-builder"

export function SectionPanel() {
  const addSection = usePageBuilder((s) => s.addSection)
  const [query, setQuery] = useState("")
  const [collapsed, setCollapsed] = useState<Set<SectionCategory>>(new Set())

  const grouped = useMemo(() => getSectionsByCategory(), [])

  const filteredGrouped = useMemo(() => {
    if (!query.trim()) return grouped
    const q = query.toLowerCase()
    const result = {} as typeof grouped
    for (const cat of SECTION_CATEGORIES) {
      result[cat] = grouped[cat].filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [grouped, query])

  function toggleCategory(cat: SectionCategory) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#CCCCCC]">
        <p className="text-[10px] font-semibold text-[#666666] mb-2">
          Section Ekle
        </p>
        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Section ara..."
            className={cn(
              "ff-shape-container w-full pl-8 pr-3 py-2 text-[12px]",
              "bg-[#f7f7f5] border border-[#CCCCCC]",
              "text-[#333333] placeholder:text-[#666666]",
              "outline-none focus:border-[#ff4fd8] transition-colors duration-150"
            )}
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto py-2">
        {SECTION_CATEGORIES.map((cat) => {
          const items = filteredGrouped[cat]
          if (!items || items.length === 0) return null
          const isCollapsed = collapsed.has(cat)

          return (
            <div key={cat} className="mb-1">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2",
                  "text-[10px] font-semibold",
                  "text-[#666666] hover:text-[#ff4fd8]",
                  "transition-colors duration-100"
                )}
              >
                <span>{cat}</span>
                {isCollapsed
                  ? <ChevronRight size={12} />
                  : <ChevronDown size={12} />
                }
              </button>

              {/* Section tiles */}
              {!isCollapsed && (
                <div className="px-2 pb-1 grid grid-cols-2 gap-1.5">
                  {items.map((meta) => {
                    const Icon = meta.icon
                    return (
                      <button
                        key={meta.type}
                        onClick={() => addSection(meta.type as SectionType)}
                        title={meta.description}
                        className={cn(
                          "ff-shape-container group flex flex-col items-center gap-2 p-2.5",
                          "border border-[#CCCCCC] bg-[#f7f7f5]",
                          "hover:border-[#ff4fd8] hover:bg-[#ff4fd8]/20",
                          "transition-all duration-150 cursor-pointer text-left"
                        )}
                      >
                        {/* Thumbnail */}
                        <div
                          className={cn(
                            "ff-shape-button w-full h-10 flex items-center justify-center",
                            meta.thumbnailColor,
                            "text-[#ff4fd8] text-[11px] font-medium tracking-wider uppercase"
                          )}
                        >
                          <Icon size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Label */}
                        <span className="text-[10px] font-medium text-[#666666] group-hover:text-[#ff4fd8] leading-tight">
                          {meta.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Empty state */}
        {SECTION_CATEGORIES.every((c) => !filteredGrouped[c]?.length) && (
          <div className="px-4 py-8 text-center text-[12px] text-[#666666]">
            &quot;{query}&quot; için sonuç bulunamadı
          </div>
        )}
      </div>
    </div>
  )
}
