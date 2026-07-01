"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Pencil, ExternalLink, ImageIcon, Trash2, X, Loader2 } from "@/lib/icons"
import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { ViewToggle, type ViewMode } from "@/components/admin/view-toggle"
import { Can } from "@/components/admin/rbac/permission-context"

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

export function PortfolioContent({ items }: { items: PortfolioCardItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const router = useRouter()

  // Silme durumları
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<PortfolioCardItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const triggerDelete = (item: PortfolioCardItem) => {
    setItemToDelete(item)
    setDeleteError(null)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} onDelete={triggerDelete} />
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
                      <Link href={`/admin/portfolyo/${item.slug}`} className="text-[13px] font-semibold hover:text-[#ff4fd8] transition-colors">
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
                        <Link href={`/portfolio/${item.slug}`} target="_blank" className="ff-shape-button border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors">
                          <ExternalLink size={12} />
                        </Link>
                        <Link href={`/admin/portfolyo/${item.slug}`} className="ff-shape-button border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors">
                          <Pencil size={12} />
                        </Link>
                        <Can resource="portfolio" action="delete">
                          <button
                            type="button"
                            onClick={() => triggerDelete(item)}
                            title="Portfolyoyu Sil"
                            className="ff-shape-button border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-red-500 text-[#666666] hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Silme onay diyaloğu */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-ff-fadeIn" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E0E0E0] p-6 shadow-2xl ff-shape-container animate-ff-fadeIn">
            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#333333] transition-colors" aria-label="Kapat">
                <X size={14} />
              </button>
            </Dialog.Close>

            <div className="ff-shape-button w-10 h-10 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-4">
              <Trash2 size={18} className="text-red-500" />
            </div>

            <Dialog.Title className="text-base font-extrabold text-[#333333] mb-2">
              Portfolyoyu Sil
            </Dialog.Title>

            {itemToDelete && (
              <div className="space-y-4">
                <Dialog.Description className="text-xs text-[#666666] leading-relaxed">
                  <strong className="text-[#333333]">{itemToDelete.title}</strong> portfolyo kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </Dialog.Description>

                {deleteError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold ff-shape-container">
                    {deleteError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button className="ff-shape-button px-5 h-9 border border-[#CCCCCC] bg-[#f7f7f5] text-[#666666] text-[11px] font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] transition-colors" disabled={deleteLoading}>
                      Vazgeç
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={async () => {
                      if (!itemToDelete) return
                      setDeleteLoading(true)
                      setDeleteError(null)
                      try {
                        const res = await fetch(`/api/portfolio/${itemToDelete.id}`, { method: "DELETE" })
                        const json = await res.json().catch(() => ({}))
                        if (!res.ok || !json.ok) throw new Error(json.message ?? json.error ?? "Silme işlemi başarısız")
                        setDeleteOpen(false)
                        router.refresh()
                      } catch (err) {
                        setDeleteError(err instanceof Error ? err.message : String(err))
                      } finally {
                        setDeleteLoading(false)
                      }
                    }}
                    disabled={deleteLoading}
                    className="ff-shape-button inline-flex items-center gap-1.5 px-6 h-9 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} />}
                    Portfolyoyu Sil
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function PortfolioCard({ item, onDelete }: { item: PortfolioCardItem; onDelete: (item: PortfolioCardItem) => void }) {
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
            className="text-sm font-semibold text-[#666666] hover:text-[#ff4fd8] transition-colors line-clamp-1 block"
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
              className="ff-shape-button border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors"
            >
              <ExternalLink size={12} />
            </Link>
            <Link
              href={`/admin/portfolyo/${item.slug}`}
              className="ff-shape-button border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors"
            >
              <Pencil size={12} />
            </Link>
            <Can resource="portfolio" action="delete">
              <button
                type="button"
                onClick={() => onDelete(item)}
                title="Portfolyoyu Sil"
                className="ff-shape-button border border-[#CCCCCC] w-7 h-7 flex items-center justify-center hover:border-red-500 text-[#666666] hover:text-red-500 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </Can>
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
        ? "stext-[#38ca6e] border-[#38ca6e]/30 bg-[#38ca6e]/10 backdrop-blur-sm"
        : "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10 backdrop-blur-sm"
    )}>
      {published ? "Yayında" : "Taslak"}
    </span>
  )
}
