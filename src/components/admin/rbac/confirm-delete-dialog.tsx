"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AlertTriangle, X } from "@/lib/icons"
import { motion, AnimatePresence } from "framer-motion"
import { FFButton } from "@/components/ui/ff-button"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Sil",
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Panel */}
            <Dialog.Content asChild>
              <motion.div
                className="ff-shape-container fixed z-50 left-1/2 top-1/2 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2
                           bg-[var(--surface)] border border-[var(--border)] shadow-2xl outline-none"
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="ff-shape-button flex items-center justify-center w-10 h-10 bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </span>
                    <Dialog.Title className="font-display text-base font-bold text-[var(--foreground)]">
                      {title}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors p-1"
                      aria-label="Kapat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <Dialog.Description className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                    {description}
                  </Dialog.Description>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 pb-6">
                  <Dialog.Close asChild>
                    <FFButton variant="ghost" size="sm" disabled={loading}>
                      İptal
                    </FFButton>
                  </Dialog.Close>
                  <FFButton
                    variant="destructive"
                    size="sm"
                    loading={loading}
                    onClick={handleConfirm}
                  >
                    {confirmLabel}
                  </FFButton>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
