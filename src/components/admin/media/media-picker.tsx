"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import {
  X,
  Search,
  Image as ImageIcon,
  Video,
  Loader2,
  Check,
  LayoutGrid,
  Columns,
  ChevronRight,
  Folder
} from "@/lib/icons"
import { cn } from "@/lib/utils"

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
  createdAt: string
  size: number
  folderId: string | null
}

interface MediaPickerProps {
  onSelect: (url: string, type: string) => void
  onClose: () => void
  allowedTypes?: string[]
  /** Allow selecting more than one file at once. */
  multiple?: boolean
  /** Called with all chosen files when `multiple` is enabled. */
  onSelectMany?: (items: { url: string; type: string }[]) => void
}

interface ColumnData {
  folderId: string | null
  folderName: string
  folders: MediaFolder[]
  items: MediaItem[]
  selectedId: string | null
  selectedType: "folder" | "file" | null
  previewItem?: MediaItem | null
}

export function MediaPicker({ onSelect, onClose, allowedTypes = ["image", "video"], multiple = false, onSelectMany }: MediaPickerProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "columns">("grid")
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null)
  // Multi-select buffer (only used when `multiple` is true).
  const [multiSelected, setMultiSelected] = React.useState<MediaItem[]>([])

  const isItemSelected = (item: MediaItem) =>
    multiple ? multiSelected.some((s) => s.id === item.id) : selectedItem?.id === item.id

  const toggleMulti = (item: MediaItem) =>
    setMultiSelected((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev.filter((s) => s.id !== item.id)
        : [...prev, item]
    )

  // Click handler shared by grid + column file tiles.
  const handlePick = (item: MediaItem) => {
    if (multiple) toggleMulti(item)
    else setSelectedItem(item)
  }

  const handleConfirm = () => {
    if (multiple) {
      if (multiSelected.length && onSelectMany) {
        onSelectMany(multiSelected.map((i) => ({ url: i.url, type: i.type })))
      }
    } else if (selectedItem) {
      onSelect(selectedItem.url, selectedItem.type)
    }
  }

  // ── Grid View States ──────────────────────────────
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  const [folderPath, setFolderPath] = React.useState<{ id: string; name: string }[]>([])
  const [gridFolders, setGridFolders] = React.useState<MediaFolder[]>([])
  const [gridItems, setGridItems] = React.useState<MediaItem[]>([])

  // ── macOS Column View States ──────────────────────
  const [columns, setColumns] = React.useState<ColumnData[]>([])

  // ── Helper: load content for a folder ─────────────
  const fetchFolderContent = React.useCallback(async (folderId: string | null) => {
    try {
      const mediaRes = await fetch(`/api/media?folderId=${folderId || "root"}`)
      const mediaJson = await mediaRes.json()
      const fetchedItems: MediaItem[] = mediaJson.success ? mediaJson.data : []

      const foldersRes = await fetch(`/api/media/folders?parentId=${folderId || ""}`)
      const fetchedFolders: MediaFolder[] = await foldersRes.json()

      // Filter files by allowedTypes
      const filteredItems = fetchedItems.filter(item => allowedTypes.includes(item.type))

      return { folders: fetchedFolders, items: filteredItems }
    } catch (err) {
      console.error("Folder fetch error:", err)
      return { folders: [], items: [] }
    }
  }, [allowedTypes])

  // ── Initialize ──────────────────────────────────
  React.useEffect(() => {
    async function init() {
      setLoading(true)
      const data = await fetchFolderContent(null)
      setGridFolders(data.folders)
      setGridItems(data.items)

      // Initialize root column
      setColumns([
        {
          folderId: null,
          folderName: "Dosyalar",
          folders: data.folders,
          items: data.items,
          selectedId: null,
          selectedType: null,
        }
      ])
      setLoading(false)
    }
    void init()
  }, [fetchFolderContent])

  // ── Grid View Actions ────────────────────────────
  const navigateToFolder = async (folder: MediaFolder) => {
    setLoading(true)
    const data = await fetchFolderContent(folder.id)
    setGridFolders(data.folders)
    setGridItems(data.items)
    setCurrentFolderId(folder.id)
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }])
    setSelectedItem(null)
    setLoading(false)
  }

  const navigateBack = async (index: number) => {
    setLoading(true)
    const newPath = folderPath.slice(0, index + 1)
    const targetFolderId = newPath[newPath.length - 1]?.id || null

    const data = await fetchFolderContent(targetFolderId)
    setGridFolders(data.folders)
    setGridItems(data.items)
    setCurrentFolderId(targetFolderId)
    setFolderPath(newPath)
    setSelectedItem(null)
    setLoading(false)
  }

  const navigateToRoot = async () => {
    setLoading(true)
    const data = await fetchFolderContent(null)
    setGridFolders(data.folders)
    setGridItems(data.items)
    setCurrentFolderId(null)
    setFolderPath([])
    setSelectedItem(null)
    setLoading(false)
  }

  // ── macOS Column View Actions ────────────────────
  const handleColumnFolderClick = async (folder: MediaFolder, colIndex: number) => {
    const nextColumns = columns.slice(0, colIndex + 1)
    
    // Mark folder as selected in this column
    nextColumns[colIndex] = {
      ...nextColumns[colIndex],
      selectedId: folder.id,
      selectedType: "folder",
      previewItem: null
    }

    setColumns(nextColumns)
    setSelectedItem(null)

    // Fetch and append next column
    const data = await fetchFolderContent(folder.id)
    setColumns(_prev => [
      ...nextColumns,
      {
        folderId: folder.id,
        folderName: folder.name,
        folders: data.folders,
        items: data.items,
        selectedId: null,
        selectedType: null
      }
    ])
  }

  const handleColumnFileClick = (item: MediaItem, colIndex: number) => {
    const nextColumns = columns.slice(0, colIndex + 1)

    // Mark file as selected in this column (drives the preview panel)
    nextColumns[colIndex] = {
      ...nextColumns[colIndex],
      selectedId: item.id,
      selectedType: "file",
      previewItem: item
    }

    setColumns(nextColumns)
    setSelectedItem(item)
    if (multiple) toggleMulti(item)
  }

  // ── Filtering ────────────────────────────────────
  const filterFolders = (list: MediaFolder[]) => {
    return list.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  }

  const filterItems = (list: MediaItem[]) => {
    return list.filter(i => (i.title || "").toLowerCase().includes(search.toLowerCase()))
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl h-[85vh] bg-[#F7F7F5] border border-[#CCCCCC] shadow-2xl z-[101] flex flex-col ff-shape-container animate-in zoom-in-95 duration-150 overflow-hidden">
          
          {/* ── Top Bar / Header ───────────────────────── */}
          <div className="p-4 px-6 border-b border-[#CCCCCC] bg-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Dialog.Title className="text-lg font-display font-extrabold text-[#333333] tracking-tight">
                  Medya Seçici
                </Dialog.Title>
                <Dialog.Description className="text-[11px] text-[#666666] mt-0.5">
                  Projeniz için görseller veya videolar seçin.
                </Dialog.Description>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex bg-[#F7F7F5] border border-[#CCCCCC] p-0.5 ff-shape-container shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("grid")
                    setSelectedItem(null)
                  }}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center transition-all ff-shape-button",
                    viewMode === "grid" ? "bg-white border border-[#CCCCCC] text-[#ff4fd8] shadow-sm" : "text-[#666666] hover:text-[#ff4fd8]"
                  )}
                  title="Izgara Görünümü"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("columns")
                    setSelectedItem(null)
                  }}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center transition-all ff-shape-button",
                    viewMode === "columns" ? "bg-white border border-[#CCCCCC] text-[#ff4fd8] shadow-sm" : "text-[#666666] hover:text-[#ff4fd8]"
                  )}
                  title="Finder Sütun Görünümü"
                >
                  <Columns size={15} />
                </button>
              </div>
            </div>

            <button onClick={onClose} className="p-2 border border-[#E0E0E0] bg-white hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-colors ff-shape-button">
              <X size={16} />
            </button>
          </div>

          {/* ── Search & Navigation ─────────────────────── */}
          <div className="p-3 px-6 bg-white border-b border-[#CCCCCC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Breadcrumbs for Grid View */}
            {viewMode === "grid" ? (
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold text-[#666666]">
                <button
                  onClick={navigateToRoot}
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-all hover:bg-[#F0F0F0] hover:text-[#ff4fd8]",
                    !currentFolderId && "text-[#ff4fd8]"
                  )}
                >
                  Dosyalar
                </button>
                {folderPath.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight size={10} className="text-[#999999]" />
                    <button
                      onClick={() => navigateBack(index)}
                      className={cn(
                        "px-1.5 py-0.5 rounded transition-all hover:bg-[#F0F0F0] hover:text-[#ff4fd8] truncate max-w-[120px]",
                        index === folderPath.length - 1 && "text-[#ff4fd8]"
                      )}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-[11px] font-bold text-[#666666] flex items-center gap-1.5">
                <Columns size={12} className="text-[#ff4fd8]" />
                macOS Finder Sütunları
              </div>
            )}

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" size={14} />
              <input
                type="text"
                placeholder="Dosya ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#f7f7f5] border border-[#CCCCCC] placeholder:text-[#999999] text-xs h-8 pl-9 pr-4 outline-none focus:border-[#ff4fd8] transition-colors ff-shape-container"
              />
            </div>
          </div>

          {/* ── Main View Content ──────────────────────── */}
          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F7F7F5]">
                <Loader2 className="animate-spin text-[#ff4fd8]" size={36} />
              </div>
            ) : viewMode === "grid" ? (
              // ── GRID VIEW ─────────────────────────────────
              <div className="h-full overflow-y-auto p-6 space-y-6">
                {/* Folders list */}
                {filterFolders(gridFolders).length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block">Klasörler</span>
                    <div className="flex flex-wrap gap-2.5">
                      {filterFolders(gridFolders).map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => navigateToFolder(folder)}
                          className="group border border-[#CCCCCC] bg-white hover:border-[#ff4fd8] hover:shadow-sm transition-all p-2.5 px-3.5 flex items-center gap-2 text-left ff-shape-container w-fit shrink-0"
                        >
                          <Folder size={16} className="text-[#ff4fd8]/80 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="text-xs font-bold text-[#333333] whitespace-nowrap">{folder.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Grid */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block">Dosyalar</span>
                  
                  {filterItems(gridItems).length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#CCCCCC] ff-shape-container bg-white text-xs text-[#999999]">
                      Burada dosya bulunamadı.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {filterItems(gridItems).map((item) => {
                        const isSelected = isItemSelected(item)
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handlePick(item)}
                            onDoubleClick={() => { if (multiple) { toggleMulti(item) } else { onSelect(item.url, item.type) } }}
                            className={cn(
                              "group relative aspect-square bg-white border transition-all overflow-hidden flex flex-col ff-shape-container",
                              isSelected
                                ? "border-[#ff4fd8] ring-4 ring-[#ff4fd8]/20 scale-[0.98] shadow-sm"
                                : "border-[#CCCCCC] hover:border-[#ff4fd8]"
                            )}
                          >
                            <div className="flex-1 w-full relative overflow-hidden bg-[#f7f7f5] flex items-center justify-center">
                              {item.type === "image" ? (
                                <img src={item.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {item.thumbnail ? (
                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover opacity-60" />
                                  ) : (
                                    <Video size={20} className="text-[#666666]" />
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Title overlay */}
                            <div className="p-1 px-2 border-t border-[#E0E0E0] w-full bg-white h-7 flex items-center">
                              <span className="text-[10px] text-[#666666] truncate font-medium w-full text-left">{item.title || "Adsız"}</span>
                            </div>

                            {/* Checked overlay */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#ff4fd8] text-white rounded-full flex items-center justify-center shadow animate-in zoom-in-50 duration-150">
                                <Check size={11} className="stroke-[3]" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // ── macOS COLUMN VIEW ─────────────────────────
              <div className="h-full flex overflow-x-auto overflow-y-hidden bg-white border-b border-[#CCCCCC]">
                {columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className="min-w-[14rem] max-w-[20rem] w-fit border-r border-[#CCCCCC] flex flex-col shrink-0 h-full bg-white overflow-y-auto"
                  >
                    <div className="p-2 border-b border-[#F0F0F0] bg-[#f7f7f5] text-[10px] font-bold text-[#666666] uppercase tracking-wider truncate">
                      {column.folderName}
                    </div>

                    {/* Column List */}
                    <div className="flex-1 py-1.5">
                      {/* Folders in column */}
                      {filterFolders(column.folders).map((folder) => {
                        const isSelected = column.selectedId === folder.id && column.selectedType === "folder"
                        return (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => handleColumnFolderClick(folder, colIndex)}
                            className={cn(
                              "w-full min-w-max px-3 py-1.5 flex items-center justify-between gap-6 text-left transition-all text-xs font-semibold",
                              isSelected ? "bg-[#ff4fd8]/10 text-[#ff4fd8]" : "text-[#333333] hover:bg-[#F7F7F5]"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Folder size={14} className={isSelected ? "text-[#ff4fd8]" : "text-[#999999]"} />
                              <span className="whitespace-nowrap">{folder.name}</span>
                            </div>
                            <ChevronRight size={12} className={isSelected ? "text-[#ff4fd8]" : "text-[#CCCCCC]"} />
                          </button>
                        )
                      })}

                      {/* Files in column */}
                      {filterItems(column.items).map((item) => {
                        const isSelected = multiple
                          ? isItemSelected(item)
                          : (column.selectedId === item.id && column.selectedType === "file")
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleColumnFileClick(item, colIndex)}
                            onDoubleClick={() => { if (multiple) { toggleMulti(item) } else { onSelect(item.url, item.type) } }}
                            className={cn(
                              "w-full min-w-max px-3 py-1.5 flex items-center justify-between gap-6 text-left transition-all text-xs font-semibold",
                              isSelected ? "bg-[#ff4fd8]/10 text-[#ff4fd8]" : "text-[#666666] hover:bg-[#F7F7F5]"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {item.type === "image" ? (
                                <ImageIcon size={14} className={isSelected ? "text-[#ff4fd8]" : "text-[#999999]"} />
                              ) : (
                                <Video size={14} className={isSelected ? "text-[#ff4fd8]" : "text-[#999999]"} />
                              )}
                              <span className="whitespace-nowrap">{item.title || "Adsız"}</span>
                            </div>
                          </button>
                        )
                      })}

                      {column.folders.length === 0 && column.items.length === 0 && (
                        <div className="text-center py-8 text-[11px] text-[#CCCCCC] font-semibold">Boş Klasör</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* macOS Detail Preview Panel */}
                {selectedItem && (
                  <div className="w-80 border-r border-[#CCCCCC] flex flex-col shrink-0 h-full bg-[#f7f7f5] overflow-y-auto p-5 space-y-4">
                    <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block border-b border-[#E0E0E0] pb-1.5">Önizleme</span>
                    
                    {/* Media Thumbnail */}
                    <div className="aspect-video w-full ff-shape-container border border-[#E0E0E0] bg-white flex items-center justify-center overflow-hidden shadow-sm relative">
                      {selectedItem.type === "image" ? (
                        <img src={selectedItem.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F7F7F5]">
                          {selectedItem.thumbnail ? (
                            <img src={selectedItem.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <Video size={24} className="text-[#666666]" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Card */}
                    <div className="space-y-2.5 text-xs text-[#333333]">
                      <div>
                        <span className="text-[10px] font-bold text-[#999999] block">Ad</span>
                        <span className="font-semibold break-all">{selectedItem.title || "Adsız"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#999999] block">Tür</span>
                        <span className="ff-shape-button inline-block px-2 py-0.5 rounded-sm bg-white border border-[#E0E0E0] text-[9px] font-bold text-[#ff4fd8] mt-0.5">
                          {selectedItem.mimeType?.split("/").pop()?.toUpperCase() || selectedItem.type.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#999999] block">Boyut</span>
                        <span className="font-semibold">{(selectedItem.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#999999] block">Oluşturulma</span>
                        <span className="font-semibold">{new Date(selectedItem.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────── */}
          <div className="p-4 px-6 border-t border-[#CCCCCC] bg-white flex items-center justify-between">
            <div className="text-[11px] text-[#888888] font-semibold">
              {multiple ? (
                multiSelected.length > 0 ? (
                  <span><strong className="text-[#ff4fd8]">{multiSelected.length}</strong> dosya seçildi</span>
                ) : (
                  <span>Birden fazla dosya seçebilirsiniz.</span>
                )
              ) : selectedItem ? (
                <span>Seçilen: <strong className="text-[#ff4fd8]">{selectedItem.title || "Adsız"}</strong></span>
              ) : (
                <span>Bir dosya seçin veya çift tıklayın.</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="ff-shape-button px-5 h-9 border border-[#CCCCCC] text-[#666666] text-xs font-bold hover:bg-[#ff4fd8]/5 hover:text-[#ff4fd8] hover:border-[#ff4fd8]/30 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={multiple ? multiSelected.length === 0 : !selectedItem}
                onClick={handleConfirm}
                className="ff-shape-button px-6 h-9 bg-[#ff4fd8] text-white text-xs font-bold hover:opacity-95 transition-all disabled:opacity-50"
              >
                {multiple ? `Seç ve Ekle${multiSelected.length ? ` (${multiSelected.length})` : ""}` : "Seç ve Ekle"}
              </button>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
