"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "@/lib/icons"
import { FFInput } from "@/components/ui"
import { cn } from "@/lib/utils"
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validators/profile-schema"

export function PasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
  })

  async function onSubmit(values: ChangePasswordInput) {
    setServerError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? "Şifre güncellenemedi")
        return
      }
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error(err)
      setServerError("Beklenmeyen bir hata oluştu")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <div className="grid md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#666666]">
            Mevcut Şifre
          </label>
          <div className="relative">
            <FFInput
              type={showCurrent ? "text" : "password"}
              className="bg-transparent border border-[#cccccc] focus:border-[#ff4fd8] text-[#333333] placeholder:text-[#999999]"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#ff4fd8]"
              aria-label={showCurrent ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-[#dc2626]">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#666666]">
            Yeni Şifre
          </label>
          <div className="relative">
            <FFInput
              type={showNew ? "text" : "password"}
              className="bg-transparent border border-[#cccccc] focus:border-[#ff4fd8] text-[#333333] placeholder:text-[#999999]"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#ff4fd8]"
              aria-label={showNew ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-[#dc2626]">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#666666]">
            Yeni Şifre (Tekrar)
          </label>
          <FFInput
            type={showNew ? "text" : "password"}
            className="bg-transparent border border-[#cccccc] focus:border-[#ff4fd8] text-[#333333] placeholder:text-[#999999]"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-[#dc2626]">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-[#6666666] leading-relaxed">
        En az 8 karakter. Güçlü bir şifre için harf + sayı + sembol kullanın.
      </p>

      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 p-3 border border-[#dc2626]/40 bg-[#dc2626]/10 text-[#dc2626] text-sm"
          >
            <AlertCircle size={16} />
            {serverError}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 p-3 border border-[#16a34a]/40 bg-[#16a34a]/10 text-[#16a34a] text-sm"
          >
            <CheckCircle2 size={16} />
            Şifre güncellendi.
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "ff-shape-container inline-flex items-center justify-center gap-2 px-6 py-3",
          "text-[12px] font-medium",
          "bg-[#ff4fd8] text-white border border-[#ff4fd8]",
          "hover:bg-[#ff4fd8]/80 hover:border-[#ff4fd8]/80",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "transition-all duration-200"
        )}
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  )
}
