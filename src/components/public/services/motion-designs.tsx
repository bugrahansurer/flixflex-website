"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Hizmet Motion Design'ları
// Her ana hizmet kartının üstünde oynayan, o hizmete özel, canlı
// animasyon sahneleri. Koyu bir "ekran" paneli içinde, marka accent'iyle.
//
// NOT: Animasyonlar SAF CSS keyframe'leridir (bkz. globals.css "Hizmet
// Motion Design'ları" + ".ff-mo-*" utility class'ları). framer-motion 12 +
// React 19 Strict Mode'da repeat:Infinity loop'ları başlamadığı için CSS'e
// taşındı. Keyframe'lere CSS class'larından referans verilir; aksi halde
// Lightning CSS (Tailwind v4) "kullanılmıyor" diye onları budar.
// Gecikmeler (animation-delay) JSX'te inline verilir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Send, Heart, MessageCircle, TrendingUp, Play, Sparkles, MousePointer2,
} from "@/lib/icons"

const ACCENT = "#FF4FD8"
const PANEL = "absolute inset-0 overflow-hidden bg-[#0c0c11]"

/** still ise animasyon class'ı yok (sade kare). */
const mo = (cls: string, still?: boolean): string | null => (still ? null : cls)

// ── 1. E-posta / Performans kampanyası ───────────────────────
function EmailCampaign({ still }: { still?: boolean }) {
  const text = "Kampanyan hazır 🚀"
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
        {/* Bildirim chip'i — yukarıdan düşer */}
        <div
          className={cn("absolute left-1/2 top-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10", mo("ff-mo-email-chip", still))}
          style={{ transform: "translateX(-50%)" }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: ACCENT }}>
            <Send className="h-3 w-3 text-white" />
          </span>
          <span className="text-[11px] font-medium text-white/90">1 yeni gönderim</span>
        </div>

        {/* Compose input */}
        <div className="flex w-full max-w-[260px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">
            {still ? text : <Typewriter text={text} />}
          </span>
          <span
            className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg", mo("ff-mo-send-pulse", still))}
            style={{ background: ACCENT }}
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </span>
        </div>
        <div className="h-1.5 w-[260px] overflow-hidden rounded-full bg-white/5">
          <div
            className={cn("h-full rounded-full", mo("ff-mo-email-bar", still))}
            style={{ background: ACCENT, width: still ? "100%" : "0%" }}
          />
        </div>
      </div>
    </div>
  )
}

// ── 2. Analytics / veri nabzı ────────────────────────────────
function AnalyticsPulse({ still }: { still?: boolean }) {
  const bars = [0.4, 0.7, 0.5, 0.9, 0.65, 1]
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-7">
        <div className="flex items-end justify-between gap-2 h-[55%]">
          {bars.map((h, i) => (
            <span
              key={i}
              className={cn("w-full rounded-t", mo("ff-mo-bar", still))}
              style={{
                background: i === bars.length - 1 ? ACCENT : "rgba(255,255,255,0.16)",
                height: `${h * 100}%`,
                transformOrigin: "bottom",
                animationDelay: still ? undefined : `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
          <span className="font-display text-2xl font-bold text-white tabular-nums">
            {still ? "24.8K" : <CountUp to={24800} />}
          </span>
          <span className="text-[11px] font-semibold text-emerald-400">+12%</span>
        </div>
      </div>
    </div>
  )
}

// ── 3. Sosyal etkileşim ──────────────────────────────────────
function SocialEngage({ still }: { still?: boolean }) {
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[200px] rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-7 w-7 rounded-full" style={{ background: ACCENT }} />
            <div className="space-y-1">
              <span className="block h-2 w-20 rounded bg-white/20" />
              <span className="block h-2 w-12 rounded bg-white/10" />
            </div>
          </div>
          <span className="block h-16 w-full rounded-lg bg-white/[0.06]" />
          <div className="mt-3 flex items-center gap-4 text-white/70">
            <span className={cn("flex items-center gap-1.5", mo("ff-mo-heart", still))}>
              <Heart className="h-4 w-4" style={{ color: ACCENT, fill: ACCENT }} />
              <span className="text-[11px] tabular-nums">{still ? "1.2K" : <CountUp to={1200} compact />}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[11px] tabular-nums">340</span>
            </span>
          </div>
        </div>
        {/* Yükselen kalpler */}
        {!still && [0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute bottom-8 ff-mo-rise"
            style={{ left: `${42 + i * 8}%`, color: ACCENT, animationDelay: `${i * 0.5}s` }}
          >
            <Heart className="h-3.5 w-3.5" style={{ fill: ACCENT }} />
          </span>
        ))}
      </div>
    </div>
  )
}

// ── 4. Marka kimliği ─────────────────────────────────────────
function BrandIdentity({ still }: { still?: boolean }) {
  const swatches = ["#FF4FD8", "#7C3AED", "#06B6D4", "#F59E0B"]
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <div
          className={cn("flex h-16 w-16 items-center justify-center text-2xl font-extrabold text-white", mo("ff-mo-brand", still))}
          style={{ borderRadius: 18, background: ACCENT }}
        >
          FF
        </div>
        <div className="flex gap-2">
          {swatches.map((c, i) => (
            <span
              key={c}
              className={cn("h-3 w-3 rounded-full", mo("ff-mo-swatch", still))}
              style={{ background: c, animationDelay: still ? undefined : `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 5. İçerik / video reel ───────────────────────────────────
function ContentReel({ still }: { still?: boolean }) {
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-7">
        <div className="relative w-full overflow-hidden">
          <div className={cn("flex gap-2", mo("ff-mo-reel", still))}>
            {[...Array(8)].map((_, i) => (
              <span key={i} className="h-16 w-24 flex-shrink-0 rounded-md"
                style={{ background: i % 3 === 0 ? `${ACCENT}40` : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md" style={{ background: ACCENT }}>
            <Play className="h-4 w-4 text-white" style={{ fill: "white" }} />
          </span>
        </div>
        <div className="h-1 w-full max-w-[240px] overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full rounded-full", mo("ff-mo-reel-bar", still))}
            style={{ background: ACCENT, width: still ? "70%" : "0%" }} />
        </div>
      </div>
    </div>
  )
}

// ── 6. Web & dijital — arayüz kuruluyor ──────────────────────
function WebBuild({ still }: { still?: boolean }) {
  const blocks = [
    { w: "100%", h: 14, d: 0 },
    { w: "60%", h: 36, d: 0.4 },
    { w: "100%", h: 24, d: 0.8 },
  ]
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex items-center justify-center p-7">
        <div className="w-full max-w-[230px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="space-y-2 p-3">
            {blocks.map((b, i) => (
              <span key={i} className={cn("block rounded", mo("ff-mo-block", still))}
                style={{
                  width: b.w, height: b.h,
                  background: i === 1 ? `${ACCENT}55` : "rgba(255,255,255,0.10)",
                  animationDelay: still ? undefined : `${b.d * 0.4}s`,
                }} />
            ))}
          </div>
        </div>
        {!still && (
          <span className="absolute ff-mo-cursor" style={{ color: "white" }}>
            <MousePointer2 className="h-4 w-4" style={{ fill: ACCENT }} />
          </span>
        )}
      </div>
    </div>
  )
}

// ── Varsayılan — yumuşak orbit ───────────────────────────────
function DefaultOrbit({ still }: { still?: boolean }) {
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn("absolute h-32 w-32 rounded-full border border-white/10", mo("ff-mo-orbit", still))}>
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full" style={{ background: ACCENT }} />
        </div>
        <div className={cn("absolute h-20 w-20 rounded-full border border-white/10", mo("ff-mo-orbit-rev", still))}>
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/40" />
        </div>
        <Sparkles className="h-6 w-6" style={{ color: ACCENT }} />
      </div>
    </div>
  )
}

// ── Registry ─────────────────────────────────────────────────
export interface MotionDesign {
  id: string
  label: string
  /** Hizmet eşlemesi için anahtar kelimeler (title/iconKey içinde aranır) */
  keywords: string[]
  Component: React.FC<{ still?: boolean }>
}

export const MOTION_DESIGNS: Record<string, MotionDesign> = {
  "email-campaign": { id: "email-campaign", label: "E-posta / Kampanya", keywords: ["mail", "email", "e-posta", "performance", "performans", "pazarlama", "marketing", "send", "campaign"], Component: EmailCampaign },
  "analytics-pulse": { id: "analytics-pulse", label: "Analytics / Veri", keywords: ["analytic", "analiz", "data", "veri", "growth", "büyüme", "seo", "trend"], Component: AnalyticsPulse },
  "social-engage": { id: "social-engage", label: "Sosyal Medya", keywords: ["social", "sosyal", "media", "medya", "community", "topluluk", "instagram"], Component: SocialEngage },
  "brand-identity": { id: "brand-identity", label: "Marka Kimliği", keywords: ["brand", "marka", "identity", "kimlik", "creative", "kreatif", "logo", "design", "tasarım"], Component: BrandIdentity },
  "content-reel": { id: "content-reel", label: "İçerik / Video", keywords: ["content", "içerik", "video", "film", "production", "prodüksiyon", "reel", "çekim", "motion"], Component: ContentReel },
  "web-build": { id: "web-build", label: "Web & Dijital", keywords: ["web", "dijital", "digital", "site", "code", "kod", "ux", "ui", "geliştir"], Component: WebBuild },
  "default-orbit": { id: "default-orbit", label: "Varsayılan", keywords: [], Component: DefaultOrbit },
}

export const MOTION_DESIGN_LIST = Object.values(MOTION_DESIGNS)

/** Açık seçim yoksa hizmet adından/ikonundan uygun motion'ı tahmin eder. */
export function resolveMotionDesign(opts: { motionDesign?: string | null; title?: string; iconKey?: string }): MotionDesign {
  if (opts.motionDesign && MOTION_DESIGNS[opts.motionDesign]) return MOTION_DESIGNS[opts.motionDesign]
  const hay = `${opts.title ?? ""} ${opts.iconKey ?? ""}`.toLowerCase()
  for (const d of MOTION_DESIGN_LIST) {
    if (d.keywords.some((k) => hay.includes(k))) return d
  }
  return MOTION_DESIGNS["default-orbit"]
}

// ── Yardımcılar ──────────────────────────────────────────────
function Typewriter({ text }: { text: string }) {
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i = i >= text.length ? 0 : i + 1
      setN(i)
    }, 2400 / (text.length + 6))
    return () => clearInterval(id)
  }, [text])
  return <>{text.slice(0, n)}<span className="opacity-60">{n < text.length ? "|" : ""}</span></>
}

function CountUp({ to, suffix = "", compact = false }: { to: number; suffix?: string; compact?: boolean }) {
  const [v, setV] = React.useState(0)
  React.useEffect(() => {
    let raf = 0
    let start = 0
    const dur = 2200
    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / dur, 1)
      setV(Math.floor(p * to))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(() => { start = 0; raf = requestAnimationFrame(tick) }, 800)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  const fmt = compact && v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toLocaleString("tr-TR")
  return <>{fmt}{suffix}</>
}

/** Kart üstünde motion'ı oynatan sarmalayıcı. Bu motion'lar markanın asıl
 *  görsel özelliği — her zaman oynar (CSS animasyonu). */
export function MotionStage({ design }: { design: MotionDesign }) {
  const Comp = design.Component
  return <Comp still={false} />
}
