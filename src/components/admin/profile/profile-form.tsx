"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Loader2 } from "@/lib/icons"
import { FFInput } from "@/components/ui"
import { cn } from "@/lib/utils"
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validators/profile-schema"

interface ProfileFormProps {
  initial: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initial.name ?? "",
      email: initial.email,
      image: initial.image ?? "",
    },
    mode: "onBlur",
  })

  async function onSubmit(values: UpdateProfileInput) {
    setServerError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          image: values.image && values.image.length > 0 ? values.image : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? "Güncelleme başarısız oldu")
        return
      }
      setSuccess(true)
      reset(values)
      router.refresh()
      setTimeout(() => setSuccess(false), 3500)
    } catch (err) {
      console.error(err)
      setServerError("Beklenmeyen bir hata oluştu")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#666666]">
            Ad Soyad
          </label>
          <FFInput {...register("name")} placeholder="Burhan Cal" className="bg-transparent border border-[#cccccc] focus:border-[#ff4fd8] text-[#333333] placeholder:text-[#999999]" />
          {errors.name && (
            <p className="text-xs text-[#dc2626]">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#666666]">
            E-posta
          </label>
          <FFInput type="email" {...register("email")} placeholder="ornek@flixflex.com" className="bg-transparent border border-[#cccccc] focus:border-[#ff4fd8] text-[#333333] placeholder:text-[#999999]" />
          {errors.email && (
            <p className="text-xs text-[#dc2626]">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#666666]">
          Profil Görseli URL (opsiyonel)
        </label>
        <FFInput
          {...register("image")}
          placeholder="https://..."
          className="bg-transparent border border-[#cccccc] focus:border-[#ff4fd8] text-[#333333] placeholder:text-[#999999]"
          autoComplete="off"
        />
        {errors.image && (
          <p className="text-xs text-[#dc2626]">{errors.image.message}</p>
        )}
      </div>

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
            Profil güncellendi.
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className={cn(
          "ff-shape-container inline-flex items-center justify-center gap-2 px-6 py-3",
          "text-[12px] font-medium",
          "bg-[#ff4fd8] text-white border border-[#ff4fd8]",
          "hover:bg-[#dc2db6] hover:border-[#dc2db6]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "transition-all duration-200"
        )}
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </button>
    </form>
  )
}
