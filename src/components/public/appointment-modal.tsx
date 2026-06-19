"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Clock, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Check } from "@/lib/icons"
import { toast } from "sonner"

import { useUIStore } from "@/lib/ui-store"
import { appointmentSchema, APPOINTMENT_SUBJECTS, type AppointmentFormData } from "@/lib/validators/appointment-schema"
import { FFInput, FFTextarea } from "@/components/ui/ff-input"
import { cn } from "@/lib/utils"

// Available daily slots
const SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
]

export function AppointmentModal() {
  const isOpen = useUIStore((state) => state.isAppointmentModalOpen)
  const setIsOpen = useUIStore((state) => state.setAppointmentModalOpen)

  const [step, setStep] = React.useState<number>(1)
  const [submitState, setSubmitState] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [serverError, setServerError] = React.useState<string>("")

  // Calendar states
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null)

  // Booked & Blocked slots from backend
  const [availability, setAvailability] = React.useState<{ booked: string[]; blocked: string[] }>({
    booked: [],
    blocked: [],
  })
  const [loadingSlots, setLoadingSlots] = React.useState<boolean>(false)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-indexed

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "Hizmet Satın Alımı",
      date: "",
      notes: "",
    },
  })

  const formValues = watch()
  const isLoading = submitState === "loading"

  // Fetch slots for active month
  const fetchSlots = React.useCallback(async (year: number, month: number) => {
    setLoadingSlots(true)
    try {
      const res = await fetch(`/api/appointments/slots?year=${year}&month=${month + 1}`)
      if (res.ok) {
        const json = await res.json()
        setAvailability({
          booked: json.booked || [],
          blocked: json.blocked || [],
        })
      }
    } catch (err) {
      console.error("Error fetching slots:", err)
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      fetchSlots(currentYear, currentMonth)
    }
  }, [isOpen, currentYear, currentMonth, fetchSlots])

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        reset()
        setStep(1)
        setSubmitState("idle")
        setServerError("")
        setSelectedDay(null)
        setCurrentDate(new Date())
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, reset])

  // Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  // Adjust day index so Monday is index 0
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7

  const handlePrevMonth = () => {
    setSelectedDay(null)
    setValue("date", "")
    const prev = new Date(currentYear, currentMonth - 1, 1)
    if (prev >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
      setCurrentDate(prev)
    }
  }

  const handleNextMonth = () => {
    setSelectedDay(null)
    setValue("date", "")
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Check if a day is selectable (not past, not weekend)
  const isDaySelectable = (dayNum: number) => {
    const checkDate = new Date(currentYear, currentMonth, dayNum)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Weekend check
    const dayOfWeek = checkDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false

    return checkDate >= today
  }

  // Check if slot is unavailable (booked, blocked, or in the past)
  const checkSlotStatus = (dayNum: number, hourStr: string) => {
    const slotDate = new Date(currentYear, currentMonth, dayNum)
    const [hours, minutes] = hourStr.split(":").map(Number)
    slotDate.setHours(hours, minutes, 0, 0)

    const now = new Date()
    if (slotDate < now) return "past"

    if (availability.blocked.some(b => new Date(b).getTime() === slotDate.getTime())) return "blocked"
    if (availability.booked.some(b => new Date(b).getTime() === slotDate.getTime())) return "booked"

    return "available"
  }

  // Step Navigations
  const handleNextStep = async () => {
    if (step === 1) {
      const isStep1Valid = await trigger(["name", "email", "phone"])
      if (isStep1Valid) setStep(2)
    } else if (step === 2) {
      const isStep2Valid = await trigger(["subject", "notes"])
      if (isStep2Valid) setStep(3)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Form submit handler
  async function onSubmit(data: AppointmentFormData) {
    if (!data.date) {
      toast.error("Lütfen bir randevu saati seçin.")
      return
    }

    setSubmitState("loading")
    setServerError("")

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.message || "Randevu oluşturulurken bir hata oluştu.")
        setSubmitState("error")
        toast.error(json.message || "Lütfen bilgilerinizi kontrol edip tekrar deneyin.")
        return
      }

      setSubmitState("success")
      toast.success("Randevunuz başarıyla oluşturuldu!")
    } catch (err) {
      console.error(err)
      setServerError("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.")
      setSubmitState("error")
      toast.error("Bağlantı hatası oluştu.")
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className={cn(
                  "fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95vw] z-[101] bg-[var(--background)] border border-[var(--border)] shadow-2xl flex flex-col ff-shape-container outline-none max-h-[95vh]",
                  step === 3 ? "max-w-3xl" : "max-w-lg"
                )}
              >
                {/* Close */}
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Kapat"
                    className="ff-shape-container absolute top-4 right-4 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors w-8 h-8 flex items-center justify-center border border-[var(--border)] bg-[var(--surface)]/50 hover:bg-[var(--surface)] cursor-pointer z-10"
                  >
                    <X size={16} />
                  </button>
                </Dialog.Close>

                {submitState === "success" ? (
                  /* Success View */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center p-8 md:p-12"
                  >
                    <div className="relative mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 bg-[var(--ff-purple)]/10 text-[var(--ff-purple)] border border-[var(--ff-purple)]/20 flex items-center justify-center rounded-full"
                      >
                        <CheckCircle2 size={40} className="stroke-[1.5]" />
                      </motion.div>
                    </div>

                    <h3 className="font-display text-2xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                      Randevunuz Alındı!
                    </h3>
                    <p className="text-sm text-[var(--foreground-muted)] max-w-sm mb-6 leading-relaxed">
                      Talebiniz başarıyla kaydedilmiştir. Rezervasyon onay detayları e-posta adresinize gönderilecektir.
                    </p>

                    <div className="border border-[var(--border)] bg-[var(--surface)]/40 p-4 mb-8 text-left w-full text-xs flex flex-col gap-2 ff-shape-container">
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-faint)] uppercase font-semibold">AD SOYAD:</span>
                        <span className="font-bold text-[var(--foreground)]">{formValues.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-faint)] uppercase font-semibold">E-POSTA:</span>
                        <span className="font-bold text-[var(--foreground)]">{formValues.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-faint)] uppercase font-semibold">TELEFON:</span>
                        <span className="font-bold text-[var(--foreground)]">{formValues.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-faint)] uppercase font-semibold">KONU:</span>
                        <span className="font-bold text-[var(--foreground)]">{formValues.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-faint)] uppercase font-semibold">TARİH & SAAT:</span>
                        <span className="font-bold text-[var(--ff-purple)]">
                          {formValues.date ? new Date(formValues.date).toLocaleString("tr-TR", {
                            dateStyle: "long",
                            timeStyle: "short"
                          }) : "-"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "ff-shape-button h-10 inline-flex items-center justify-center",
                        "px-8 py-3 text-[12px] font-medium transition-all duration-200 cursor-pointer",
                        "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                        "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]"
                      )}
                    >
                      Kapat
                    </button>
                  </motion.div>
                ) : (
                  /* Multi-step Form View */
                  <div className="p-6 md:p-8 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="ff-shape-container inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/20 text-[10px] font-semibold text-[var(--ff-purple)] mb-3 tracking-widest uppercase">
                        <Sparkles size={10} />
                        Ön Görüşme Randevusu — Adım {step} / 3
                      </div>
                      <Dialog.Title className="font-display text-2xl font-extrabold text-[var(--foreground)] tracking-tight leading-none">
                        {step === 1 && "Kişisel Bilgiler"}
                        {step === 2 && "Görüşme Detayları"}
                        {step === 3 && "Tarih ve Saat Seçimi"}
                      </Dialog.Title>
                      <Dialog.Description className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
                        {step === 1 && "İletişime geçebilmemiz için bilgilerinizi eksiksiz girin."}
                        {step === 2 && "Görüşmemizin verimli geçmesi için konuyu ve beklentinizi belirtin."}
                        {step === 3 && "Aşağıdaki takvimden müsait zaman dilimini seçerek randevunuzu kesinleştirin."}
                      </Dialog.Description>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[var(--border)] h-1 mb-6 relative overflow-hidden">
                      <motion.div
                        className="bg-[var(--ff-purple)] h-full absolute left-0 top-0"
                        animate={{ width: `${(step / 3) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Server error */}
                    {submitState === "error" && serverError && (
                      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 border border-red-500/30 bg-red-500/5 text-xs text-red-500" role="alert">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <div>{serverError}</div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto mb-6 pr-1">
                      <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* STEP 1: Personal Info */}
                        {step === 1 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-4"
                          >
                            <FFInput
                              label="Ad Soyad *"
                              placeholder="Ahmet Yılmaz"
                              autoComplete="name"
                              error={errors.name?.message}
                              {...register("name")}
                            />
                            <FFInput
                              label="E-posta *"
                              type="email"
                              placeholder="ahmet@sirket.com"
                              autoComplete="email"
                              error={errors.email?.message}
                              {...register("email")}
                            />
                            <FFInput
                              label="Telefon *"
                              type="tel"
                              placeholder="05XX XXX XX XX"
                              autoComplete="tel"
                              error={errors.phone?.message}
                              {...register("phone")}
                            />
                          </motion.div>
                        )}

                        {/* STEP 2: Subject & Description */}
                        {step === 2 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)]">
                                Görüşme Amacı / Konusu *
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {APPOINTMENT_SUBJECTS.map((sub) => (
                                  <button
                                    key={sub}
                                    type="button"
                                    onClick={() => setValue("subject", sub)}
                                    className={cn(
                                      "ff-shape-container px-4 py-3 text-xs font-medium border text-left transition-all flex items-center justify-between cursor-pointer",
                                      formValues.subject === sub
                                        ? "border-[var(--ff-purple)] bg-[var(--ff-purple)]/5 text-[var(--ff-purple)]"
                                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)]/40 hover:text-[var(--foreground)]"
                                    )}
                                  >
                                    <span>{sub}</span>
                                    {formValues.subject === sub && <Check size={14} />}
                                  </button>
                                ))}
                              </div>
                              {errors.subject && (
                                <p className="text-[11px] text-red-500">✕ {errors.subject.message}</p>
                              )}
                            </div>

                            <FFTextarea
                              label="Talep Açıklaması"
                              placeholder="Detaylar, hedefleriniz veya konuşmak istediğiniz özel konular..."
                              rows={4}
                              error={errors.notes?.message}
                              {...register("notes")}
                            />
                          </motion.div>
                        )}

                        {/* STEP 3: Calendar & Slot Picker */}
                        {step === 3 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="grid md:grid-cols-12 gap-6 items-start"
                          >
                            {/* Left: Monthly Calendar */}
                            <div className="md:col-span-7 border border-[var(--border)] p-4 bg-[var(--surface)]/20 ff-shape-container">
                              {/* Calendar Header */}
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-[var(--foreground)]">
                                  {MONTHS[currentMonth]} {currentYear}
                                </h4>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="ff-shape-container p-1 border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] cursor-pointer"
                                  >
                                    <ArrowLeft size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="ff-shape-container p-1 border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] cursor-pointer"
                                  >
                                    <ArrowRight size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Calendar Weekday Names */}
                              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--foreground-faint)] uppercase tracking-wider mb-2">
                                {WEEKDAYS.map((w) => (
                                  <div key={w} className="py-1">{w}</div>
                                ))}
                              </div>

                              {/* Calendar Days Grid */}
                              <div className="grid grid-cols-7 gap-1">
                                {/* Offsets */}
                                {Array.from({ length: firstDayIndex }).map((_, i) => (
                                  <div key={`offset-${i}`} className="aspect-square" />
                                ))}

                                {/* Days */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                  const dayNum = i + 1
                                  const selectable = isDaySelectable(dayNum)
                                  const active = selectedDay === dayNum

                                  return (
                                    <button
                                      key={`day-${dayNum}`}
                                      type="button"
                                      disabled={!selectable}
                                      onClick={() => {
                                        setSelectedDay(dayNum)
                                        setValue("date", "") // Reset selected hour slot
                                      }}
                                      className={cn(
                                        "ff-shape-container aspect-square text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border border-transparent",
                                        active && "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)]",
                                        !active && selectable && "bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--ff-purple)]/40 hover:text-[var(--ff-purple)]",
                                        !selectable && "text-[var(--foreground-faint)] opacity-30 cursor-not-allowed"
                                      )}
                                    >
                                      {dayNum}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Right: Slot Selection */}
                            <div className="md:col-span-5 flex flex-col gap-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5">
                                <Clock size={12} className="text-[var(--ff-purple)]" />
                                Uygun Saat Dilimleri
                              </h4>

                              {selectedDay === null ? (
                                <div className="border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--foreground-faint)] ff-shape-container">
                                  Lütfen takvimden bir gün seçin.
                                </div>
                              ) : loadingSlots ? (
                                <div className="flex justify-center py-6">
                                  <span
                                    className="w-5 h-5 border-2 border-[var(--ff-purple)]/20 border-t-[var(--ff-purple)]"
                                    style={{ borderRadius: "50%", animation: "spin 0.7s linear infinite" }}
                                  />
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                                  {SLOTS.map((slotStr) => {
                                    const status = checkSlotStatus(selectedDay!, slotStr)
                                    const isAvailable = status === "available"

                                    // Build ISO string of selected slot for setting form value
                                    const slotDate = new Date(currentYear, currentMonth, selectedDay!)
                                    const [hours, minutes] = slotStr.split(":").map(Number)
                                    slotDate.setHours(hours, minutes, 0, 0)
                                    const slotISO = slotDate.toISOString()

                                    const isSelected = formValues.date === slotISO

                                    return (
                                      <button
                                        key={slotStr}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => setValue("date", slotISO)}
                                        className={cn(
                                          "ff-shape-container py-2 px-3 text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1",
                                          isSelected
                                            ? "border-[var(--ff-purple)] bg-[var(--ff-purple)]/10 text-[var(--ff-purple)]"
                                            : isAvailable
                                              ? "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]"
                                              : "border-[var(--border)] opacity-35 line-through text-[var(--foreground-faint)] cursor-not-allowed"
                                        )}
                                      >
                                        <span>{slotStr}</span>
                                        {isSelected && <Check size={12} />}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                              {errors.date && (
                                <p className="text-[11px] text-red-500">✕ {errors.date.message}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </form>
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 shrink-0">
                      <div>
                        {step > 1 && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={handlePrevStep}
                            className="px-5 py-2 text-[12px] font-medium border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all cursor-pointer ff-shape-button"
                          >
                            Geri
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            disabled={isLoading}
                            className="px-5 py-2 text-[12px] font-medium border border-transparent text-[var(--foreground-faint)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                          >
                            İptal
                          </button>
                        </Dialog.Close>

                        {step < 3 ? (
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className={cn(
                              "ff-shape-button inline-flex items-center justify-center gap-1.5",
                              "px-6 py-2.5 text-[12px] font-semibold transition-all duration-200 cursor-pointer",
                              "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                              "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]"
                            )}
                          >
                            <span>İlerle</span>
                            <ArrowRight size={12} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className={cn(
                              "ff-shape-button inline-flex items-center justify-center gap-2",
                              "px-6 py-2.5 text-[12px] font-semibold transition-all duration-200 cursor-pointer",
                              "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                              "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)] hover:shadow-[0_4px_20px_rgba(255, 79, 216,0.3)]",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            {isLoading ? (
                              <>
                                <span
                                  className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white"
                                  style={{ borderRadius: "50%", animation: "spin 0.7s linear infinite" }}
                                />
                                <span>Oluşturuluyor...</span>
                              </>
                            ) : (
                              <>
                                <span>Randevuyu Onayla</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
