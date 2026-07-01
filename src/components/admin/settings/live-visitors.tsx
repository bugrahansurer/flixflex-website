"use client"

import * as React from "react"
import { Eye, Users } from "@/lib/icons"

interface Live { activeNow: number; todayViews: number; todayVisitors: number }

// Polls the first-party analytics collector so admins can SEE that visit
// tracking is live and real — independent of the third-party pixels.
export function LiveVisitors() {
  const [live, setLive] = React.useState<Live | null>(null)
  const [ok, setOk] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    const tick = async () => {
      try {
        const res = await fetch("/api/analytics/live", { cache: "no-store" })
        const json = await res.json()
        if (mounted && json.ok) { setLive(json.data); setOk(true) }
      } catch {
        if (mounted) setOk(false)
      }
    }
    tick()
    const id = setInterval(tick, 15000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <div className="ff-shape-container ff-card bg-[#0d0d0d] border-[#0d0d0d] text-white p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <h3 className="font-display text-sm font-bold">Canlı Ziyaret (First-party)</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/40">Her 15sn güncellenir</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--ff-purple)]">
            {live ? live.activeNow : "—"}
          </p>
          <p className="text-[11px] text-white/60 mt-1">Şu an aktif</p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold tabular-nums flex items-center gap-1.5">
            <Eye size={16} className="text-white/40" />{live ? live.todayViews.toLocaleString("tr-TR") : "—"}
          </p>
          <p className="text-[11px] text-white/60 mt-1">Bugün görüntülenme</p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold tabular-nums flex items-center gap-1.5">
            <Users size={16} className="text-white/40" />{live ? live.todayVisitors.toLocaleString("tr-TR") : "—"}
          </p>
          <p className="text-[11px] text-white/60 mt-1">Bugün tekil ziyaretçi</p>
        </div>
      </div>

      {!ok && (
        <p className="text-[11px] text-amber-400/80 mt-3">Canlı veri alınamadı — sayfayı yenileyin.</p>
      )}
    </div>
  )
}
