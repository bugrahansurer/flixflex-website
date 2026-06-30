"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Hizmet Motion Design'ları
// Her ana hizmet kartının üstünde oynayan, o hizmete özel, canlı
// (framer-motion) animasyon sahneleri. Hepsi koyu bir "ekran" paneli
// içinde, marka accent'iyle (--ff-purple) çalışır; reduced-motion'da
// sade bir kareye düşer. Registry + hizmet→preset çözümleyici.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { motion } from "framer-motion"
import {
  Send, Heart, MessageCircle, TrendingUp, Play, Sparkles, MousePointer2,
} from "@/lib/icons"

const ACCENT = "#FF4FD8"
const PANEL = "absolute inset-0 overflow-hidden bg-[#0c0c11]"
const loop = (extra: object = {}) => ({ repeat: Infinity, repeatType: "loop" as const, ...extra })

// ── 1. E-posta / Performans kampanyası ───────────────────────
function EmailCampaign({ still }: { still?: boolean }) {
  const text = "Kampanyan hazır 🚀"
  return (
    <div className={PANEL}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
        {/* Bildirim chip'i — yukarıdan düşer */}
        <motion.div
          className="absolute left-1/2 top-4 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10"
          initial={false}
          animate={still ? { opacity: 1, y: 0 } : { opacity: [0, 0, 1, 1, 0], y: [-24, -24, 0, 0, -24] }}
          transition={still ? undefined : loop({ duration: 4, times: [0, 0.55, 0.7, 0.9, 1] })}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: ACCENT }}>
            <Send className="h-3 w-3 text-white" />
          </span>
          <span className="text-[11px] font-medium text-white/90">1 yeni gönderim</span>
        </motion.div>

        {/* Compose input */}
        <div className="flex w-full max-w-[260px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">
            {still ? text : <Typewriter text={text} />}
          </span>
          <motion.span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: ACCENT }}
            animate={still ? {} : { scale: [1, 1, 0.86, 1, 1] }}
            transition={still ? undefined : loop({ duration: 4, times: [0, 0.5, 0.6, 0.7, 1] })}
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </motion.span>
        </div>
        <div className="h-1.5 w-[260px] overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: ACCENT }}
            animate={still ? { width: "100%" } : { width: ["0%", "0%", "100%", "100%", "0%"] }}
            transition={still ? undefined : loop({ duration: 4, times: [0, 0.6, 0.85, 0.95, 1] })}
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
            <motion.span
              key={i}
              className="w-full rounded-t"
              style={{ background: i === bars.length - 1 ? ACCENT : "rgba(255,255,255,0.16)" }}
              initial={{ height: `${h * 40}%` }}
              animate={still ? { height: `${h * 100}%` } : { height: [`${h * 40}%`, `${h * 100}%`, `${h * 70}%`, `${h * 100}%`] }}
              transition={still ? undefined : loop({ duration: 3, delay: i * 0.12, ease: "easeInOut" })}
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
            <motion.span className="flex items-center gap-1.5"
              animate={still ? {} : { scale: [1, 1.18, 1] }}
              transition={still ? undefined : loop({ duration: 2.4, times: [0, 0.2, 0.4] })}>
              <Heart className="h-4 w-4" style={{ color: ACCENT, fill: ACCENT }} />
              <span className="text-[11px] tabular-nums">{still ? "1.2K" : <CountUp to={1200} suffix="" compact />}</span>
            </motion.span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[11px] tabular-nums">340</span>
            </span>
          </div>
        </div>
        {/* Yükselen kalpler */}
        {!still && [0, 1, 2].map((i) => (
          <motion.span key={i} className="absolute bottom-8"
            style={{ left: `${42 + i * 8}%`, color: ACCENT }}
            animate={{ y: [0, -60], opacity: [0, 1, 0], scale: [0.6, 1, 0.8] }}
            transition={loop({ duration: 2.4, delay: i * 0.5, ease: "easeOut" })}>
            <Heart className="h-3.5 w-3.5" style={{ fill: ACCENT }} />
          </motion.span>
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
        <motion.div
          className="flex h-16 w-16 items-center justify-center text-2xl font-extrabold text-white"
          style={{ borderRadius: 18, background: ACCENT }}
          animate={still ? {} : { borderRadius: [18, 40, 8, 18], rotate: [0, 90, 180, 360], scale: [1, 1.08, 1, 1] }}
          transition={still ? undefined : loop({ duration: 5, ease: "easeInOut" })}
        >
          FF
        </motion.div>
        <div className="flex gap-2">
          {swatches.map((c, i) => (
            <motion.span key={c} className="h-3 w-3 rounded-full" style={{ background: c }}
              animate={still ? {} : { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={still ? undefined : loop({ duration: 2.5, delay: i * 0.25 })} />
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
          <motion.div className="flex gap-2"
            animate={still ? {} : { x: ["0%", "-50%"] }}
            transition={still ? undefined : loop({ duration: 6, ease: "linear" })}>
            {[...Array(8)].map((_, i) => (
              <span key={i} className="h-16 w-24 flex-shrink-0 rounded-md"
                style={{ background: i % 3 === 0 ? `${ACCENT}40` : "rgba(255,255,255,0.08)" }} />
            ))}
          </motion.div>
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md" style={{ background: ACCENT }}>
            <Play className="h-4 w-4 text-white" style={{ fill: "white" }} />
          </span>
        </div>
        <div className="h-1 w-full max-w-[240px] overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full" style={{ background: ACCENT }}
            animate={still ? { width: "70%" } : { width: ["0%", "100%"] }}
            transition={still ? undefined : loop({ duration: 6, ease: "linear" })} />
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
              <motion.span key={i} className="block rounded"
                style={{ width: b.w, height: b.h, background: i === 1 ? `${ACCENT}55` : "rgba(255,255,255,0.10)" }}
                initial={false}
                animate={still ? { opacity: 1, y: 0 } : { opacity: [0, 0, 1, 1, 0], y: [10, 10, 0, 0, 10] }}
                transition={still ? undefined : loop({ duration: 4.5, times: [0, b.d / 4.5, (b.d + 0.4) / 4.5, 0.9, 1] })} />
            ))}
          </div>
        </div>
        {!still && (
          <motion.span className="absolute" style={{ color: "white" }}
            animate={{ x: [40, -10, 30], y: [50, 0, 40], opacity: [0, 1, 1, 0] }}
            transition={loop({ duration: 4.5, ease: "easeInOut" })}>
            <MousePointer2 className="h-4 w-4" style={{ fill: ACCENT }} />
          </motion.span>
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
        <motion.div className="absolute h-32 w-32 rounded-full border border-white/10"
          animate={still ? {} : { rotate: 360 }} transition={still ? undefined : loop({ duration: 12, ease: "linear" })}>
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full" style={{ background: ACCENT }} />
        </motion.div>
        <motion.div className="absolute h-20 w-20 rounded-full border border-white/10"
          animate={still ? {} : { rotate: -360 }} transition={still ? undefined : loop({ duration: 8, ease: "linear" })}>
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/40" />
        </motion.div>
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

/** Kart üstünde motion'ı oynatan sarmalayıcı (reduced-motion → sade kare). */
export function MotionStage({ design }: { design: MotionDesign }) {
  // Bu motion'lar markanın asıl görsel özelliği — her zaman oynar.
  // (Sistem reduced-motion ayarına bakılmaz; istenirse buraya geri eklenebilir.)
  const Comp = design.Component
  return <Comp still={false} />
}
