"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, AlertCircle } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { FFInput, FFTextarea } from "@/components/ui/ff-input"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import {
  contactSchema,
  SERVICE_SLUGS,
  SERVICE_LABELS,
  BUDGET_OPTIONS,
  type ContactFormData,
} from "@/lib/validators/contact-schema"
import { SuccessMessage } from "./success-message"
import { fadeInUp } from "@/lib/animations"

// ── Field wrapper for FFSelect (label + error + hint) ────
function FormSelect({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold text-[var(--foreground-muted)]"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <span>✕</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-[var(--foreground-faint)]">{hint}</p>
      )}
    </div>
  )
}

// ── Main form component ────────────────────────────────────
export function ContactForm() {
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [serverError, setServerError] = useState<string>("")
  const [refCode, setRefCode] = useState<string>("")

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  })

  const isLoading = isSubmitting || submitState === "loading"

  async function onSubmit(data: ContactFormData) {
    setSubmitState("loading")
    setServerError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.errors && typeof json.errors === "object") {
          const fieldErrors = json.errors as Record<string, string[]>
          for (const [field, messages] of Object.entries(fieldErrors)) {
            setError(field as keyof ContactFormData, {
              message: messages.join(", "),
            })
          }
          if (Object.keys(fieldErrors).length === 0) {
            const msg =
              json.message ??
              (res.status === 429
                ? "Çok fazla istek gönderildi. Lütfen bekleyip tekrar deneyin."
                : "Bir hata oluştu. Lütfen tekrar deneyin.")
            setServerError(msg)
          }
        } else {
          const msg =
            json.message ??
            (res.status === 429
              ? "Çok fazla istek gönderildi. Lütfen bekleyip tekrar deneyin."
              : "Bir hata oluştu. Lütfen tekrar deneyin.")
          setServerError(msg)
        }
        setSubmitState("error")
        return
      }

      setRefCode(json.ref ?? "")
      setSubmitState("success")
    } catch {
      setServerError("Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.")
      setSubmitState("error")
    }
  }

  function handleReset() {
    reset()
    setSubmitState("idle")
    setServerError("")
    setRefCode("")
  }

  // ── Success state ──────────────────────────────────────
  if (submitState === "success") {
    return (
      <SuccessMessage
        refCode={refCode}
        onReset={handleReset}
      />
    )
  }

  // ── Form ───────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isLoading}
      className="flex flex-col gap-6"
    >
      {/* Server error banner */}
      <AnimatePresence>
        {submitState === "error" && serverError && (
          <motion.div
            key="error-banner"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-start gap-3 px-4 py-3",
              "border border-red-500/40 bg-red-500/6",
              "text-sm text-red-500"
            )}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{serverError}</p>
              <p className="text-xs mt-0.5 text-red-400">
                Sorun devam ederse{" "}
                <a
                  href="mailto:hello@flixflex.com"
                  className="underline underline-offset-2"
                >
                  hello@flixflex.com
                </a>{" "}
                adresine yazabilirsiniz.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 0: Form Title */}
      <div className="flex flex-col gap-6 font-display text-2xl font-extrabold text-[var(--foreground)] leading-tight">
        İletişim Formu
      </div>

      {/* Row 1: Name + Email */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FFInput
          label="İsim Soyisim *"
          placeholder="Ahmet Yılmaz"
          autoComplete="name"
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
        />
        <FFInput
          label="E-posta *"
          type="email"
          placeholder="ahmet@sirket.com"
          autoComplete="email"
          disabled={isLoading}
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      {/* Row 2: Company + Phone */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FFInput
          label="Şirket"
          placeholder="Şirket adı (opsiyonel)"
          autoComplete="organization"
          disabled={isLoading}
          error={errors.company?.message}
          {...register("company")}
        />
        <FFInput
          label="Telefon"
          type="tel"
          placeholder="+90 5XX XXX XX XX"
          autoComplete="tel"
          disabled={isLoading}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Row 3: Service + Budget */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormSelect
          id="service-select"
          label="İlgilenilen Hizmet *"
          error={errors.service?.message}
        >
          <Controller
            control={control}
            name="service"
            render={({ field }) => (
              <FFSelect
                id="service-select"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={isLoading}
                error={!!errors.service}
                placeholder="Hizmet seçin…"
                ariaLabel="İlgilenilen hizmet"
              >
                {SERVICE_SLUGS.map((slug) => (
                  <FFSelectItem key={slug} value={slug}>
                    {SERVICE_LABELS[slug]}
                  </FFSelectItem>
                ))}
              </FFSelect>
            )}
          />
        </FormSelect>

        <FormSelect
          id="budget-select"
          label="Bütçe Aralığı"
          error={errors.budget?.message}
        >
          <Controller
            control={control}
            name="budget"
            render={({ field }) => (
              <FFSelect
                id="budget-select"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={isLoading}
                error={!!errors.budget}
                placeholder="Bütçe aralığı seçin (opsiyonel)"
                ariaLabel="Bütçe aralığı"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <FFSelectItem key={b} value={b}>
                    {b === "Belirsiz" ? "Belirsiz / Görüşelim" : `${b} ₺`}
                  </FFSelectItem>
                ))}
              </FFSelect>
            )}
          />
        </FormSelect>
      </div>

      {/* Row 4: Message */}
      <FFTextarea
        label="Mesajınız *"
        placeholder="Projeniz hakkında kısaca bilgi verin. Ne inşa etmek istiyorsunuz? Hedefleriniz neler?"
        rows={6}
        disabled={isLoading}
        error={errors.message?.message}
        hint="En az 20, en fazla 2000 karakter"
        {...register("message")}
      />

      {/* Row 5: KVKK consent */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <span className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="peer sr-only"
              disabled={isLoading}
              {...register("consent")}
            />
            {/* Custom checkbox — sharp */}
            <span
              className={cn(
                "block w-[18px] h-[18px] border border-[var(--border)]",
                "bg-[var(--surface)] transition-colors duration-150",
                "peer-checked:bg-[var(--ff-purple)] peer-checked:border-[var(--ff-purple)]",
                "peer-focus-visible:shadow-[0_0_0_3px_rgba(255, 79, 216,0.2)]",
                "group-hover:border-[var(--ff-purple)]",
                errors.consent && "border-red-500"
              )}
            />
            {/* Checkmark svg — visible when checked */}
            <svg
              className={cn(
                "absolute inset-0 m-auto w-2.5 h-2.5 text-white",
                "opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              )}
              viewBox="0 0 12 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="1 5.5 4.5 9 11 1" />
            </svg>
          </span>
          <span className="text-[12px] leading-relaxed text-[var(--foreground-muted)]">
            <a
              href="/kvkk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ff-purple)] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              KVKK Aydınlatma Metni
            </a>
            &apos;ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.consent && (
          <p className="text-[11px] text-red-500 flex items-center gap-1 pl-7">
            <span>✕</span> {errors.consent.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <motion.div variants={fadeInUp}>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "ff-shape-button",
            "w-fit h-9 inline-flex items-center justify-center gap-2.5 mt-6",
            "px-8 py-4 text-[13px] font-medium",
            "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
            "hover:bg-[var(--ff-purple)] hover:border-[var(--ff-purple)]",
            "hover:shadow-[0_4px_32px_rgba(255, 79, 216,0.5)]",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          )}
        >
          {isLoading ? (
            <>
              <span
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white"
                style={{ borderRadius: "50%", animation: "spin 0.7s linear infinite" }}
                aria-hidden
              />
              <span>Gönderiliyor...</span>
            </>
          ) : (
            <>
              <span>Mesaj Gönder</span>
              <ArrowUpRight
                size={15}
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </>
          )}
        </button>
      </motion.div>
    </form>
  )
}
