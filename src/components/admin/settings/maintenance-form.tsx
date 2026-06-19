"use client"

import * as React from "react"
import { FFButton } from "@/components/ui"
import { Wrench, Save, Loader2, AlertTriangle } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MaintenanceData {
  enabled: boolean
  title: string
  message: string
}

export function MaintenanceForm({ initialData }: { initialData: MaintenanceData }) {
  const [data, setData] = React.useState<MaintenanceData>(initialData)
  const [loading, setLoading] = React.useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Ayarlar kaydedilemedi.")
      toast.success(
        data.enabled
          ? "Bakım modu açıldı — ziyaretçiler bakım ekranını görecek."
          : "Bakım modu kapatıldı — site herkese açık."
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-20 max-w-3xl">
      {/* Toggle card */}
      <div
        className={cn(
          "ff-shape-container p-6 border flex items-center justify-between gap-4 transition-colors",
          data.enabled
            ? "bg-[var(--warning)]/10 border-[var(--warning)]/40"
            : "bg-[#F7F7F5] border-[#CCCCCC]"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "ff-shape-button w-11 h-11 flex items-center justify-center border",
              data.enabled
                ? "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30"
                : "bg-[#F0F0F0] text-[#666666] border-[#CCCCCC]"
            )}
          >
            <Wrench size={20} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#333333]">Bakım Modu</h3>
            <p className="text-[12px] text-[#666666]">
              {data.enabled ? "Açık — site ziyaretçilere kapalı" : "Kapalı — site herkese açık"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={data.enabled}
          onClick={() => setData({ ...data, enabled: !data.enabled })}
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors duration-200 border shrink-0",
            data.enabled ? "bg-[var(--warning)] border-[var(--warning)]" : "bg-[#E0E0E0] border-[#CCCCCC]"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200",
              data.enabled && "translate-x-[20px]"
            )}
          />
        </button>
      </div>

      {data.enabled && (
        <div className="ff-shape-container flex items-start gap-3 p-4 bg-[var(--warning)]/5 border border-[var(--warning)]/20">
          <AlertTriangle size={16} className="text-[var(--warning)] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#666666] leading-relaxed">
            Bakım modu açıkken yalnızca giriş yapmış adminler siteyi görebilir. Ziyaretçiler
            aşağıdaki başlık ve mesajı içeren bakım ekranıyla karşılaşır.
          </p>
        </div>
      )}

      {/* Title + message */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#666666]">
            Başlık
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Kısa bir bakımdayız."
            className="ff-shape-container w-full px-4 py-3 text-sm bg-[#F7F7F5] border border-[#CCCCCC] text-[#333333] placeholder:text-[#999999] outline-none focus:border-[#ff4fd8] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#666666]">
            Mesaj
          </label>
          <textarea
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            rows={3}
            placeholder="Sitemizi sizin için daha iyi hale getiriyoruz. Çok kısa süre içinde tekrar buradayız."
            className="ff-shape-container w-full px-4 py-3 text-sm resize-y bg-[#F7F7F5] border border-[#CCCCCC] text-[#333333] placeholder:text-[#999999] outline-none focus:border-[#ff4fd8] transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="ff-shape-container sticky bottom-4 z-20 flex items-center justify-end gap-4 p-4 bg-[#F7F7F5]/80 backdrop-blur-md border border-[#CCCCCC]">
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
    </div>
  )
}
