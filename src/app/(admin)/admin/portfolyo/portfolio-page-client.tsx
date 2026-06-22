"use client"

import Link from "next/link"
import { Plus, Pencil, ExternalLink, ImageIcon } from "@/lib/icons"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ViewToggle, type ViewMode } from "@/components/admin/view-toggle"

type PortfolioCardItem = {
  id: string
  title: string
  slug: string
  coverImage: string
  client: string | null
  year: number | null
  isPublished: boolean
  services: Array<{ id: string; title: string }>
}

export function PortfolioPageClient({ items }: { items: PortfolioCardItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333]">
            Portfolyo
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Proje/vaka çalışması kayıtlarını oluşturun ve detay sayfalarını yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Link href="/admin/portfolyo/new" className="ff-btn ff-btn-primary inline-flex items-center h-9 font-semibold text-xs gap-2">
            <Plus size={14} />
            Yeni Portfolyo
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="ff-shape-container ff-card py-16 text-center">
          <p className="text-[#666666] text-sm">Henüz portfolyo kaydı yok.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="ff-shape-container ff-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#f2f2f2] border-b border-[#CCCCCC] text-left">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666]">Proje</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666]">Hizmetler</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666]">Durum</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#666666] text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#CCCCCC] last:border-0 hover:bg-[#f7f7f5] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/portfolyo/${item.slug}`} className="text-[#333333] text-[13px] font-semibold hover:text-[#ff4fd8] transition-colors">
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-[#666666] mt-0.5">
                        /portfolio/{item.slug}
                        {item.client && <span> · {item.client}</span>}
                        {item.year && <span> · {item.year}</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#666666]">
                      {item.services.length > 0
                        ? item.services.map((s) => s.title).join(", ")
                        : "Bağlı hizmet yok"}
                    </td>
                    <td className="px-4 py-3">
                      <Status published={item.isPublished} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/portfolio/${item.slug}`} target="_blank" className="ff-shape-button text-[#0d0d0d] border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] transition-colors">
                          <ExternalLink size={12} />
                        </Link>
                        <Link href={`/admin/portfolyo/${item.slug}`} className="ff-shape-button text-[#0d0d0d] border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] transition-colors">
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

function PortfolioCard({ item }: { item: PortfolioCardItem }) {
  return (
    <div className={cn(
      "ff-shape-container ff-card p-0 group relative",
      "overflow-hidden transition-all duration-200 hover:border-[#ff4fd8]"
    )}>
      <div className="absolute inset-x-0 top-0 h-px bg-[#ff4fd8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="aspect-video bg-[#f7f7f5] border-b border-[#CCCCCC] relative overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-[#666666]" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Status published={item.isPublished} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <Link
            href={`/admin/portfolyo/${item.slug}`}
            className="text-sm font-semibold text-[#333333] hover:text-[#ff4fd8] transition-colors line-clamp-1 block"
          >
            {item.title}
          </Link>
          <p className="text-[11px] text-[#666666] mt-0.5">
            {item.client && <span>{item.client}</span>}
            {item.client && item.year && <span> · </span>}
            {item.year && <span>{item.year}</span>}
          </p>
        </div>

        {item.services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.services.map((s) => (
              <span key={s.id} className="ff-shape-container px-2 py-0.5 text-[10px] border border-[#CCCCCC] text-[#666666] bg-[#f7f7f5]">
                {s.title}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#CCCCCC]">
          <span className="text-[10px] text-[#666666]">
            /portfolio/{item.slug}
          </span>
          <div className="flex gap-1">
            <Link
              href={`/portfolio/${item.slug}`}
              target="_blank"
              className="ff-shape-button text-[#0d0d0d] border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:text-[#ff4fd8] hover:border-[#ff4fd8] transition-colors"
            >
              <ExternalLink size={12} />
            </Link>
            <Link
              href={`/admin/portfolyo/${item.slug}`}
              className="ff-shape-button text-[#0d0d0d] border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:text-[#ff4fd8] hover:border-[#ff4fd8] transition-colors"
            >
              <Pencil size={12} />
            </Link>
          </div>
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
        ? "text-[#38ca6e] border-[#38ca6e]/30 bg-[#38ca6e]/10 backdrop-blur-sm"
        : "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10 backdrop-blur-sm"
    )}>
      {published ? "Yayında" : "Taslak"}
    </span>
  )
}
