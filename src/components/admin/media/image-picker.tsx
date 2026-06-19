"use client"

import * as React from "react"
import Image from "next/image"
import { Image as ImageIcon, Upload, X, Search, Check, Loader2 } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { FFButton, FFInput } from "@/components/ui"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"

interface MediaItem {
  id: string
  title: string | null
  type: string
  url: string
  thumbnail: string | null
}

interface ImagePickerProps {
  value: string
  onChange: (url: string) => void
  label: string
}

export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [items, setItems] = React.useState<MediaItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const loadMedia = React.useCallback(async () => {
    try {
      const res = await fetch("/api/media?type=image")
      const json = await res.json()
      if (json.success) setItems(json.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const openPicker = () => {
    setLoading(true)
    setIsOpen(true)
  }

  React.useEffect(() => {
    if (!isOpen) return

    const timeoutId = window.setTimeout(() => {
      void loadMedia()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isOpen, loadMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.details || json?.error || "Görsel yüklenemedi")
      }

      if (json.success) {
        setItems((prev) => [json.data, ...prev])
        onChange(json.data.url)
        setIsOpen(false)
        toast.success("Görsel yüklendi")
      }
    } catch (err: unknown) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Görsel yüklenemedi")
    } finally {
      setUploading(false)
    }
  }

  const filteredItems = items.filter((item) =>
    (item.title || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#333333]">
        {label}
      </label>

      <div className="flex gap-4 items-start">
        <div
          className={cn(
            "ff-shape-container relative w-24 h-24 border border-[#CCCCCC] bg-[#f7f7f5] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#ff4fd8] transition-all",
            !value && "border-dashed"
          )}
          onClick={openPicker}
        >
          {value ? (
            <Image
              src={value}
              alt="Seçili"
              fill
              unoptimized
              sizes="96px"
              className="object-contain p-2"
            />
          ) : (
            <ImageIcon className="text-[#333333]" size={24} />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <FFInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Görsel URL veya seçin..."
            className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999] pr-12"
          />
          <div className="flex gap-2">
            <FFButton
              type="button"
              variant="outline"
              size="sm"
              className="bg-transparent border border-[#FF4FD8] text-[#FF4FD8] text-[10px] h-8"
              onClick={openPicker}
            >
              <Search size={12} className="mr-2" />
              Kütüphaneden Seç
            </FFButton>
            {value && (
              <FFButton
                type="button"
                variant="ghost"
                size="sm"
                className="ff-shape-button bg-transparent hover:bg-red-500 border border-red-500 text-[10px] h-8 text-red-500 hover:text-white transition-colors"
                onClick={() => onChange("")}
              >
                <X size={12} className="mr-2" />
                Kaldır
              </FFButton>
            )}
          </div>
        </div>
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-ff-fadeIn" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] w-[95%] md:max-w-5xl max-h-[85vh] bg-[#f7f7f5] border border-[#CCCCCC] shadow-2xl z-[101] flex flex-col ff-shape-container overflow-hidden">
            <div className="p-4 border-b border-[#CCCCCC] flex items-center justify-between">
              <Dialog.Title className="text-[24px] font-display font-bold">Medya Seç</Dialog.Title>
              <Dialog.Description className="sr-only">
                Medya kütüphanesinden görsel seçin veya yeni bir dosya yükleyin.
              </Dialog.Description>
              <button onClick={() => setIsOpen(false)} className="bg-transparent border-none hover:bg-e text-[#333333] hover:text-[#ff4fd8] cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-[#CCCCCC] flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]" size={16} />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ff-shape-button w-full pl-10 pr-4 h-10 bg-[#f7f7f5] border border-[#CCCCCC] text-sm outline-none focus:border-[#ff4fd8]"
                />
              </div>
              <FFButton
                onClick={() => document.getElementById("picker-upload")?.click()}
                disabled={uploading}
                className="h-10 px-6"
              >
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} className="mr-2" />}
                Yükle
              </FFButton>
              <input
                id="picker-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#ff4fd8]" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onChange(item.url)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "group relative aspect-square ff-shape-container w-30 h-30 border border-[#CCCCCC] bg-[#f7f7f5] cursor-pointer hover:border-[#ff4fd8] transition-all overflow-hidden",
                        value === item.url && "border-[#ff4fd8] ring-2 ring-[#ff4fd8]/20"
                      )}
                    >
                      <Image
                        src={item.url}
                        alt={item.title || ""}
                        fill
                        unoptimized
                        sizes="120px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                      {value === item.url && (
                        <div className="absolute inset-0 bg-[#ff4fd8]/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#ff4fd8] text-white flex items-center justify-center shadow-lg">
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
