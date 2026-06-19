"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "@/lib/icons"
import { FFButton } from "@/components/ui/ff-button"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

interface DeleteRoleButtonProps {
  roleId: string
  roleName: string
  isSystem: boolean
  userCount: number
}

export function DeleteRoleButton({ roleId, roleName, isSystem, userCount }: DeleteRoleButtonProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canDelete = !isSystem && userCount === 0

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/roles/${roleId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Silinemedi.")
        setLoading(false)
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError("Bağlantı hatası.")
      setLoading(false)
    }
  }

  if (!canDelete) {
    return (
      <FFButton
        variant="ghost"
        size="sm"
        leftIcon={<Trash2 className="w-3.5 h-3.5 text-[var(--error)]" />}
        disabled
        title={isSystem ? "Sistem rolü silinemez" : `${userCount} kullanıcı bu rolü kullanıyor`}
        className="text-[var(--error)] cursor-not-allowed"
      >
        Sil
      </FFButton>
    )
  }

  return (
    <>
      <FFButton
        variant="ghost"
        size="sm"
        leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
        className="text-red-500 hover:text-red-400"
        onClick={() => setOpen(true)}
      >
        Sil
      </FFButton>

      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={`"${roleName}" rolünü sil`}
        description={`"${roleName}" rolü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        onConfirm={handleDelete}
        loading={loading}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </>
  )
}
