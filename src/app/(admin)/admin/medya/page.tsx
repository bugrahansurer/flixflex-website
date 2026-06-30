"use client"

import * as React from "react"
import Image from "next/image"
import { Upload, Video, Image as ImageIcon, Trash2, Loader2, Play, ExternalLink, FolderPlus, Folder, ChevronRight, FileText, File, SortAsc, SortDesc, Calendar, Type, ArrowUpDown, ZoomIn, X as XIcon, RefreshCw } from "@/lib/icons"
import { cn } from "@/lib/utils"
import MuxPlayer from "@mux/mux-player-react"
import { toast } from "sonner"
import * as Dialog from "@radix-ui/react-dialog"
import { useCan } from "@/components/admin/rbac/permission-context"

type SortField = "createdAt" | "title" | "type" | "size"
type SortOrder = "asc" | "desc"

interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  _count?: {
    media: number
    children: number
  }
}

interface MediaItem {
  id: string
  title: string | null
  type: string
  mimeType: string | null
  url: string
  thumbnail: string | null
  muxStatus: string | null
  muxPlaybackId: string | null
  width?: number | null
  height?: number | null
  createdAt: string
  size: number
  folderId: string | null
}

export default function MediaPage() {
  const can = useCan()
  const [items, setItems] = React.useState<MediaItem[]>([])
  const [folders, setFolders] = React.useState<MediaFolder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [uploadCount, setUploadCount] = React.useState<{ done: number; total: number } | null>(null)
  const [filter, setFilter] = React.useState<"all" | "folder" | "image" | "video">("all")
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  const [folderPath, setFolderPath] = React.useState<{ id: string, name: string }[]>([])
  const [dragOverFolderId, setDragOverFolderId] = React.useState<string | null>(null)

  const [sortBy, setSortBy] = React.useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc")

  const [previewItem, setPreviewItem] = React.useState<MediaItem | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadMedia = React.useCallback(async () => {
    try {
      // Fetch media in current folder
      const mediaRes = await fetch(`/api/media?folderId=${currentFolderId || "root"}`)
      const mediaJson = await mediaRes.json()
      if (mediaJson.success) setItems(mediaJson.data)

      // Fetch subfolders
      const foldersRes = await fetch(`/api/media/folders?parentId=${currentFolderId || ""}`)
      const foldersJson = await foldersRes.json()
      setFolders(foldersJson)
    } catch {
      toast.error("İçerik yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [currentFolderId])

  const refreshMedia = React.useCallback(async () => {
    setLoading(true)
    await loadMedia()
  }, [loadMedia])

  const createFolder = async () => {
    const name = prompt("Klasör adı:")
    if (!name) return

    try {
      const res = await fetch("/api/media/folders", {
        method: "POST",
        body: JSON.stringify({ name, parentId: currentFolderId })
      })
      if (res.ok) {
        toast.success("Klasör oluşturuldu")
        await refreshMedia()
      }
    } catch {
      toast.error("Klasör oluşturulamadı")
    }
  }

  const deleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Klasörü ve içindeki alt klasörleri silmek istediğinize emin misiniz? Medya dosyaları silinmez, kök dizine taşınır.")) return

    try {
      const res = await fetch(`/api/media/folders/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Klasör silindi")
        await refreshMedia()
      }
    } catch {
      toast.error("Silme hatası")
    }
  }

  const navigateToFolder = (folder: MediaFolder | null) => {
    if (!folder) {
      setLoading(true)
      setCurrentFolderId(null)
      setFolderPath([])
    } else {
      setLoading(true)
      setCurrentFolderId(folder.id)
      // Path management could be more complex, but for simplicity:
      setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }])
    }
  }

  const navigateBack = (index: number) => {
    const newPath = folderPath.slice(0, index + 1)
    setLoading(true)
    setFolderPath(newPath)
    setCurrentFolderId(newPath[newPath.length - 1]?.id || null)
  }

  const moveMedia = async (mediaId: string, folderId: string | null) => {
    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        body: JSON.stringify({ id: mediaId, folderId: folderId || "root" })
      })
      if (res.ok) {
        toast.success("Medya taşındı")
        setItems(prev => prev.filter(i => i.id !== mediaId))
      }
    } catch {
      toast.error("Taşıma hatası")
    }
  }

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("mediaId", id)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
  }

  const onDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    const mediaId = e.dataTransfer.getData("mediaId")
    if (!mediaId) return

    await moveMedia(mediaId, targetFolderId)
  }

  const handleSyncMux = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/media/sync-mux", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        await refreshMedia()
      } else {
        toast.error(data.error || "Senkronizasyon hatası")
      }
    } catch {
      toast.error("Sunucu bağlantı hatası")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMedia()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMedia])

  // Upload a single file. Returns true on success.
  const uploadOne = async (file: File): Promise<boolean> => {
    const isVideo = file.type.startsWith("video/")
    try {
      if (isVideo) {
        const res = await fetch("/api/media/upload-url", {
          method: "POST",
          body: JSON.stringify({ title: file.name, type: "video" }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Yükleme hazırlığı başarısız oldu")
        await fetch(data.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })
        return true
      }
      const formData = new FormData()
      formData.append("file", file)
      if (currentFolderId) formData.append("folderId", currentFolderId)
      const res = await fetch("/api/media/upload", { method: "POST", body: formData })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.details || data?.error || "Dosya yüklenemedi")
      return true
    } catch (err) {
      console.error("[upload]", file.name, err)
      return false
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return

    setUploading(true)
    setUploadCount({ done: 0, total: files.length })

    let ok = 0
    let fail = 0
    let hasVideo = false

    // Sequential upload — keeps the server/Mux from being hammered and
    // lets us report a clean per-file progress count.
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("video/")) hasVideo = true
      const success = await uploadOne(files[i])
      if (success) ok++
      else fail++
      setUploadCount({ done: i + 1, total: files.length })
    }

    setUploading(false)
    setUploadCount(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    if (ok > 0) {
      toast.success(
        `${ok} dosya yüklendi` +
        (fail ? `, ${fail} başarısız` : "") +
        (hasVideo ? " · videolar işleniyor olabilir" : "")
      )
    } else {
      toast.error("Hiçbir dosya yüklenemedi")
    }
    await refreshMedia()
  }

  const deleteItem = async (id: string) => {
    if (!confirm("Bu medyayı silmek istediğinize emin misiniz?")) return

    try {
      await fetch("/api/media", {
        method: "DELETE",
        body: JSON.stringify({ id })
      })
      setItems((prev: MediaItem[]) => prev.filter(i => i.id !== id))
      toast.success("Medya silindi")
    } catch {
      toast.error("Silme hatası")
    }
  }

  const sortItems = <T extends { id: string; createdAt: string; title?: string | null; name?: string; type?: string; size?: number }>(items: T[]) => {
    return [...items].sort((a, b) => {
      let valA: string | number = ""
      let valB: string | number = ""

      if (sortBy === "createdAt") {
        valA = new Date(a.createdAt).getTime()
        valB = new Date(b.createdAt).getTime()
      } else if (sortBy === "title") {
        valA = (a.title || a.name || "").toLowerCase()
        valB = (b.title || b.name || "").toLowerCase()
      } else if (sortBy === "type") {
        valA = (a.type || "folder").toLowerCase()
        valB = (b.type || "folder").toLowerCase()
      } else if (sortBy === "size") {
        valA = a.size || 0
        valB = b.size || 0
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  const filteredItems = items.filter(i => filter === "all" || i.type === filter)
  const sortedItems = sortItems(filteredItems)
  const sortedFolders = sortItems(folders)

  return (
    <div className="p-6 md:p-10 py-8 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#0d0d0d]">
            Medya Kütüphanesi
          </h1>
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <button
              onClick={() => navigateToFolder(null)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, "root")}
              className={cn("text-[11px] font-bold transition-all hover:text-[#ff4fd8] px-1 rounded", !currentFolderId ? "text-[#ff4fd8]" : "text-[#666666] hover:bg-[#f7f7f5]")}
            >
              Dosyalar
            </button>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight size={10} className="text-[#0D0D0D]" />
                <button
                  onClick={() => navigateBack(index)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, folder.id)}
                  className={cn("text-[11px] font-bold transition-all hover:text-[#ff4fd8] px-1 rounded", index === folderPath.length - 1 ? "text-[#ff4fd8]" : "text-[#666666] hover:bg-[#f7f7f5]")}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-3 gap-x-2 sm:gap-x-3">
          {/* Sort Controls */}
          <div className="flex items-center gap-2 md:border-r md:border-[#CCCCCC] md:pr-4">
            <div className="flex bg-[#f7f7f5] h-10 p-1 ff-shape-button border border-[#CCCCCC]">
              {(["createdAt", "title", "type", "size"] as const).map((field) => (
                <button
                  key={field}
                  onClick={() => setSortBy(field)}
                  className={cn(
                    "w-7.5 h-7.5 flex items-center justify-center transition-all ff-shape-button",
                    sortBy === field ? "bg-[#ff4fd8] text-white" : "text-[#666666] hover:text-[#ff4fd8]"
                  )}
                  title={field === "createdAt" ? "Tarih" : field === "title" ? "Ad" : field === "type" ? "Tür" : "Boyut"}
                >
                  {field === "createdAt" ? <Calendar size={14} /> : field === "title" ? <Type size={14} /> : field === "type" ? <ArrowUpDown size={14} /> : <span className="text-[10px] font-bold">KB</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ff-shape-button w-9 h-9 flex items-center justify-center bg-[#f7f7f5] border border-[#CCCCCC] ff-shape-button text-[#666666] hover:text-[#ff4fd8] transition-all"
            >
              {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>

          {/* Filter Tabs — full-width segmented on mobile, inline on desktop */}
          <div className="ff-shape-button order-last md:order-none flex w-full md:w-auto p-1 border border-[#CCCCCC] bg-[#f7f7f5]">
            {(["all", "folder", "image", "video"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "ff-shape-button flex-1 md:flex-none whitespace-nowrap h-7.5 px-3 sm:px-4 py-1 text-[11px] font-bold transition-all",
                  filter === f
                    ? "bg-[#ff4fd8] text-white"
                    : "text-[#666666] hover:text-[#ff4fd8]"
                )}
              >
                {f === "all" ? "Hepsi" : f === "folder" ? "Klasörler" : f === "image" ? "Görseller" : "Videolar"}
              </button>
            ))}
          </div>

          {/* Action buttons — stay grouped so they wrap as one unit on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {can("media", "create") && (
              <button
                onClick={createFolder}
                className="ff-shape-button inline-flex items-center gap-2 h-9 px-4 border border-[#CCCCCC] text-[#666666] font-bold text-[11px] hover:bg-[#f7f7f5] transition-all"
              >
                <FolderPlus size={16} />
                <span className="hidden sm:inline">Klasör</span>
              </button>
            )}

            <button
              onClick={handleSyncMux}
              disabled={loading || uploading}
              title="Mux'tan Videoları Çek"
              className="ff-shape-button inline-flex items-center justify-center w-9 h-9 border border-[#CCCCCC] text-[#666666] hover:text-[#ff4fd8] transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            </button>

            {can("media", "create") && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="ff-shape-button inline-flex items-center gap-2 h-9 px-6 bg-[#ff4fd8] text-white font-bold text-[12px] hover:bg-[#ff4fd8]/90 transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploadCount ? `Yükleniyor ${uploadCount.done}/${uploadCount.total}` : "Yükle"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  multiple
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.tiff"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-[var(--ff-purple)]" size={40} />
        </div>
      ) : (sortedFolders.length === 0 && sortedItems.length === 0) ? (
        <div className="ff-shape-container border border-[#CCCCCC] border-dashed py-32 flex flex-col items-center justify-center text-center">
          <ImageIcon size={24} className="text-[#666666] mb-2" />
          <p className="text-xs text-[#666666]">Henüz içerik yok.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Folders Section - Only show if 'all' or 'folder' filter is active */}
          {(filter === "all" || filter === "folder") && sortedFolders.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-[11px] font-bold text-[#666666]">Klasörler ({sortedFolders.length})</h2>
                <div className="h-px flex-1 bg-[#CCCCCC] opacity-30" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {sortedFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onDoubleClick={() => navigateToFolder(folder)}
                    onDragOver={(e) => {
                      onDragOver(e)
                      setDragOverFolderId(folder.id)
                    }}
                    onDragLeave={() => setDragOverFolderId(null)}
                    onDrop={(e) => {
                      onDrop(e, folder.id)
                      setDragOverFolderId(null)
                    }}
                    className={cn(
                      "group relative ff-shape-container ff-card p-0 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col",
                      dragOverFolderId === folder.id
                        ? "scale-[1.02] shadow-lg"
                        : "hover:shadow-md"
                    )}
                  >
                    {/* Folder Icon Area */}
                    <div className="aspect-square flex flex-col items-center justify-center h-26 transition-colors relative">
                      <Folder size={36} className={cn(
                        "transition-all duration-300",
                        dragOverFolderId === folder.id ? "text-[#ff4fd8] scale-110" : "text-[#ff4fd8] opacity-80 group-hover:opacity-100 group-hover:scale-110"
                      )} />

                      {/* Folder Actions */}
                      {can("media", "delete") && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => deleteFolder(folder.id, e)}
                            className="w-7 h-7 ff-shape-button bg-[#ff4fd8]/10 shadow-sm border border-[#ff4fd8]/10 text-[#ff4fd8] flex items-center justify-center hover:bg-[#ff4fd8]/10 hover:text-[#ff4fd8] transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Folder Info Area */}
                    <div className="p-3 border-t border-[#CCCCCC] h-[64px] flex flex-col justify-center">
                      <p className="text-[12px] font-bold text-[#333333] truncate">
                        {folder.name}
                      </p>
                      <p className="text-[10px] text-[#666666] mt-0.5 truncate">
                        {folder._count?.media || 0} Dosya / {folder._count?.children || 0} Klasör
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Items Section - Only show if not 'folder' filter is active */}
          {filter !== "folder" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-[11px] font-bold text-[#666666]">Dosyalar ({sortedItems.length})</h2>
                <div className="h-px flex-1 bg-[#CCCCCC] opacity-30" />
              </div>

              {sortedItems.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-[#CCCCCC] ff-shape-container">
                  <p className="text-xs text-[#666666]">Seçili kategoride dosya bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {sortedItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.id)}
                      className="group relative ff-shape-container ff-card p-0 overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col"
                    >
                      {/* Preview Area */}
                      <div className="aspect-square h-26 relative overflow-hidden bg-[#f7f7f5] flex items-center justify-center">
                        {item.type === "image" ? (
                          <Image
                            src={item.url}
                            alt={item.title || ""}
                            fill
                            unoptimized
                            sizes="(min-width: 1280px) 12.5vw, (min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : item.type === "video" ? (
                          <div className="w-full h-full relative">
                            {item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.title || ""}
                                fill
                                unoptimized
                                sizes="(min-width: 1280px) 12.5vw, (min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                                className="object-cover opacity-60"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#F0F0F0]">
                                <Video size={18} className="text-[#666666]" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              {item.muxStatus === "ready" ? (
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-[#ff4fd8] text-[#ff4fd8] group-hover:scale-110 transition-transform">
                                  <Play size={18} className="ml-1" />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="animate-spin text-[#ff4fd8]" size={20} />
                                  <span className="text-[9px] text-[#ff4fd8]">İşleniyor</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f7f5] text-[#666666]">
                            {item.type === "pdf" ? (
                              <FileText size={48} className="text-red-500/80 mb-2" />
                            ) : (
                              <File size={48} className="text-blue-500/80 mb-2" />
                            )}
                            <span className="text-[10px] font-bold opacity-60 px-3 text-center truncate w-full">
                              {item.title?.split('.').pop() || "DOSYA"}
                            </span>
                          </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-[#F0F0F0]/40 backdrop-blur-xs group opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="w-8 h-8 ff-shape-button bg-white text-black flex items-center justify-center hover:bg-[var(--ff-purple)] hover:text-white transition-colors"
                            title="Büyüt"
                          >
                            <ZoomIn size={14} />
                          </button>
                          <button
                            onClick={() => window.open(item.url, '_blank')}
                            className="w-8 h-8 ff-shape-button bg-white text-black flex items-center justify-center hover:bg-[var(--ff-purple)] hover:text-white transition-colors"
                            title="Yeni Sekmede Aç"
                          >
                            <ExternalLink size={14} />
                          </button>
                          {can("media", "delete") && (
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="w-8 h-8 ff-shape-button bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-3 border-t border-[#CCCCCC] bg-[#f7f7f5] h-[64px] flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-[#666666] truncate mb-1" title={item.title || ""}>
                          {item.title || "Adsız Medya"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="ff-shape-button px-2.5 py-0.5 rounded-sm bg-[#f7f7f5] border border-[#CCCCCC] text-[8px] font-bold text-[#ff4fd8]">
                              {item.mimeType?.split('/').pop()?.toUpperCase() || item.type.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-[#666666] font-medium">
                              {item.type === "video" && item.height ? (
                                item.height >= 2160 ? "4K" :
                                  item.height >= 1080 ? "1080p" :
                                    item.height >= 720 ? "720p" :
                                      item.height + "p"
                              ) : (
                                item.size ? (item.size / (1024 * 1024)).toFixed(2) + " MB" : "0.00 MB"
                              )}
                            </span>
                          </div>
                          <span className="text-[8px] text-[var(--foreground-faint)]">
                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Lightbox Preview */}
      <Dialog.Root open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] animate-ff-fadeIn" />
          <Dialog.Content className="fixed inset-4 md:inset-10 z-[201] flex flex-col items-center justify-center outline-none">
            <div className="relative w-full h-full flex items-center justify-center">
              {previewItem?.type === "image" ? (
                <div className="ff-shape-container relative w-full h-full max-w-full max-h-[calc(75vh)] bg-surface/75 border-[var(--border)] shadow-2xl rounded-lg animate-ff-scaleIn">
                  <Image
                    src={previewItem.url}
                    alt={previewItem.title || ""}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="object-contain p-4"
                  />
                </div>
              ) : previewItem?.type === "video" ? (
                <div className="w-full max-w-4xl aspect-video ff-shape-container overflow-hidden shadow-2xl animate-ff-scaleIn">
                  <MuxPlayer
                    playbackId={previewItem.muxPlaybackId || ""}
                    autoPlay
                    className="w-full h-full"
                    streamType="on-demand"
                  />
                </div>
              ) : (
                <div className="bg-[var(--surface)] p-10 ff-shape-container border border-[#CCCCCC] flex flex-col items-center gap-4 animate-ff-scaleIn">
                  <FileText size={80} className="text-[var(--ff-purple)]" />
                  <p className="text-xl font-bold">{previewItem?.title}</p>
                  <button
                    onClick={() => window.open(previewItem?.url, '_blank')}
                    className="ff-shape-button px-6 py-2 bg-[var(--ff-purple)] text-white font-bold"
                  >
                    Dosyayı Aç
                  </button>
                </div>
              )}

              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 backdrop-blur-md"
              >
                <XIcon size={24} />
              </button>
            </div>

            {previewItem && (
              <div className="mt-4 max-w-[92vw] px-4 sm:px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 ff-shape-container text-white flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6 animate-ff-slideUp">
                <div className="min-w-0">
                  <p className="text-sm font-bold opacity-60">Dosya Adı</p>
                  <p className="text-md font-medium truncate max-w-[70vw] sm:max-w-[16rem]">{previewItem.title}</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10" />
                <div>
                  <p className="text-sm font-bold opacity-60">Boyut</p>
                  <p className="text-md font-medium">{(previewItem.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10" />
                <div>
                  <p className="text-sm font-bold opacity-60">Tür</p>
                  <p className="text-md font-medium">{previewItem.mimeType?.split('/').pop()}</p>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
