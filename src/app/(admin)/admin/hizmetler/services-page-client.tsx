"use client"

import * as React from "react"
import type { LucideIcon } from "@/lib/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Plus, Pencil, ExternalLink, Layers, ChevronRight, Trash2, X, Loader2 } from "@/lib/icons"
import * as LucideIcons from "@/lib/icons"
import { cn } from "@/lib/utils"
import { ViewToggle, type ViewMode } from "@/components/admin/view-toggle"

type ServiceCardItem = {
  id: string
  title: string
  slug: string
  icon: string
  isPublished: boolean
  parentId?: string | null
  parent?: { id: string; title: string } | null
  children?: Array<unknown>
  portfolios: Array<unknown>
  order: number
}

export function ServicesPageClient({ items }: { items: ServiceCardItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const router = useRouter()

  // Deletion States
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<ServiceCardItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Group services hierarchically
  const { mainServices, getChildren, orphanedServices } = useMemo(() => {
    const mains = items.filter((s) => !s.parentId)
    const mainIds = new Set(mains.map((s) => s.id))
    const orphans = items.filter((s) => s.parentId && !mainIds.has(s.parentId))

    return {
      mainServices: mains,
      getChildren: (parentId: string) => items.filter((s) => s.parentId === parentId),
      orphanedServices: orphans
    }
  }, [items])

  const triggerDelete = (item: ServiceCardItem) => {
    setServiceToDelete(item)
    setDeleteError(null)
    setDeleteOpen(true)
  }

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 flex-wrap border-b border-[#E0E0E0] pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333]">
            Hizmetler
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Müşterilerinize sunduğunuz ana hizmet ve alt uzmanlık alanlarını buradan yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Link
            href="/admin/hizmetler/new"
            className="ff-shape-button inline-flex items-center h-9 px-5 bg-[#ff4fd8] text-white font-bold text-[12px] gap-2 hover:bg-[#ff4fd8]/90 transition-all shadow-sm"
          >
            <Plus size={14} />
            Yeni Hizmet Ekle
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="ff-shape-container ff-card py-16 text-center">
          <p className="text-[#666666] text-xs font-bold">Henüz hizmet kaydı yok.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ───────────────────────────────── */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mainServices.map((item) => {
              const children = getChildren(item.id)
              return (
                <MainServiceCard
                  key={item.id}
                  item={item}
                  childrenList={children}
                  onDelete={triggerDelete}
                />
              )
            })}
          </div>

          {/* Orphaned Services (if any exist) */}
          {orphanedServices.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-[#E0E0E0]">
              <h3 className="text-xs font-bold text-[#666666] uppercase tracking-wider">Diğer Hizmetler (Üst Hizmeti Silinmiş Olanlar)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orphanedServices.map((item) => (
                  <MainServiceCard
                    key={item.id}
                    item={item}
                    childrenList={[]}
                    onDelete={triggerDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── HIERARCHICAL LIST VIEW ──────────────────── */
        <div className="ff-shape-container ff-card p-0 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead className="bg-[#f2f2f2] border-b border-[#CCCCCC]">
                <tr>
                  <th className="px-5 py-2 text-[10px] font-bold text-[#666666]">Hizmet Adı</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-[#666666] w-20">İkon</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-[#666666] w-24">Durum</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-[#666666] w-32">Portfolyo</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-[#666666] w-20">Sıra</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-[#666666] text-right w-36">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {mainServices.map((mainItem) => {
                  const children = getChildren(mainItem.id)
                  return (
                    <React.Fragment key={mainItem.id}>
                      {/* Parent Row */}
                      <ServiceRow item={mainItem} isChild={false} onDelete={triggerDelete} />

                      {/* Child Rows */}
                      {children.map((childItem) => (
                        <ServiceRow
                          key={childItem.id}
                          item={childItem}
                          isChild={true}
                          onDelete={triggerDelete}
                        />
                      ))}
                    </React.Fragment>
                  )
                })}

                {/* Render Orphaned Services in list */}
                {orphanedServices.map((orphanItem) => (
                  <ServiceRow
                    key={orphanItem.id}
                    item={orphanItem}
                    isChild={false}
                    onDelete={triggerDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dialog: Confirm Deletion Modal ── */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E0E0E0] p-6 shadow-2xl ff-shape-container animate-ff-fadeIn">
            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#333333] transition-colors"
                aria-label="Kapat"
              >
                <X size={14} />
              </button>
            </Dialog.Close>

            <div className="ff-shape-button w-10 h-10 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-4">
              <Trash2 size={18} className="text-red-500" />
            </div>

            <Dialog.Title className="text-base font-extrabold text-[#333333] mb-2">
              Hizmeti Sil
            </Dialog.Title>

            {serviceToDelete && (
              <>
                {/* Hierarchy block check */}
                {getChildren(serviceToDelete.id).length > 0 ? (
                  <div className="space-y-4">
                    <Dialog.Description className="text-xs text-[#666666] leading-relaxed">
                      <strong className="text-[#333333]">{serviceToDelete.title}</strong> hizmetine bağlı alt hizmetler bulunmaktadır.
                      Veri bütünlüğünü korumak adına, alt hizmetleri olan bir ana hizmetin silinmesine izin verilmez.
                    </Dialog.Description>
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold ff-shape-container leading-relaxed">
                      Lütfen önce bu hizmete bağlı alt uzmanlık alanlarını silin veya başka bir ana hizmete bağlayın.
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Dialog.Close asChild>
                        <button className="ff-shape-button px-5 h-9 bg-[#f7f7f5] border border-[#CCCCCC] text-[#666666] text-[11px] font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] transition-colors">
                          Kapat
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Dialog.Description className="text-xs text-[#666666] leading-relaxed">
                      <strong className="text-[#333333]">{serviceToDelete.title}</strong> hizmetini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bu hizmete bağlı tüm veriler silinir.
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
                          setDeleteLoading(true)
                          setDeleteError(null)
                          try {
                            const res = await fetch(`/api/services/${serviceToDelete.id}`, { method: "DELETE" })
                            const json = await res.json()
                            if (!res.ok || !json.ok) throw new Error(json.message ?? "Silme işlemi başarısız")
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
                        Hizmeti Sil
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

/* ── SUPPORTING COMPONENTS ───────────────────────── */

// Grid view Main Service Card containing child lists
function MainServiceCard({
  item,
  childrenList,
  onDelete
}: {
  item: ServiceCardItem
  childrenList: ServiceCardItem[]
  onDelete: (item: ServiceCardItem) => void
}) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[item.icon] ?? LucideIcons.Globe

  return (
    <div className={cn(
      "ff-shape-container group relative bg-[#f7f7f5] border border-[#E0E0E0] p-6",
      "transition-all duration-300 hover:border-[#ff4fd8]/50 hover:shadow-md flex flex-col justify-between"
    )}>
      {/* Top section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="ff-shape-button w-11 h-11 flex items-center justify-center shrink-0 shadow-sm border border-[#ff4fd8]/10" style={{ background: "rgba(255, 79, 216,0.08)" }}>
            <Icon size={20} className="text-[#ff4fd8]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#888888] px-2 py-0.5 bg-[#f7f7f5] border border-[#E0E0E0] ff-shape-container">
              Sıra: {item.order}
            </span>
            <StatusBadge published={item.isPublished} />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <Link
            href={`/admin/hizmetler/${item.slug}`}
            className="text-sm font-extrabold text-[#333333] hover:text-[#ff4fd8] transition-colors line-clamp-1 block"
          >
            {item.title}
          </Link>
          <p className="text-[10px] font-mono text-[#888888]">
            /hizmetler/{item.slug}
          </p>
        </div>

        {/* Nested Child Services */}
        <div className="mt-5 pt-4 border-t border-[#F0F0F0] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wider block">Alt Hizmetler ({childrenList.length})</span>
            {childrenList.length > 0 && (
              <span className="text-[9px] font-semibold text-[#ff4fd8] inline-flex items-center gap-0.5">
                <Layers size={10} />
                Hiyerarşi Aktif
              </span>
            )}
          </div>

          {childrenList.length > 0 ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {childrenList.map((child) => {
                const ChildIcon = (LucideIcons as unknown as Record<string, LucideIcon>)[child.icon] ?? LucideIcons.Globe
                return (
                  <div
                    key={child.id}
                    className="flex items-center justify-between gap-4 p-2 bg-[#f7f7f5] hover:bg-[#ff4fd8]/5 border border-[#CCCCCC]/40 hover:border-[#ff4fd8]/20 transition-all ff-shape-container group/row"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ChildIcon size={12} className="text-[#888888] shrink-0" />
                      <Link
                        href={`/admin/hizmetler/${child.slug}`}
                        className="text-[11px] font-semibold text-[#555555] group-hover/row:text-[#ff4fd8] transition-colors truncate hover:underline"
                      >
                        {child.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Sub Status Dot */}
                      <span
                        className={cn("w-1.5 h-1.5 rounded-full shrink-0", child.isPublished ? "bg-green-500" : "bg-orange-400")}
                        title={child.isPublished ? "Yayında" : "Taslak"}
                      />

                      {/* Action Links */}
                      <Link
                        href={`/admin/hizmetler/${child.slug}`}
                        className="w-5 h-5 flex items-center justify-center border border-[#CCCCCC] hover:border-[#ff4fd8] text-[#888888] hover:text-[#ff4fd8] transition-colors ff-shape-button"
                        title="Alt Hizmeti Düzenle"
                      >
                        <Pencil size={9} />
                      </Link>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => onDelete(child)}
                        className="w-5 h-5 flex items-center justify-center border border-[#CCCCCC] hover:border-red-500/50 hover:bg-red-500/10 text-[#888888] hover:text-red-500 transition-colors ff-shape-button"
                        title="Alt Hizmeti Sil"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#999999] italic py-2">Alt uzmanlık alanı tanımlanmamış.</p>
          )}
        </div>
      </div>

      {/* Footer statistics */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#F0F0F0]">
        <span className="text-[11px] font-bold text-[#666666] flex items-center gap-1">
          <ChevronRight size={11} className="text-[#ff4fd8]" />
          {item.portfolios.length} Proje
        </span>

        <div className="flex gap-1.5">
          <Link
            href={`/hizmetler/${item.slug}`}
            target="_blank"
            className="ff-shape-button border border-[#ff4fd8] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#ff4fd8] hover:text-white transition-colors bg-transparent hover:bg-[#ff4fd8]"
            title="Public Sayfayı Gör"
          >
            <ExternalLink size={11} />
          </Link>
          <Link
            href={`/admin/hizmetler/${item.slug}`}
            className="ff-shape-button border border-[#ff4fd8] w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#ff4fd8] hover:text-white transition-colors bg-transparent hover:bg-[#ff4fd8]"
            title="Hizmeti Düzenle"
          >
            <Pencil size={11} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="ff-shape-button border border-red-500 w-7 h-7 flex items-center justify-center hover:border-red-500 text-white hover:text-white transition-colors bg-red-500 hover:bg-red-600"
            title="Hizmeti Sil"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Table view Row component
function ServiceRow({
  item,
  isChild,
  onDelete
}: {
  item: ServiceCardItem
  isChild: boolean
  onDelete: (item: ServiceCardItem) => void
}) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[item.icon] ?? LucideIcons.Globe

  return (
    <tr className={cn(
      "border-b border-[#CCCCCC] hover:bg-[#f7f7f5] transition-colors",
      isChild ? "bg-white/40" : "bg-white font-bold"
    )}>
      {/* Name & Slug */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 overflow-hidden">
          {isChild ? (
            <span className="text-xs font-semibold text-[#ff4fd8] shrink-0 mr-1 select-none">↳</span>
          ) : null}
          <div className="truncate">
            <Link
              href={`/admin/hizmetler/${item.slug}`}
              className={cn(
                "hover:text-[#ff4fd8] transition-colors block truncate",
                isChild ? "text-[12px] font-semibold text-[#555555]" : "text-[13px] font-extrabold text-[#333333]"
              )}
            >
              {item.title}
            </Link>
            <span className="text-[10px] font-mono text-[#888888] font-normal block">
              /hizmetler/{item.slug}
            </span>
          </div>
        </div>
      </td>

      {/* Icon Graphic */}
      <td className="px-5 py-3.5">
        <div className={cn(
          "ff-shape-container flex items-center justify-center shadow-inner border border-[#CCCCCC]/40 bg-[#f7f7f5] shrink-0",
          isChild ? "w-6 h-6" : "w-8 h-8"
        )}>
          <Icon size={isChild ? 11 : 14} className="text-[#ff4fd8]" />
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <StatusBadge published={item.isPublished} />
      </td>

      {/* Portfolios count */}
      <td className="px-5 py-3.5 text-xs text-[#666666] font-semibold">
        {item.portfolios.length} Proje
      </td>

      {/* Order */}
      <td className="px-5 py-3.5 text-xs font-semibold text-[#666666]">
        {item.order}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-1 shrink-0">
          <Link
            href={`/hizmetler/${item.slug}`}
            target="_blank"
            className="ff-shape-button border border-[#E0E0E0] bg-white w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors shadow-sm"
          >
            <ExternalLink size={11} />
          </Link>
          <Link
            href={`/admin/hizmetler/${item.slug}`}
            className="ff-shape-button border border-[#E0E0E0] bg-white w-7 h-7 flex items-center justify-center hover:border-[#ff4fd8] text-[#666666] hover:text-[#ff4fd8] transition-colors shadow-sm"
          >
            <Pencil size={11} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="ff-shape-button border border-[#E0E0E0] bg-white w-7 h-7 flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/10 text-[#666666] hover:text-red-500 transition-colors shadow-sm"
            title="Hizmeti Sil"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span className={cn(
      "ff-shape-container px-2 py-0.5 text-[9px] font-bold border inline-block select-none tracking-wider shrink-0 uppercase",
      published
        ? "text-[#10b981] border-[#10b981]/30 bg-[#10b981]/8"
        : "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/8"
    )}>
      {published ? "Yayında" : "Taslak"}
    </span>
  )
}
