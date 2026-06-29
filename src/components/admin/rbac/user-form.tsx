"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, ArrowRight, Mail, AtSign } from "@/lib/icons"
import { generateUsername } from "@/lib/username"
import { FFButton } from "@/components/ui/ff-button"
import { FFInput } from "@/components/ui/ff-input"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import { createUserSchema, updateUserSchema, type CreateUserData, type UpdateUserData } from "@/lib/validators/user-schema"

interface Role {
  id: string
  name: string
}

interface UserFormProps {
  roles: Role[]
  initial?: {
    id: string
    name: string | null
    username: string
    email: string
    roleId: string
    isActive: boolean
  }
}

export function UserForm({ roles, initial }: UserFormProps) {
  const router = useRouter()
  const isEdit = !!initial
  const isNew  = !isEdit

  type FormData = CreateUserData | UpdateUserData
  const schema  = isNew ? createUserSchema : updateUserSchema

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isNew
      ? { name: "", username: "", email: "", roleId: roles[0]?.id ?? "", password: "", sendInviteEmail: false }
      : { name: initial?.name ?? "", username: initial?.username ?? "", email: initial?.email ?? "", roleId: initial?.roleId ?? "", isActive: initial?.isActive ?? true },
  })

  const sendInvite = isNew ? watch("sendInviteEmail" as keyof FormData) : false

  const usernameTouched = React.useRef(false)
  const nameValue = watch("name" as keyof FormData) as string
  const emailValue = watch("email" as keyof FormData) as string
  const usernameValue = (watch("username" as keyof FormData) as string) ?? ""

  React.useEffect(() => {
    if (!isNew || usernameTouched.current) return
    const suggestion = generateUsername(nameValue || "", emailValue || "")
    setValue("username" as keyof FormData, suggestion as never, { shouldValidate: false })
  }, [isNew, nameValue, emailValue, setValue])

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      const res = await fetch(`/api/users/${initial!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        const fieldErrors = json.errors as Record<string, string[]> | undefined
        if (fieldErrors?.email) setError("email", { message: fieldErrors.email[0] })
        else if (fieldErrors?.name) setError("name", { message: fieldErrors.name[0] })
        else setError("name", { message: json.message ?? "Kayıt başarısız." })
        return
      }
      router.refresh()
    } else {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        const fieldErrors = json.errors as Record<string, string[]> | undefined
        if (fieldErrors?.email) setError("email", { message: fieldErrors.email[0] })
        else if (fieldErrors?.name) setError("name", { message: fieldErrors.name[0] })
        else setError("name", { message: json.message ?? "Kayıt başarısız." })
        return
      }
      router.push(`/admin/kullanicilar/${json.data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FFInput
        label="Ad Soyad"
        placeholder="Kullanıcının tam adı"
        className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333] placeholder:text-[#999999]"
        error={errors.name?.message}
        disabled={isSubmitting}
        {...register("name")}
      />

      <FFInput
        label="E-posta"
        type="email"
        placeholder="ornek@flixflex.com"
        className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333] placeholder:text-[#999999]"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      <div className="flex flex-col gap-1">
        <FFInput
          label="Kullanıcı Adı"
          placeholder="omerustagul"
          leftIcon={<AtSign className="w-4 h-4" />}
          className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333] placeholder:text-[#999999]"
          error={(errors as { username?: { message?: string } }).username?.message}
          disabled={isSubmitting}
          {...register("username" as keyof FormData, {
            onChange: () => { usernameTouched.current = true },
          })}
        />
        {usernameValue && (
          <p className="text-[10px] text-[#888888]">
            URL: <span className="font-mono text-[#FF4FD8]">/admin/kullanicilar/{usernameValue}</span>
          </p>
        )}
      </div>

      {/* Role select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-[#888888]">
          Rol
        </label>
        <Controller
          control={control}
          name={"roleId" as keyof FormData}
          render={({ field }) => (
            <FFSelect
              value={(field.value as string) ?? ""}
              onValueChange={field.onChange}
              disabled={isSubmitting}
              placeholder="Rol seçin..."
              triggerClassName="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333]"
              ariaLabel="Rol"
              error={!!errors.roleId}
            >
              {roles.map((r) => (
                <FFSelectItem key={r.id} value={r.id}>
                  {r.name}
                </FFSelectItem>
              ))}
            </FFSelect>
          )}
        />
        {errors.roleId && (
          <p className="text-[11px] text-red-500">
            {errors.roleId.message}
          </p>
        )}
      </div>

      {/* New user only fields */}
      {isNew && (
        <FFInput
          label="Şifre"
          type="password"
          placeholder="En az 8 karakter"
          className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333] placeholder:text-[#999999]"
          error={(errors as { password?: { message?: string } }).password?.message}
          disabled={isSubmitting}
          {...register("password" as keyof FormData)}
        />
      )}

      {isNew && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="sendInviteEmail"
            className="ff-shape-button rounded-full w-4 h-4 accent-[#FF4FD8]"
            {...register("sendInviteEmail" as keyof FormData)}
          />
          <label
            htmlFor="sendInviteEmail"
            className="text-sm text-[#888888] flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            Davet e-postası gönder
            <span className="text-[10px] text-[#888888] border border-[#CCCCCC] px-1.5 py-0.5">
              yakında
            </span>
          </label>
          {sendInvite && (
            <span className="text-[10px] text-amber-400">
              Bu özellik henüz aktif değil — e-posta gönderilmeyecek.
            </span>
          )}
        </div>
      )}

      {/* isActive toggle (edit only) */}
      {isEdit && (
        <div className="flex items-center gap-3">
          <input
            className="ff-shape-button rounded-full w-4 h-4 bg-transparent border border-[#FF4FD8] accent-[#FF4FD8]"
            type="checkbox"
            id="isActive"
            {...register("isActive" as keyof FormData)}
          />
          <label
            htmlFor="isActive"
            className="text-sm text-[#888888] cursor-pointer"
          >
            Hesap aktif
          </label>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <FFButton
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          rightIcon={isNew ? <ArrowRight className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {isNew ? "Kullanıcı Oluştur" : "Kaydet"}
        </FFButton>
      </div>
    </form>
  )
}
