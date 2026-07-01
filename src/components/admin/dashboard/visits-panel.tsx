"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TrendPoint { date: string; count: number }
interface TopPage { path: string; count: number }

function buildAreaPath(points: TrendPoint[], w: number, h: number, pad: number) {
  const max = Math.max(1, ...points.map((p) => p.count))
  const n = points.length
  const step = n > 1 ? (w - pad * 2) / (n - 1) : 0
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2)
  const x = (i: number) => pad + i * step
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.count).toFixed(1)}`).join(" ")
  const area = `${line} L ${x(n - 1).toFixed(1)} ${h - pad} L ${x(0).toFixed(1)} ${h - pad} Z`
  return { line, area, max }
}

function fmtDay(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })
}

export function VisitsPanel({
  trend,
  topPages,
  activeNow,
}: {
  trend: TrendPoint[]
  topPages: TopPage[]
  activeNow: number
}) {
  const W = 640, H = 180, PAD = 14
  const { line, area, max } = buildAreaPath(trend, W, H, PAD)
  const total = trend.reduce((s, p) => s + p.count, 0)
  const maxPage = Math.max(1, ...topPages.map((p) => p.count))

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      {/* ── Trend chart ── */}
      <div className="xl:col-span-2 ff-shape-container ff-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-[13px] font-bold text-[#333333]">Ziyaret Trendi</h2>
            <p className="text-[11px] text-[#888888]">Son 14 gün · {total.toLocaleString("tr-TR")} görüntülenme</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 text-[11px] font-semibold ff-shape-button">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            {activeNow} aktif
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ff-visits-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4FD8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FF4FD8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* baseline */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#E0E0E0" strokeWidth="1" />
          <path d={area} fill="url(#ff-visits-grad)" />
          <path d={line} fill="none" stroke="#FF4FD8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {trend.map((p, i) => {
            const n = trend.length
            const step = n > 1 ? (W - PAD * 2) / (n - 1) : 0
            const x = PAD + i * step
            const y = H - PAD - (p.count / max) * (H - PAD * 2)
            return <circle key={p.date} cx={x} cy={y} r={i === n - 1 ? 3.5 : 0} fill="#FF4FD8" />
          })}
        </svg>
        <div className="flex justify-between mt-1 text-[10px] text-[#aaaaaa] tabular-nums">
          <span>{trend.length ? fmtDay(trend[0].date) : ""}</span>
          <span>{trend.length ? fmtDay(trend[trend.length - 1].date) : ""}</span>
        </div>
      </div>

      {/* ── Top pages ── */}
      <div className="ff-shape-container ff-card p-4">
        <h2 className="font-display text-[13px] font-bold text-[#333333] mb-3">En Çok Gezilen</h2>
        {topPages.length === 0 ? (
          <p className="text-[12px] text-[#888888] py-6 text-center">Henüz veri yok.</p>
        ) : (
          <ul className="space-y-2.5">
            {topPages.map((p) => (
              <li key={p.path}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href={p.path}
                    target="_blank"
                    className="text-[12px] text-[#333333] font-medium truncate hover:text-[var(--ff-purple)] transition-colors"
                    title={p.path}
                  >
                    {p.path === "/" ? "Ana Sayfa" : p.path}
                  </Link>
                  <span className="text-[11px] font-semibold text-[#666666] tabular-nums shrink-0">
                    {p.count.toLocaleString("tr-TR")}
                  </span>
                </div>
                <div className="h-1 w-full bg-[#EEEEEE] rounded-full overflow-hidden">
                  <div
                    className={cn("h-full bg-[var(--ff-purple)] rounded-full")}
                    style={{ width: `${Math.max(4, (p.count / maxPage) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
