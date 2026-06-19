"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "@/lib/icons"
import { FFButton } from "@/components/ui/ff-button"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

interface DeleteUserButtonProps {
  userId: string
  userName: string
  isSelf: boolean
}

export function DeleteUserButton({ userId, userName, isSelf }: DeleteUserButtonProps) {
  const router = useRouter()
  const [open, setOpen]       = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError]     = React.useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setError(json.message ?? "Silinemedi.")
        setLoading(false)
        return
      }
      setOpen(false)
      router.push("/admin/kullanicilar")
    } catch {
      setError("Bağlantı hatası.")
      setLoading(false)
    }
  }

  if (isSelf) {
    return (
      <FFButton
        variant="ghost"
        size="sm"
        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        disabled
        title="Kendi hesabınızı silemezsiniz"
        className="opacity-30 cursor-not-allowed"
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
        title={`"${userName}" kullanıcısını sil`}
        description={`"${userName}" hesabı kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        onConfirm={handleDelete}
        loading={loading}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </>
  )
}
