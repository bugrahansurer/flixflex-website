"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — MotionDesignPicker (admin)
// Hizmet editöründe "Motion Design Seç" — canlı önizlemeli, silinemez
// kod-tabanlı motion galerisi. Seçim hizmetin motionDesign alanına yazılır;
// "Otomatik" seçilirse hizmet adından otomatik eşlenir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Sparkles, Check, X } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { MOTION_DESIGN_LIST, MOTION_DESIGNS, MotionStage } from "@/components/public/services/motion-designs"

interface MotionDesignPickerProps {
  value?: string | null
  onChange: (value: string | null) => void
}

export function MotionDesignPicker({ value, onChange }: MotionDesignPickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? MOTION_DESIGNS[value] : null
  const presets = MOTION_DESIGN_LIST.filter((d) => d.id !== "default-orbit")

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#888888]">Motion Design</label>

      {/* Trigger — seçili önizleme */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ff-shape-button flex items-center gap-3 border border-[#CCCCCC] bg-transparent px-3 py-2.5 text-left transition-colors hover:border-[#ff4fd8]"
      >
        <span className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded-md">
          {selected ? (
            <MotionStage design={selected} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-[#0c0c11] text-[9px] text-white/55">Otomatik</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-[#333333]">
            {selected ? selected.label : "Otomatik (hizmete göre)"}
          </span>
          <span className="block text-[10px] text-[#888888]">Değiştirmek için tıkla</span>
        </span>
        <Sparkles className="h-4 w-4 text-[#ff4fd8]" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="ff-shape-container fixed left-1/2 top-1/2 z-50 flex max-h-[82vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border border-[#CCCCCC] bg-[#F7F7F5] shadow-2xl outline-none animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] px-6 py-4">
              <div>
                <Dialog.Title className="text-sm font-extrabold text-[#333333]">Motion Design Seç</Dialog.Title>
                <Dialog.Description className="text-[10px] text-[#888888]">
                  Hizmet kartında oynayacak canlı animasyonu seç
                </Dialog.Description>
              </div>
              <Dialog.Close className="ff-shape-button flex h-8 w-8 items-center justify-center text-[#888888] transition-colors hover:bg-black/5 hover:text-[#333333]">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* Otomatik */}
                <button
                  type="button"
                  onClick={() => { onChange(null); setOpen(false) }}
                  className={cn(
                    "ff-shape-container group overflow-hidden border bg-white text-left transition-colors",
                    !value ? "border-[#ff4fd8] ring-2 ring-[#ff4fd8]/30" : "border-[#E0E0E0] hover:border-[#ff4fd8]/50",
                  )}
                >
                  <span className="flex h-24 w-full items-center justify-center bg-[#0c0c11] text-[11px] text-white/60">
                    Otomatik (hizmete göre)
                  </span>
                  <span className="flex items-center justify-between px-3 py-2">
                    <span className="text-[11px] font-medium text-[#333333]">Otomatik</span>
                    {!value && <Check className="h-3.5 w-3.5 text-[#ff4fd8]" />}
                  </span>
                </button>

                {presets.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => { onChange(d.id); setOpen(false) }}
                    className={cn(
                      "ff-shape-container group overflow-hidden border bg-white text-left transition-colors",
                      value === d.id ? "border-[#ff4fd8] ring-2 ring-[#ff4fd8]/30" : "border-[#E0E0E0] hover:border-[#ff4fd8]/50",
                    )}
                  >
                    <span className="relative block h-24 w-full overflow-hidden">
                      <MotionStage design={d} />
                    </span>
                    <span className="flex items-center justify-between px-3 py-2">
                      <span className="truncate text-[11px] font-medium text-[#333333]">{d.label}</span>
                      {value === d.id && <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#ff4fd8]" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
