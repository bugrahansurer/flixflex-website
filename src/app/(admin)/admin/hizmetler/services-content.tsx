"use client"

import type { LucideIcon } from "@/lib/icons"
import Link from "next/link"
import { useState } from "react"
import { Pencil, ExternalLink } from "@/lib/icons"
import * as LucideIcons from "@/lib/icons"
import { cn } from "@/lib/utils"
import { ViewToggle, type ViewMode } from "@/components/admin/view-toggle"

type ServiceCardItem = {
  id: string
  title: string
  slug: string
  icon: string
  isPublished: boolean
  portfolios: Array<unknown>
}

export function ServicesContent({ items }: { items: ServiceCardItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  if (items.length === 0) {
    return (
      <div className="ff-shape-container ff-card py-16 text-center">
        <p className="text-[#666666] text-sm">Henüz hizmet kaydı yok.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="ff-shape-container ff-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#f2f2f2] border-b border-[#cccccc] text-left">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666]">Hizmet</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666]">Bağlı Portfolyo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666]">Durum</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666] text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#cccccc] last:border-0 hover:bg-[#f7f7f5] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/hizmetler/${item.slug}`} className="text-[13px] font-semibold hover:text-[#ff4fd8] transition-colors">
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-[#666666] mt-0.5">/hizmetler/{item.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#666666]">
                      {item.portfolios.length} proje
                    </td>
                    <td className="px-4 py-3">
                      <Status published={item.isPublished} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/hizmetler/${item.slug}`} target="_blank" className="ff-shape-button border border-[#cccccc] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors">
                          <ExternalLink size={12} />
                        </Link>
                        <Link href={`/admin/hizmetler/${item.slug}`} className="ff-shape-button border border-[#cccccc] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors">
                          <Pencil size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceCard({ item }: { item: ServiceCardItem }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[item.icon] ?? LucideIcons.Globe

  return (
    <div className={cn(
      "ff-shape-container ff-card p-0 group relative",
      "p-5 transition-all duration-200 hover:border-[#ff4fd8]",
      "flex flex-col"
    )}>
      <div className="absolute inset-x-0 top-0 h-px bg-[#ff4fd8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-3">
        <div className="ff-shape-button w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "rgba(255, 79, 216,0.1)" }}>
          <Icon size={18} className="text-[#ff4fd8]" />
        </div>
        <Status published={item.isPublished} />
      </div>

      <div className="mt-3 space-y-2 flex-1">
        <Link
          href={`/admin/hizmetler/${item.slug}`}
          className="text-sm font-semibold text-[#333333] hover:text-[#ff4fd8] transition-colors line-clamp-1"
        >
          {item.title}
        </Link>
        <p className="text-[11px] text-[#666666]">
          /hizmetler/{item.slug}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#cccccc]">
        <span className="text-[11px] text-[#666666]">
          {item.portfolios.length} proje
        </span>
        <div className="flex gap-1">
          <Link
            href={`/hizmetler/${item.slug}`}
            target="_blank"
            className="ff-shape-button border border-[#cccccc] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <ExternalLink size={12} />
          </Link>
          <Link
            href={`/admin/hizmetler/${item.slug}`}
            className="ff-shape-button border border-[#cccccc] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors"
          >
            <Pencil size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function Status({ published }: { published: boolean }) {
  return (
    <span className={cn(
      "ff-shape-container px-3 py-1 text-[10px] border",
      published
        ? "text-[#10b981] border-[#10b981]/40 bg-[#10b981]/20 backdrop-blur-sm"
        : "text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/20 backdrop-blur-sm"
    )}>
      {published ? "Yayında" : "Taslak"}
    </span>
  )
}
