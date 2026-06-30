"use client"

import * as React from "react"
import { FFButton } from "@/components/ui"
import { Bell, Save, Loader2, MessageSquare, CalendarDays } from "@/lib/icons"
import { Can } from "@/components/admin/rbac/permission-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface NotificationsData {
  contactEnabled: boolean
  appointmentEnabled: boolean
  recipients: string
}

function ToggleRow({
  icon,
  title,
  desc,
  value,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="ff-shape-container flex items-center justify-between gap-4 p-3 bg-[#F7F7F5] border border-[#CCCCCC]">
      <div className="flex items-center gap-3">
        <span className="ff-shape-button w-10 h-10 flex items-center justify-center bg-[#F0F0F0] text-[var(--ff-purple)] border border-[#CCCCCC]">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-[#333333]">{title}</h3>
          <p className="text-[12px] text-[#666666]">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-12 h-7 rounded-full transition-colors duration-200 border shrink-0",
          value ? "bg-[var(--ff-purple)] border-[var(--ff-purple)]" : "bg-[#E0E0E0] border-[#CCCCCC]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200",
            value && "translate-x-[20px]"
          )}
        />
      </button>
    </div>
  )
}

export function NotificationsForm({ initialData }: { initialData: NotificationsData }) {
  const [data, setData] = React.useState<NotificationsData>(initialData)
  const [loading, setLoading] = React.useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Ayarlar kaydedilemedi.")
      toast.success("Bildirim ayarları kaydedildi.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ToggleRow
          icon={<MessageSquare size={18} />}
          title="Yeni İletişim Mesajı"
          desc="Bir ziyaretçi iletişim formunu doldurduğunda e-posta gönder."
          value={data.contactEnabled}
          onChange={(v) => setData({ ...data, contactEnabled: v })}
        />
        <ToggleRow
          icon={<CalendarDays size={18} />}
          title="Yeni Randevu Talebi"
          desc="Yeni bir randevu talebi geldiğinde e-posta gönder."
          value={data.appointmentEnabled}
          onChange={(v) => setData({ ...data, appointmentEnabled: v })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#666666] flex items-center gap-2">
          <Bell size={12} /> Bildirim Alıcıları
        </label>
        <textarea
          value={data.recipients}
          onChange={(e) => setData({ ...data, recipients: e.target.value })}
          rows={2}
          placeholder="admin@flixflex.com, ekip@flixflex.com"
          className="ff-shape-container w-full px-4 py-3 text-sm resize-y bg-[#F7F7F5] border border-[#CCCCCC] text-[#333333] placeholder:text-[#999999] outline-none focus:border-[#ff4fd8] transition-colors"
        />
        <p className="text-[11px] text-[#999999]">
          Virgül veya yeni satırla birden fazla e-posta ekleyebilirsiniz. E-posta gönderimi için
          Ayarlar → E-posta yapılandırmasının aktif olması gerekir.
        </p>
      </div>

      <Can resource="settings" action="update">
        <div className="ff-shape-container sticky bottom-4 z-20 flex flex-wrap items-center justify-end gap-2 sm:gap-4 p-4 bg-[#F7F7F5]/40 backdrop-blur-sm border border-[#CCCCCC]">
          <FFButton variant="ghost" disabled={loading} onClick={() => setData(initialData)}>
            Sıfırla
          </FFButton>
          <FFButton
            onClick={handleSave}
            disabled={loading}
            leftIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </FFButton>
        </div>
      </Can>
    </div>
  )
}
