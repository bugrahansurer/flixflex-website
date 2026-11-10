"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Bölüm önizleme kartı (Section Ekle paneli, hover)
// Küçük resimler public/builder-previews/<tip>.webp — bölümün varsayılan
// içerikle 1440px'te çizilmiş hâli. Resmi olmayan tipte ikonlu çizim gösterilir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "@/lib/icons"
import type { SectionMeta } from "@/lib/page-builder/section-registry"

/** Küçük resmi üretilmiş bölüm tipleri */
const PREVIEW_TYPES = new Set([
  "appointment-card", "blog-grid", "blog-hero", "contact-form", "contact-hero",
  "contact-info", "cta", "faq", "hero", "image-text", "manifesto", "modern-manifesto", "poem-animation",
  "portfolio", "portfolio-grid", "portfolio-hero", "portfolio-offer-carousel",
  "portfolio-project-showcase", "portfolio-radial-gallery", "portfolio-vertical-scroll",
  "scroll-expansion-hero", "services", "services-list", "services-showcase", "stats",
  "story", "team", "testimonials", "text-content", "values", "video-embed",
  "video-testimonials", "why-us", "woven-light-hero",
])

const CARD_W = 340
const CARD_H = 330 // konumlama için yaklaşık yükseklik
const GAP = 14

export interface HoverTarget {
  meta: SectionMeta
  /** Kutucuğun ekran konumu */
  rect: DOMRect
  /** Sol panelin sağ kenarı — kart panelin dışına açılır */
  panelRight: number
}

const noopSubscribe = () => () => {}

export function SectionHoverCard({ target }: { target: HoverTarget | null }) {
  // Portal yalnızca tarayıcıda (document.body) kurulur
  const mounted = React.useSyncExternalStore(noopSubscribe, () => true, () => false)
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {target && <Card key={target.meta.type} target={target} />}
    </AnimatePresence>,
    document.body
  )
}

function Card({ target }: { target: HoverTarget }) {
  const { meta, rect, panelRight } = target
  const Icon = meta.icon
  const hasImage = PREVIEW_TYPES.has(meta.type)
  const [imgFailed, setImgFailed] = React.useState(false)
  const showImage = hasImage && !imgFailed

  const left = panelRight + GAP
  const centerY = rect.top + rect.height / 2
  const top = Math.min(Math.max(12, centerY - CARD_H / 2), window.innerHeight - CARD_H - 12)
  // Ok, kutucuğun hizasında kalır
  const arrowTop = Math.min(Math.max(20, centerY - top), CARD_H - 20)

  return (
    <motion.div
      role="tooltip"
      initial={{ opacity: 0, x: -8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -6, transition: { duration: 0.1 } }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed z-[100]"
      style={{ left, top, width: CARD_W }}
    >
      {/* Ok */}
      <span
        aria-hidden
        className="absolute -left-[6px] w-3 h-3 rotate-45 bg-[#121218] border-l border-b border-[#ff4fd8]/40"
        style={{ top: arrowTop - 6 }}
      />

      <div
        className="ff-shape-container relative overflow-hidden bg-[#121218] border border-[#ff4fd8]/40"
        style={{ boxShadow: "0 24px 60px -16px rgba(0,0,0,0.55), 0 0 32px -8px rgba(255,79,216,0.35)" }}
      >
        {/* Görsel */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0b0b0f]">
          {showImage ? (
            <Image
              src={`/builder-previews/${meta.type}.webp`}
              alt=""
              fill
              sizes={`${CARD_W}px`}
              unoptimized
              className="object-cover object-top"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 45%, rgba(255,79,216,0.28), transparent 60%), radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 16px 16px",
              }}
            >
              <div className="ff-shape-button w-16 h-16 flex items-center justify-center bg-[#ff4fd8]/15 border border-[#ff4fd8]/40 text-[#ff4fd8]">
                <Icon size={28} />
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#121218] to-transparent" />
          <span className="absolute top-2.5 left-2.5 ff-shape-button px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase text-[#ff4fd8] bg-black/60 border border-[#ff4fd8]/30 backdrop-blur-sm">
            {meta.category}
          </span>
        </div>

        {/* Metin */}
        <div className="px-4 pt-1 pb-4">
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-[#ff4fd8] shrink-0" />
            <p className="font-display text-[15px] font-bold text-white leading-tight">{meta.label}</p>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/60 line-clamp-2">{meta.description}</p>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[10.5px] font-medium text-[#ff4fd8]">
            <Plus size={12} />
            Tıkla, sayfaya ekle
          </div>
        </div>
      </div>
    </motion.div>
  )
}
