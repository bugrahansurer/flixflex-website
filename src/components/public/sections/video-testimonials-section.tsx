"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Video Referanslar (page-builder section'ı)
// Metin referanslarının video karşılığı: müşteri video görüşlerini
// izlenebilir kartlarda gösterir. Admin'den (Sayfalar) eklenir; her öğe
// bir video (Mux veya doğrudan URL) + isim/görev/marka içerir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Quote } from "@/lib/icons"
import MuxPlayer from "@/components/ui/lazy-mux-player"

export interface VideoTestimonialItem {
  videoUrl?: string
  posterUrl?: string
  name?: string
  role?: string
  company?: string
}

interface VideoTestimonialsSectionProps {
  eyebrow?: string
  headline?: string
  subheadline?: string
  items?: VideoTestimonialItem[]
}

// stream.mux.com/{ID}.m3u8 → playbackId (HLS'i MuxPlayer güvenilir oynatır)
function getMuxPlaybackId(url?: string): string | null {
  if (!url) return null
  if (url.includes("stream.mux.com/") && !url.includes("token=")) {
    return url.split("stream.mux.com/")[1].split(".m3u8")[0].split("?")[0]
  }
  return null
}

function initialsOf(name?: string): string {
  if (!name) return "FF"
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "FF"
}

function VideoCard({ item, index }: { item: VideoTestimonialItem; index: number }) {
  const muxId = getMuxPlaybackId(item.videoUrl)
  const hasVideo = Boolean(item.videoUrl)

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.07, 0.35), ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group ff-shape-container ff-card overflow-hidden bg-surface/10 backdrop-blur-sm border border-[var(--border)]",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-1 hover:border-[var(--ff-purple)]/45 hover:shadow-[0_20px_60px_rgba(255,79,216,0.14)]",
      )}
    >
      {/* Video */}
      <div className="ff-shape-container relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface)]">
        {muxId ? (
          <MuxPlayer
            playbackId={muxId}
            streamType="on-demand"
            poster={item.posterUrl || undefined}
            playsInline
            className="h-full w-full [--media-object-fit:cover]"
          />
        ) : hasVideo ? (
          <video
            src={item.videoUrl}
            poster={item.posterUrl || undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          // Video henüz eklenmemiş — marka placeholder'ı
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--ff-purple)]/15 via-[var(--surface)] to-[var(--background)]">
            <span className="font-display text-4xl font-extrabold text-[var(--ff-purple)]/70">
              {initialsOf(item.name)}
            </span>
          </div>
        )}
        <Quote className="pointer-events-none absolute right-3 top-3 h-6 w-6 text-white/70 drop-shadow" />
      </div>

      {/* Footer — kişi bilgisi */}
      <div className="flex items-center gap-3 pt-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--ff-purple)]/12 font-display text-[13px] font-bold text-[var(--ff-purple)]">
          {initialsOf(item.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-[var(--foreground)]">{item.name || "İsim Soyisim"}</p>
          <p className="truncate text-[11.5px] text-[var(--foreground-muted)] -mt-1">
            {[item.role, item.company].filter(Boolean).join(" · ") || "Görev · Marka"}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

export function VideoTestimonialsSection({
  eyebrow = "Video Referanslar",
  headline = "Müşterilerimiz Anlatıyor",
  subheadline = "Birlikte büyüdüğümüz markalar, deneyimlerini kendi sözleriyle paylaşıyor.",
  items = [],
}: VideoTestimonialsSectionProps) {
  const list = items.filter(Boolean)
  if (list.length === 0) return null

  const words = headline.trim().split(" ")
  const lead = words.slice(0, -1).join(" ")
  const last = words[words.length - 1]

  return (
    <section className={cn("relative bg-[var(--background)] text-[var(--foreground)]", "py-20 md:py-28 overflow-hidden")}>
      {/* Dot pattern + aura (referanslar section'ıyla aynı doku) */}
      <div aria-hidden className="absolute inset-0 ff-dot-bg opacity-60 pointer-events-none" />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56rem] h-[56rem] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(255,79,216,0.10) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Başlık */}
        <div className="mb-14 md:mb-18 text-center">
          <div className="mb-5">
            <Eyebrow align="center">{eyebrow}</Eyebrow>
          </div>
          <h2 className="font-display font-extrabold leading-[1.08] tracking-tight text-[clamp(32px,5vw,64px)] text-[var(--foreground)]">
            {lead}{lead && " "}<span className="text-[var(--ff-purple)]">{last}</span>
          </h2>
          <p className="mt-5 text-[var(--foreground-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Video kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {list.map((item, i) => (
            <VideoCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
