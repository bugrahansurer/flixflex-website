"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, Search, ShieldAlert, Eye, EyeOff, Trash2, Filter, ChevronLeft, ChevronRight, Lock, Unlock } from "@/lib/icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { FFSelect, FFSelectItem } from "@/components/ui/ff-select"
import { useCan } from "@/components/admin/rbac/permission-context"

// Constants matching public picker
const WORKING_HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
]

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  date: string
  notes: string | null
  meetLink?: string | null
  status: "pending" | "approved" | "cancelled" | "completed"
  isRead: boolean
  createdAt: string
}


interface BlockedSlot {
  id: string
  date: string
  reason: string | null
}

export default function AdminAppointmentsPage() {
  const can = useCan()
  const [activeTab, setActiveTab] = React.useState<"list" | "calendar">("list")
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [blockedSlots, setBlockedSlots] = React.useState<BlockedSlot[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)

  // Filters/Searches for List Tab
  const [search, setSearch] = React.useState<string>("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [selectedNotes, setSelectedNotes] = React.useState<string | null>(null)
  const [resendingEmailId, setResendingEmailId] = React.useState<string | null>(null)

  // Calendar Blocker States
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null)
  const [availability, setAvailability] = React.useState<{ booked: string[]; blocked: string[] }>({
    booked: [],
    blocked: [],
  })
  const [loadingSlots, setLoadingSlots] = React.useState<boolean>(false)

  const currentYear = calendarDate.getFullYear()
  const currentMonth = calendarDate.getMonth()

  // Fetch all data
  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const appointmentsRes = await fetch("/api/appointments")
      const blockedRes = await fetch("/api/appointments/block")

      if (appointmentsRes.ok) {
        const json = await appointmentsRes.json()
        setAppointments(json.data || [])
      }
      if (blockedRes.ok) {
        const json = await blockedRes.json()
        setBlockedSlots(json.data || [])
      }
    } catch (err) {
      console.error(err)
      toast.error("Veriler yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch slots for blocker calendar when tab/month changes
  const fetchMonthSlots = React.useCallback(async (year: number, month: number) => {
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
      console.error(err)
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  React.useEffect(() => {
    if (activeTab === "calendar") {
      fetchMonthSlots(currentYear, currentMonth)
    }
  }, [activeTab, currentYear, currentMonth, fetchMonthSlots])

  // Update Status / Read state
  const handleUpdateAppointment = async (id: string, updates: { status?: string; isRead?: boolean }) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const json = await res.json()
        const updatedApp = json.data || { ...appointments.find(a => a.id === id), ...updates }

        // Local update
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, ...updatedApp } as Appointment : app))
        )

        // Check if approval mail status needs warning
        if (updates.status === "approved") {
          if (json.emailSent) {
            toast.success("Randevu onaylandı ve bilgilendirme e-postası gönderildi.")
          } else {
            toast.warning(`Randevu onaylandı fakat e-posta gönderilemedi! Hata: ${json.emailError || "Entegrasyon pasif veya SMTP ayarları hatalı."}`)
          }
        } else {
          toast.success("Randevu güncellendi.")
        }
      } else {
        const errorJson = await res.json().catch(() => ({}))
        toast.error(errorJson.error || "Güncelleme yapılamadı.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Bağlantı hatası.")
    }
  }

  const handleResendEmail = async (id: string) => {
    setResendingEmailId(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resendEmail: true }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.emailSent) {
          toast.success("Bilgilendirme e-postası tekrar gönderildi.")
        } else {
          toast.warning(`E-posta gönderilemedi! Hata: ${json.emailError || "Entegrasyon pasif veya SMTP ayarları hatalı."}`)
        }
      } else {
        const errorJson = await res.json().catch(() => ({}))
        toast.error(errorJson.error || "E-posta gönderimi başarısız.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Bağlantı hatası.")
    } finally {
      setResendingEmailId(null)
    }
  }

  // Block/Unblock slot handler
  const handleToggleBlock = async (dayNum: number, hourStr: string) => {
    const slotDate = new Date(currentYear, currentMonth, dayNum)
    const [hours, minutes] = hourStr.split(":").map(Number)
    slotDate.setHours(hours, minutes, 0, 0)
    const slotISO = slotDate.toISOString()

    const isBlocked = availability.blocked.some(b => new Date(b).getTime() === slotDate.getTime())

    try {
      if (isBlocked) {
        // Unblock (DELETE)
        const res = await fetch(`/api/appointments/block?date=${encodeURIComponent(slotISO)}`, {
          method: "DELETE",
        })
        if (res.ok) {
          toast.success("Zaman dilimi rezervasyona açıldı.")
          // Refresh lists
          fetchMonthSlots(currentYear, currentMonth)
          const blockedRes = await fetch("/api/appointments/block")
          if (blockedRes.ok) {
            const json = await blockedRes.json()
            setBlockedSlots(json.data || [])
          }
        } else {
          toast.error("Kilit açılamadı.")
        }
      } else {
        // Block (POST)
        const res = await fetch("/api/appointments/block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: slotISO, reason: "Yönetici tarafından kapatıldı" }),
        })
        if (res.ok) {
          toast.success("Zaman dilimi rezervasyona kapatıldı.")
          fetchMonthSlots(currentYear, currentMonth)
          const blockedRes = await fetch("/api/appointments/block")
          if (blockedRes.ok) {
            const json = await blockedRes.json()
            setBlockedSlots(json.data || [])
          }
        } else {
          toast.error("Zaman kilitlenemedi.")
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Hata oluştu.")
    }
  }

  // Remove block from list directly
  const handleRemoveBlockDirect = async (slotISO: string) => {
    try {
      const res = await fetch(`/api/appointments/block?date=${encodeURIComponent(slotISO)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Bloke başarıyla kaldırıldı.")
        setBlockedSlots((prev) => prev.filter((b) => b.date !== slotISO))
        if (activeTab === "calendar") {
          fetchMonthSlots(currentYear, currentMonth)
        }
      } else {
        toast.error("Bloke kaldırılamadı.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Hata oluştu.")
    }
  }

  // Blocker Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7

  const handlePrevMonth = () => {
    setSelectedDay(null)
    const prev = new Date(currentYear, currentMonth - 1, 1)
    setCalendarDate(prev)
  }

  const handleNextMonth = () => {
    setSelectedDay(null)
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search)

    const matchesStatus = statusFilter === "all" ? true : app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="px-6 md:px-10 py-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333]">Randevular</h1>
          <p className="text-xs text-[#666666] mt-1">
            Görüşme taleplerini takip edin ve müşteri rezervasyon takvimini özelleştirin
          </p>
        </div>

        {/* Tab Selector */}
        <div className="ff-shape-button flex bg-[#F7F7F5] h-11 p-1 rounded-sm w-full sm:w-fit border border-[#CCCCCC]">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={cn(
              "ff-shape-button flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-none cursor-pointer transition-colors",
              activeTab === "list" ? " bg-[#FF4FD8] text-[#f7f7f5] shadow-xs" : "text-[#666666] hover:text-[#333333]"
            )}
          >
            Randevular
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-none cursor-pointer transition-colors",
              activeTab === "calendar" ? "ff-shape-button bg-[#FF4FD8] text-[#f7f7f5] shadow-xs" : "text-[#666666] hover:text-[#333333]"
            )}
          >
            Takvim Yönetimi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ff-shape-container flex flex-col items-center justify-center py-20 bg-[#F7F7F5] border border-[#E0E0E0]">
          <span
            className="w-8 h-8 border-4 border-[var(--ff-purple)]/20 border-t-[var(--ff-purple)]"
            style={{ borderRadius: "50%", animation: "spin 0.7s linear infinite" }}
          />
          <span className="text-xs text-[#666666] mt-4 font-semibold">Veriler yükleniyor...</span>
        </div>
      ) : activeTab === "list" ? (
        /* RANDVULARI LİSTELEME TAB'I */
        <div className="space-y-6">
          {/* Controls: Search + Status filter */}
          <div className="ff-shape-container ff-card flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" size={15} />
              <input
                type="text"
                placeholder="İsim, e-posta veya telefon ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ff-shape-container w-full text-xs text-[#333333] py-2 pl-9 pr-4 border border-[#E0E0E0] outline-none focus:border-[var(--ff-purple)] bg-[#FBFBF9]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={14} className="shrink-0 text-[#666666]" />
              <FFSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                size="sm"
                fullWidth={false}
                ariaLabel="Randevu durumu filtresi"
                triggerClassName="flex-1 md:flex-none md:min-w-[180px] bg-white text-[#333333] border-[#E0E0E0]"
              >
                <FFSelectItem value="all">Tüm Randevular</FFSelectItem>
                <FFSelectItem value="pending">Bekleyenler</FFSelectItem>
                <FFSelectItem value="approved">Onaylananlar</FFSelectItem>
                <FFSelectItem value="completed">Tamamlananlar</FFSelectItem>
                <FFSelectItem value="cancelled">İptal Edilenler</FFSelectItem>
              </FFSelect>
            </div>
          </div>

          {/* List Table */}
          <div className="ff-shape-container bg-[#F7F7F5] border border-[#E0E0E0] overflow-hidden">
            {filteredAppointments.length === 0 ? (
              <div className="py-20 text-center text-xs text-[#666666]">
                Kriterlere uygun randevu bulunamadı.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f2f2f2] border-b border-[#cccccc] text-[#666666] font-bold">
                      <th className="p-2 w-8"></th>
                      <th className="p-2">Müşteri Bilgileri</th>
                      <th className="p-2">Konu</th>
                      <th className="p-2">Randevu Tarihi & Saati</th>
                      <th className="p-2">Durum</th>
                      <th className="p-2 text-center">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {filteredAppointments.map((app) => (
                      <React.Fragment key={app.id}>
                        <tr className={cn(
                          "transition-colors",
                          !app.isRead ? "bg-[#ff4fd8]/10 font-medium hover:bg-[#ff4fd8]/15" : "hover:bg-[#FBFBF9]"
                        )}>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateAppointment(app.id, { isRead: !app.isRead })}
                              title={app.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                              className="text-[#999999] hover:text-[var(--ff-purple)] transition-colors cursor-pointer"
                            >
                              {app.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-bold text-[#333333] flex items-center gap-1.5">
                                {app.name}
                                {!app.isRead && (
                                  <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] rounded-full shrink-0" />
                                )}
                              </div>
                              <div className="text-[#666666] mt-0.5">{app.email}</div>
                              <div className="text-[#999999] text-[10px] mt-0.5">{app.phone}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="ff-shape-container px-2 py-0.5 bg-[#FF4FD8]/5 border border-[#FF4FD8]/20 text-[#FF4FD8] text-[10px] font-semibold">
                              {app.subject}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-[#333333] font-semibold">
                              <CalendarIcon size={13} className="text-[var(--ff-purple)]" />
                              {new Date(app.date).toLocaleString("tr-TR", {
                                dateStyle: "long",
                                timeStyle: "short"
                              })}
                            </div>
                            <div className="text-[10px] text-[#999999] mt-0.5">
                              Talep Tarihi: {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              " ff-shape-container px-2 py-1 text-[10px] font-bold border rounded-none",
                              app.status === "pending" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
                              app.status === "approved" && "bg-green-500/10 border-green-500/20 text-green-600",
                              app.status === "completed" && "bg-blue-500/10 border-blue-500/20 text-blue-600",
                              app.status === "cancelled" && "bg-red-500/10 border-red-500/20 text-red-600"
                            )}>
                              {app.status === "pending" && "Bekliyor"}
                              {app.status === "approved" && "Onaylandı"}
                              {app.status === "completed" && "Tamamlandı"}
                              {app.status === "cancelled" && "İptal Edildi"}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedNotes(selectedNotes === app.id ? null : app.id)}
                              className="ff-shape-button px-2.5 py-1 text-[10px] border border-[#C0C0C0] text-[#666666] hover:bg-[#EAEAEA] cursor-pointer"
                            >
                              Detay / Notlar
                            </button>

                            {app.status === "pending" && can("appointments", "update") && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppointment(app.id, { status: "approved" })}
                                  className="ff-shape-button px-2.5 py-1 text-[10px] bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                >
                                  Onayla
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppointment(app.id, { status: "cancelled" })}
                                  className="ff-shape-button px-2.5 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                >
                                  İptal Et
                                </button>
                              </>
                            )}

                            {app.status === "approved" && can("appointments", "update") && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleResendEmail(app.id)}
                                  disabled={resendingEmailId === app.id}
                                  className="ff-shape-button px-2.5 py-1 text-[10px] bg-[#A134FF] hover:bg-[#8b23e3] disabled:opacity-50 text-white cursor-pointer"
                                >
                                  {resendingEmailId === app.id ? "Gönderiliyor..." : "Tekrar Mail Gönder"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppointment(app.id, { status: "completed" })}
                                  className="ff-shape-button px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                >
                                  Tamamla
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppointment(app.id, { status: "cancelled" })}
                                  className="ff-shape-button px-2.5 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                >
                                  İptal Et
                                </button>
                              </>
                            )}
                          </td>
                        </tr>

                        {/* Expandable Notes Panel */}
                        {selectedNotes === app.id && (
                          <tr>
                            <td colSpan={6} className="bg-[#FAFAFA] p-4 border-t border-b border-[#E0E0E0]">
                              <div className="max-w-2xl text-xs space-y-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-[#666666] uppercase tracking-wider text-[10px]">Açıklama / Talep Notu:</p>
                                  <p className="text-[#333333] leading-relaxed bg-white border border-[#E8E8E8] p-3 ff-shape-container whitespace-pre-wrap">
                                    {app.notes || "Herhangi bir açıklama girilmemiş."}
                                  </p>
                                </div>
                                {app.meetLink && (
                                  <div className="space-y-1">
                                    <p className="font-bold text-[#666666] uppercase tracking-wider text-[10px]">Toplantı Linki (Google Meet):</p>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={app.meetLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--ff-purple)] font-semibold hover:underline"
                                      >
                                        {app.meetLink}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAKVİM & SAAT KİLİTLEME TAB'I */
        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Calendar UI */}
          <div className="lg:col-span-5 bg-white border border-[#E0E0E0] p-4 sm:p-6 ff-shape-container space-y-6">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-4">
              <h3 className="font-display font-extrabold text-[#333333] text-sm">
                Takvim Seçimi
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="ff-shape-container p-1.5 border border-[#E0E0E0] text-[#666666] hover:bg-[#F3F3F1] cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#333333] w-24 text-center">
                  {MONTHS[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="ff-shape-container p-1.5 border border-[#E0E0E0] text-[#666666] hover:bg-[#F3F3F1] cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Weekday Names */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-[#999999] uppercase tracking-wider mb-2">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="py-1">{w}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Offset */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`offset-${i}`} className="aspect-square" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const checkDate = new Date(currentYear, currentMonth, dayNum)

                  // Weekend check
                  const dayOfWeek = checkDate.getDay()
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                  const active = selectedDay === dayNum

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      className={cn(
                        "ff-shape-button aspect-square w-full text-xs font-bold border flex flex-col items-center justify-center transition-all cursor-pointer",
                        active && "bg-[var(--ff-purple)] text-white border-[var(--ff-purple)] shadow-xs",
                        !active && !isWeekend && "bg-white border-[#E0E0E0] text-[#333333] hover:border-[var(--ff-purple)]/60 hover:text-[var(--ff-purple)]",
                        !active && isWeekend && "bg-[#F3F3F1] border-[#E8E8E8] text-[#999999] opacity-55"
                      )}
                    >
                      <span>{dayNum}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Middle Column: Slot Blocker Grid */}
          <div className="lg:col-span-4 bg-white border border-[#E0E0E0] p-4 sm:p-6 ff-shape-container space-y-6">
            <h3 className="font-display font-extrabold text-[#333333] text-sm border-b border-[#E0E0E0] pb-4 flex items-center gap-1.5">
              <Clock size={16} className="text-[var(--ff-purple)]" />
              Zaman Kapatma / Kilit Paneli
            </h3>

            {selectedDay === null ? (
              <div className="ff-shape-container border border-dashed border-[#D0D0D0] p-10 text-center text-xs text-[#999999]">
                Takvimden bir gün seçerek kilitlenecek saatleri görüntüleyin.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="ff-shape-button border border-[#E0E0E0] bg-[#FBFBF9] p-2 text-xs">
                  Seçilen Tarih: <span className="font-bold text-[#333333]">{selectedDay} {MONTHS[currentMonth]} {currentYear}</span>
                </div>

                {loadingSlots ? (
                  <div className="flex justify-center py-10">
                    <span
                      className="w-6 h-6 border-2 border-[var(--ff-purple)]/20 border-t-[var(--ff-purple)]"
                      style={{ borderRadius: "50%", animation: "spin 0.7s linear infinite" }}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {WORKING_HOURS.map((hourStr) => {
                      const slotDate = new Date(currentYear, currentMonth, selectedDay!)
                      const [hours, minutes] = hourStr.split(":").map(Number)
                      slotDate.setHours(hours, minutes, 0, 0)

                      const isBooked = availability.booked.some(b => new Date(b).getTime() === slotDate.getTime())
                      const isBlocked = availability.blocked.some(b => new Date(b).getTime() === slotDate.getTime())

                      return (
                        <div
                          key={hourStr}
                          className={cn(
                            "ff-shape-button flex items-center justify-between p-3 border text-xs",
                            isBooked && "bg-green-500/5 border-green-500/20",
                            isBlocked && "bg-red-500/5 border-red-500/20",
                            !isBooked && !isBlocked && "bg-[#FBFBF9] border-[#E8E8E8]"
                          )}
                        >
                          <div className="flex items-center gap-2 font-semibold">
                            <span>{hourStr}</span>
                            {isBooked && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-extrabold uppercase">Rezerve</span>
                            )}
                            {isBlocked && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-extrabold uppercase">Kapalı</span>
                            )}
                          </div>

                          {isBooked ? (
                            <span className="text-[10px] text-[#999999] font-medium italic">Doludur</span>
                          ) : can("appointments", "update") ? (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(selectedDay!, hourStr)}
                              className={cn(
                                "ff-shape-button px-3 py-1 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1",
                                isBlocked
                                  ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
                                  : "bg-red-500/10 border-red-500/30 border border-red-500/30 text-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white"
                              )}
                            >
                              {isBlocked ? (
                                <>
                                  <Unlock size={10} />
                                  <span className="-mb-0.5">Bloke Kaldır</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={10} />
                                  <span className="-mb-0.5">Kapat / Bloke Et</span>
                                </>
                              )}
                            </button>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: List of Blocked Slots */}
          <div className="lg:col-span-3 bg-white border border-[#E0E0E0] p-4 sm:p-6 ff-shape-container space-y-6">
            <h3 className="font-display font-extrabold text-[#333333] text-sm border-b border-[#E0E0E0] pb-4 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-500" />
              Bloke Edilmiş Saatler
            </h3>

            {blockedSlots.length === 0 ? (
              <div className="text-center text-xs text-[#999999] py-10">
                Şu anda bloke edilmiş herhangi bir zaman dilimi yok.
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {blockedSlots.map((block) => {
                  const blockDate = new Date(block.date)
                  return (
                    <div
                      key={block.id}
                      className="ff-shape-button p-2 border border-[#E0E0E0] bg-[#FBFBF9] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#333333]">
                          {blockDate.toLocaleDateString("tr-TR", {
                            dateStyle: "medium"
                          })}
                        </div>
                        <div className="text-[#666666] font-semibold flex items-center gap-1">
                          <Clock size={11} className="text-red-500" />
                          {blockDate.toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                      {can("appointments", "update") && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockDirect(block.date)}
                          title="Bloke kaldır"
                          className="p-1 border border-transparent text-[#999999] hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
