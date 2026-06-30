"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, ArrowRight } from "@/lib/icons"
import { FFButton } from "@/components/ui/ff-button"
import { FFInput, FFTextarea } from "@/components/ui/ff-input"
import { FFBadge } from "@/components/ui/ff-badge"
import { createRoleSchema, updateRoleSchema, type CreateRoleData, type UpdateRoleData } from "@/lib/validators/role-schema"
import { slugifyTr } from "@/lib/utils"
import { IconAlertSquareRounded } from "@tabler/icons-react"

interface RoleFormBaseProps {
  initial?: {
    id: string
    name: string
    description: string | null
    isSystem: boolean
  }
}

export function RoleForm({ initial }: RoleFormBaseProps) {
  const router = useRouter()
  const isEdit = !!initial
  const isNew = !isEdit

  type FormData = CreateRoleData | UpdateRoleData
  const schema = isNew ? createRoleSchema : updateRoleSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
    },
  })

  const isReadonly = isEdit && (initial?.isSystem ?? false)

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      // PATCH existing role
      const res = await fetch(`/api/roles/${initial!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        if (json.errors?.name) {
          setError("name", { message: json.errors.name[0] })
        } else {
          setError("name", { message: json.message ?? "Kayıt başarısız." })
        }
        return
      }
      router.refresh()
    } else {
      // POST new role
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        if (json.errors?.name) {
          setError("name", { message: json.errors.name[0] })
        } else {
          setError("name", { message: json.message ?? "Kayıt başarısız." })
        }
        return
      }
      // Redirect to detail page for permission matrix editing
      router.push(`/admin/roller/${slugifyTr(json.data.name)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {isReadonly && (
        <div className="flex items-center text-amber-400 text-xs">
          <IconAlertSquareRounded size={18} className="mr-1" />
          <span className="font-bold -mb-0.5">Sistem Rolü</span>
          <span>— Ad ve açıklama düzenlenemez.</span>
        </div>
      )}

      <FFInput
        label="Rol Adı"
        placeholder="Örn: İçerik Editörü"
        error={errors.name?.message}
        disabled={isReadonly || isSubmitting}
        {...register("name")}
      />

      <FFTextarea
        label="Açıklama (opsiyonel)"
        placeholder="Bu rolün kısaca ne yapabileceğini açıklayın"
        error={errors.description?.message ?? undefined}
        disabled={isSubmitting}
        {...register("description")}
      />

      {isEdit && initial?.isSystem && (
        <FFBadge variant="warning">Sistem Rolü — Silinemez</FFBadge>
      )}

      <div className="flex justify-end h-11 pt-2">
        <FFButton
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          rightIcon={isNew ? <ArrowRight className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          disabled={isReadonly && isEdit}
        >
          {isNew ? "Devam" : "Kaydet"}
        </FFButton>
      </div>
    </form>
  )
}
