"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Delete Page Button with Confirm Dialog
// Uses @radix-ui/react-dialog
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Trash2, X } from "@/lib/icons"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DeletePageButtonProps {
  pageId: string
  pageTitle: string
}

export function DeletePageButton({ pageId, pageTitle }: DeletePageButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/pages/${pageId}`, { method: "DELETE" })
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error("[DeletePage] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="ff-shape-button w-9 h-9 flex items-center justify-center border border-[#CCCCCC] text-[#666666] hover:border-red-500/50 hover:text-red-400 transition-colors duration-150"
          aria-label={`${pageTitle} sayfasını sil`}
        >
          <Trash2 size={14} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <Dialog.Content
          className={cn(
            "ff-shape-container fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md",
            "bg-[var(--surface)] border border-[var(--border)]",
            "p-6 shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2"
          )}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[var(--foreground-faint)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Kapat"
            >
              <X size={14} />
            </button>
          </Dialog.Close>

          {/* Icon */}
          <div className="ff-shape-button w-10 h-10 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-4">
            <Trash2 size={18} className="text-red-400" />
          </div>

          <Dialog.Title className="text-base font-semibold text-[var(--foreground)] mb-2">
            Sayfayı Sil
          </Dialog.Title>

          <Dialog.Description className="text-sm text-[var(--foreground-muted)] mb-6">
            <strong className="text-[var(--foreground)]">{pageTitle}</strong> sayfasını
            silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Dialog.Description>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Dialog.Close asChild>
              <button
                className="ff-shape-button px-4 py-2 text-[11px] font-medium uppercase tracking-wider border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)] transition-colors"
                disabled={loading}
              >
                Vazgeç
              </button>
            </Dialog.Close>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="ff-shape-button flex items-center gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-wider bg-red-600 text-white border border-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              )}
              <Trash2 size={11} />
              Sil
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
