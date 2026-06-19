"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Send, CheckCircle } from "@/lib/icons"
import { FFButton } from "@/components/ui/ff-button"
import { FFInput } from "@/components/ui/ff-input"
import { setPasswordSchema, type SetPasswordData } from "@/lib/validators/user-schema"

interface ChangePasswordFormProps {
  userId: string
}

export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const [success, setSuccess] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [resetInfo, setResetInfo] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SetPasswordData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "" },
  })

  const onSubmit = async (data: SetPasswordData) => {
    setServerError(null)
    setSuccess(false)
    const res = await fetch(`/api/users/${userId}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      setServerError(json.message ?? "Şifre değiştirilirken hata oluştu.")
      return
    }
    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FFInput
        label="Yeni Şifre"
        type="password"
        placeholder="En az 8 karakter"
        className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333] placeholder:text-[#999999]"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />

      {serverError && (
        <p className="text-xs text-red-500">{serverError}</p>
      )}

      {success && (
        <p className="text-xs text-green-500 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Şifre başarıyla değiştirildi.
        </p>
      )}

      {resetInfo && (
        <p className="text-[11px] text-[#666666] leading-relaxed bg-[#f0eff2] border border-[#CCCCCC] p-2.5">
          E-posta ile self-servis sıfırlama akışı henüz aktif değil. Şimdilik
          yukarıdaki alandan yeni bir şifre belirleyip kullanıcıya güvenli bir
          kanaldan iletebilirsiniz.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <FFButton
        className="flex items-center gap-1.5 bg-[#ff4fd8] hover:bg-[#e03eb5] border border-[#ff4fd8] text-white"
          type="submit"
          variant="secondary"
          size="sm"
          loading={isSubmitting}
          leftIcon={<KeyRound className="w-3.5 h-3.5 mr-2" />}
        >
          Şifreyi Güncelle
        </FFButton>

        {/* Self-service reset email flow not yet implemented (needs a
            token table + public reset page — tracked for a later phase). */}
        <button
          type="button"
          className="ff-shape-button flex items-center gap-1.5 h-9 bg-transparent border border-[#ff4fd8] text-[11px] font-semibold text-[#ff4fd8] hover:text-[#e03eb5] px-3 py-1.5 transition-colors"
          onClick={() => setResetInfo((v) => !v)}
        >
          <Send className="w-3 h-3 mr-2" />
          Sıfırlama Maili Gönder
        </button>
      </div>
    </form>
  )
}
