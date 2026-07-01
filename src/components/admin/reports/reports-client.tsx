"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Eye, Users, Activity, Clock, BarChart3, TrendingUp,
  Monitor, Globe, FileText, RefreshCw, Loader2,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { ReportData } from "@/lib/analytics/queries"

// ── helpers ────────────────────────────────────────────────
function isoDay(d: Date) { return d.toISOString().slice(0, 10) }
function fmtDur(sec: number) {
  if (!sec) return "0sn"
  const m = Math.floor(sec / 60), s = Math.round(sec % 60)
  return m ? `${m}dk ${s}sn` : `${s}sn`
}
function fmtNum(n: number) { return n.toLocaleString("tr-TR") }
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })
}

const PRESETS = [
  { label: "7 Gün", days: 7 },
  { label: "30 Gün", days: 30 },
  { label: "90 Gün", days: 90 },
]

// Country code → Turkish name (common set; fallback to code).
const COUNTRY: Record<string, string> = {
  TR: "Türkiye", US: "ABD", DE: "Almanya", GB: "İngiltere", FR: "Fransa",
  NL: "Hollanda", RU: "Rusya", AZ: "Azerbaycan", SA: "S. Arabistan",
  AE: "BAE", IT: "İtalya", ES: "İspanya", UA: "Ukrayna", IN: "Hindistan",
}

// ── small pieces ───────────────────────────────────────────
function SummaryCard({
  label, value, delta, icon: Icon,
}: { label: string; value: string; delta?: number; icon: typeof Eye }) {
  const up = delta === undefined ? null : delta > 0 ? true : delta < 0 ? false : null
  return (
    <div className="ff-shape-container ff-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="ff-shape-button w-8 h-8 flex items-center justify-center" style={{ background: "rgba(255,79,216,0.1)" }}>
          <Icon size={15} className="text-[var(--ff-purple)]" />
        </div>
        {delta !== undefined && (
          <span className={cn(
            "text-[11px] font-semibold tabular-nums",
            up === true ? "text-green-500" : up === false ? "text-red-400" : "text-[#999999]"
          )}>
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-[#0d0d0d] leading-none tabular-nums">{value}</p>
      <p className="text-[11px] font-semibold text-[#888888] mt-1.5">{label}</p>
    </div>
  )
}

function BarList({
  title, icon: Icon, items, emptyLabel = "Veri yok",
}: {
  title: string
  icon: typeof Eye
  items: { label: string; value: number; href?: string }[]
  emptyLabel?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="ff-shape-container ff-card p-4">
      <h3 className="flex items-center gap-2 font-display text-[13px] font-bold text-[#333333] mb-3">
        <Icon size={14} className="text-[var(--ff-purple)]" /> {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-[12px] text-[#888888] py-6 text-center">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((it, i) => (
            <li key={`${it.label}-${i}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                {it.href ? (
                  <Link href={it.href} target="_blank" title={it.label}
                    className="text-[12px] text-[#333333] font-medium truncate hover:text-[var(--ff-purple)] transition-colors">
                    {it.label}
                  </Link>
                ) : (
                  <span className="text-[12px] text-[#333333] font-medium truncate" title={it.label}>{it.label}</span>
                )}
                <span className="text-[11px] font-semibold text-[#666666] tabular-nums shrink-0">{fmtNum(it.value)}</span>
              </div>
              <div className="h-1 w-full bg-[#EEEEEE] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--ff-purple)] rounded-full" style={{ width: `${Math.max(3, (it.value / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TrendChart({ daily }: { daily: ReportData["daily"] }) {
  const W = 900, H = 220, PAD = 18
  const max = Math.max(1, ...daily.map((d) => d.views))
  const n = daily.length
  const step = n > 1 ? (W - PAD * 2) / (n - 1) : 0
  const x = (i: number) => PAD + i * step
  const yV = (v: number) => H - PAD - (v / max) * (H - PAD * 2)
  const line = daily.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${yV(d.views).toFixed(1)}`).join(" ")
  const area = n ? `${line} L ${x(n - 1).toFixed(1)} ${H - PAD} L ${x(0).toFixed(1)} ${H - PAD} Z` : ""
  const visLine = daily.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${yV(d.visitors).toFixed(1)}`).join(" ")

  return (
    <div className="ff-shape-container ff-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 font-display text-[13px] font-bold text-[#333333]">
          <BarChart3 size={14} className="text-[var(--ff-purple)]" /> Günlük Trend
        </h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#666666]"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--ff-purple)]" /> Görüntülenme</span>
          <span className="flex items-center gap-1.5 text-[#666666]"><span className="w-2.5 h-0.5 bg-[#8B5CF6]" /> Ziyaretçi</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ff-rep-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4FD8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FF4FD8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#E0E0E0" strokeWidth="1" />
        {area && <path d={area} fill="url(#ff-rep-grad)" />}
        {line && <path d={line} fill="none" stroke="#FF4FD8" strokeWidth="2" strokeLinejoin="round" />}
        {visLine && <path d={visLine} fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round" />}
      </svg>
      <div className="flex justify-between mt-1 text-[10px] text-[#aaaaaa] tabular-nums">
        <span>{daily.length ? fmtDay(daily[0].date) : ""}</span>
        <span>{daily.length ? fmtDay(daily[daily.length - 1].date) : ""}</span>
      </div>
    </div>
  )
}

const DEVICE_LABEL: Record<string, string> = { desktop: "Masaüstü", mobile: "Mobil", tablet: "Tablet" }

// ── main ───────────────────────────────────────────────────
export function ReportsClient({ initial }: { initial: ReportData }) {
  const [data, setData] = React.useState<ReportData>(initial)
  const [activePreset, setActivePreset] = React.useState(30)
  const [from, setFrom] = React.useState(initial.range.from)
  const [to, setTo] = React.useState(initial.range.to)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async (f: string, t: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/report?from=${f}&to=${t}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Rapor alınamadı")
      setData(json.data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rapor alınamadı")
    } finally {
      setLoading(false)
    }
  }, [])

  const applyPreset = (days: number) => {
    setActivePreset(days)
    const t = new Date()
    const f = new Date(t.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    setFrom(isoDay(f)); setTo(isoDay(t))
    load(isoDay(f), isoDay(t))
  }

  const applyCustom = () => {
    setActivePreset(0)
    load(from, to)
  }

  const exportCsv = () => {
    const lines: string[] = []
    lines.push("FlixFlex Analitik Raporu")
    lines.push(`Aralık,${data.range.from},${data.range.to}`)
    lines.push("")
    lines.push("Özet")
    lines.push(`Görüntülenme,${data.summary.views}`)
    lines.push(`Tekil Ziyaretçi,${data.summary.uniqueVisitors}`)
    lines.push(`Oturum,${data.summary.sessions}`)
    lines.push(`Ort. Süre (sn),${data.summary.avgDurationSec}`)
    lines.push(`Sayfa/Oturum,${data.summary.viewsPerSession}`)
    lines.push(`Hemen Çıkma (%),${data.summary.bounceRate}`)
    lines.push("")
    lines.push("Günlük")
    lines.push("Tarih,Görüntülenme,Ziyaretçi")
    data.daily.forEach((d) => lines.push(`${d.date},${d.views},${d.visitors}`))
    lines.push("")
    lines.push("Sayfalar")
    lines.push("Yol,Görüntülenme,Ort. Süre (sn)")
    data.topPages.forEach((p) => lines.push(`${p.path},${p.views},${p.avgDurationSec}`))

    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flixflex-rapor-${data.range.from}_${data.range.to}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV indirildi")
  }

  const s = data.summary

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-1.5 bg-[#f0f0ee] p-1 ff-shape-button">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => applyPreset(p.days)}
              className={cn(
                "px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors",
                activePreset === p.days ? "bg-white text-[var(--ff-purple)] shadow-sm" : "text-[#666666] hover:text-[#333333]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
            className="ff-shape-button bg-white border border-[#CCCCCC] px-2.5 py-1.5 text-[12px] text-[#333333] outline-none focus:border-[var(--ff-purple)]" />
          <span className="text-[#999999] text-xs">—</span>
          <input type="date" value={to} min={from} max={isoDay(new Date())} onChange={(e) => setTo(e.target.value)}
            className="ff-shape-button bg-white border border-[#CCCCCC] px-2.5 py-1.5 text-[12px] text-[#333333] outline-none focus:border-[var(--ff-purple)]" />
          <button onClick={applyCustom} disabled={loading}
            className="ff-shape-button bg-[#333333] text-white px-3 py-1.5 text-[12px] font-semibold hover:bg-black transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Uygula
          </button>
          <button onClick={exportCsv}
            className="ff-shape-button bg-[var(--ff-purple)]/10 text-[var(--ff-purple)] px-3 py-1.5 text-[12px] font-semibold hover:bg-[var(--ff-purple)]/20 transition-colors inline-flex items-center gap-1.5">
            <FileText size={13} /> CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className={cn("grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 transition-opacity", loading && "opacity-50")}>
        <SummaryCard label="Görüntülenme" value={fmtNum(s.views)} delta={data.deltas.views} icon={Eye} />
        <SummaryCard label="Tekil Ziyaretçi" value={fmtNum(s.uniqueVisitors)} delta={data.deltas.uniqueVisitors} icon={Users} />
        <SummaryCard label="Oturum" value={fmtNum(s.sessions)} delta={data.deltas.sessions} icon={Activity} />
        <SummaryCard label="Ort. Süre" value={fmtDur(s.avgDurationSec)} delta={data.deltas.avgDuration} icon={Clock} />
        <SummaryCard label="Sayfa / Oturum" value={String(s.viewsPerSession)} icon={TrendingUp} />
        <SummaryCard label="Hemen Çıkma" value={`%${s.bounceRate}`} icon={BarChart3} />
      </div>

      {/* Trend */}
      <div className={cn("transition-opacity", loading && "opacity-50")}>
        <TrendChart daily={data.daily} />
      </div>

      {/* Pages + Referrers */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-3 transition-opacity", loading && "opacity-50")}>
        <BarList
          title="En Çok Gezilen Sayfalar"
          icon={FileText}
          items={data.topPages.map((p) => ({
            label: p.path === "/" ? "Ana Sayfa" : p.path,
            value: p.views,
            href: p.path,
          }))}
        />
        <BarList
          title="Trafik Kaynakları"
          icon={Globe}
          items={data.referrers.map((r) => ({ label: r.source, value: r.count }))}
        />
      </div>

      {/* Devices + Browsers + Countries */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-3 transition-opacity", loading && "opacity-50")}>
        <BarList
          title="Cihazlar"
          icon={Monitor}
          items={data.devices.map((d) => ({ label: DEVICE_LABEL[d.device] || d.device, value: d.count }))}
        />
        <BarList
          title="Tarayıcılar"
          icon={Activity}
          items={data.browsers.map((b) => ({ label: b.browser, value: b.count }))}
        />
        <BarList
          title="Ülkeler"
          icon={Globe}
          items={data.countries.map((c) => ({ label: COUNTRY[c.country] || c.country, value: c.count }))}
        />
      </div>
    </div>
  )
}
