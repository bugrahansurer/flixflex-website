/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { StarField } from "@/components/ui/star-field"
import { ArrowUpRight, Maximize2, X, Play, Pause } from "@/lib/icons"

// ═══════════════════════════════════════════════════
// ModernManifestoSection — Next-Gen Inline Edition
// ═══════════════════════════════════════════════════

export interface ModernManifestoProps {
  leftText?: string
  mediaUrl1?: string
  mediaType1?: "video" | "image"
  mediaUrl2?: string
  mediaType2?: "video" | "image"
  mediaUrl3?: string
  mediaType3?: "video" | "image"
  rightContent?: string
  ctaLabel?: string
  ctaHref?: string
  hideMobileDock?: boolean
}

/* ── Segment Types & Parsing ─────────────────────── */

interface TextSegment {
  type: "text"
  value: string
}

interface MediaSegment {
  type: "media"
  index: 1 | 2 | 3
}

type Segment = TextSegment | MediaSegment

// Custom parser that preserves trailing/leading spaces around media tags
function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = []
  const regex = /\[media([123])\]/g
  let lastIndex = 0

  for (const match of raw.matchAll(regex)) {
    const before = raw.slice(lastIndex, match.index)
    if (before) {
      segments.push({ type: "text", value: before })
    }
    segments.push({ type: "media", index: Number(match[1]) as 1 | 2 | 3 })
    lastIndex = match.index! + match[0].length
  }

  const remaining = raw.slice(lastIndex)
  if (remaining) {
    segments.push({ type: "text", value: remaining })
  }
  return segments
}

/* ── Media Type Auto-Detection Helper ────────────── */

function getResolvedMediaType(url?: string, type?: "video" | "image"): "video" | "image" {
  if (!url) return "image"

  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase()
  const isImageExt = cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".svg")
  const isVideoExt = cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov")

  if (isImageExt && type === "video") return "image"
  if (isVideoExt && type === "image") return "video"
  if (type === "video" || type === "image") return type

  if (isVideoExt || url.includes("mixkit.co/videos")) {
    return "video"
  }
  return "image"
}

/* ── Grain Overlay ───────────────────────────────── */

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  )
}

/* ── Inline Media Capsule ────────────────────────── */

interface MediaCapsuleProps {
  url?: string
  mediaType?: "video" | "image"
  accentHex: string
  onExpand: () => void
  width?: string
}

const capsuleVariants = {
  hidden: { y: "40%", opacity: 0, scale: 0.8 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14
    }
  }
}

function MediaCapsule({ url, mediaType, accentHex, onExpand, width = "3em" }: MediaCapsuleProps) {
  if (!url) return null

  const resolvedMediaType = getResolvedMediaType(url, mediaType)

  return (
    <motion.span
      variants={capsuleVariants}
      className={cn(
        "relative inline-flex items-center justify-center align-middle",
        "mx-1.5 md:mx-2.5",
        "overflow-hidden rounded-[0.14em]",
        "shadow-2xl",
        "cursor-pointer group/capsule select-none"
      )}
      style={{
        width: width,
        height: "1.05em"
      }}
      whileHover={{ scale: 1.06, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onExpand}
    >
      {/* Dynamic light ring glow */}
      <div
        aria-hidden
        className="absolute -inset-1 opacity-0 group-hover/capsule:opacity-100 transition-opacity duration-500 blur-sm -z-10"
        style={{
          background: `radial-gradient(circle, ${accentHex}aa 0%, transparent 80%)`,
        }}
      />

      {/* Media content */}
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[0.14em] bg-[var(--surface)]">
        {resolvedMediaType === "video" ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/capsule:scale-110"
          />
        ) : (
          <img
            src={url}
            alt="manifesto visual capsule"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/capsule:scale-110"
            loading="lazy"
          />
        )}

        {/* Hover overlay shade */}
        <div className="absolute inset-0 bg-black/10 group-hover/capsule:bg-black/0 transition-colors duration-300" />

        {/* Maximize action indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/capsule:opacity-100 transition-all duration-300">
          <Maximize2 className="w-3.5 h-3.5 text-white/90 transform scale-75 group-hover/capsule:scale-100 transition-transform duration-300" />
        </div>
      </div>
    </motion.span>
  )
}

/* ── Interactive Modal ────────────────────────────── */

interface MediaModalProps {
  url?: string
  mediaType?: "video" | "image"
  onClose: () => void
  accentHex: string
}

function MediaModal({ url, mediaType, onClose, accentHex }: MediaModalProps) {
  const [isPlaying, setIsPlaying] = React.useState(true)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative max-w-4xl w-full aspect-video overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Container */}
        <div className="w-full h-full relative group">
          {mediaType === "video" ? (
            <>
              <video
                ref={videoRef}
                src={url}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
                onClick={togglePlay}
              />
              <button
                onClick={togglePlay}
                className="absolute bottom-6 left-6 p-4 bg-black/60 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 hover:bg-black/80"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <img src={url} alt="Expanded visual" className="w-full h-full object-cover" />
          )}

          {/* Glowing Aura Frame */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              boxShadow: `inset 0 0 40px ${accentHex}`,
            }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-black/60 border border-white/10 text-white hover:scale-105 transition-transform duration-200 hover:bg-black/85"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── Main Component ──────────────────────────────── */

export function ModernManifestoSection({
  leftText = "WE ARE [media1] FLIXFLEX WE [media2] DO BIG [media3] THINGS",
  mediaUrl1 = "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-looking-at-camera-34293-large.mp4",
  mediaType1 = "video",
  mediaUrl2 = "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-using-smartphone-40742-large.mp4",
  mediaType2 = "video",
  mediaUrl3 = "https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-ocean-1527-large.mp4",
  mediaType3 = "video",
  rightContent = "<p>We solve big problems with strategy and creative that make a big impact.</p><p>We work with brands and marketers that have the biggest ambitions.</p><p>We hire big talent and bring them big opportunities that build boundless careers.</p>",
  ctaLabel = "Birlikte Çalışalım",
  ctaHref = "/iletisim",
}: ModernManifestoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(contentRef, { once: true, margin: "-120px" })

  // Spotlight effect coordinates
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const spotlightX = useSpring(mouseX, { stiffness: 60, damping: 25 })
  const spotlightY = useSpring(mouseY, { stiffness: 60, damping: 25 })

  // Active expanded media modal
  const [activeMedia, setActiveMedia] = React.useState<{
    url?: string
    type?: "video" | "image"
  } | null>(null)

  const mediaMap: Record<number, { url?: string; type?: "video" | "image" }> = React.useMemo(() => ({
    1: { url: mediaUrl1, type: mediaType1 },
    2: { url: mediaUrl2, type: mediaType2 },
    3: { url: mediaUrl3, type: mediaType3 },
  }), [mediaUrl1, mediaType1, mediaUrl2, mediaType2, mediaUrl3, mediaType3])

  // Parse input segments
  const segments = React.useMemo(() => parseSegments(leftText || ""), [leftText])

  /* Colors are locked to the active theme — not user-configurable. */
  const resolvedBg = "var(--background)"
  const resolvedText = "var(--foreground)"
  const resolvedAccent = "var(--ff-purple)"
  // Hex equivalent of the default theme primary, used for the rgba glow/aura
  // effects where a CSS var with alpha suffix isn't valid.
  const accentHex = "#FF4FD8"

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  // Split text segments into words for precise character animations
  const renderTextSegment = (text: string, segmentIndex: number) => {
    // Preserve spaces by splitting while keeping spacing patterns
    const tokens = text.split(/(\s+)/)

    return tokens.map((token, tokenIdx) => {
      if (token.trim() === "") {
        return <span key={`space-${segmentIndex}-${tokenIdx}`}>{token}</span>
      }

      return (
        <motion.span
          key={`word-${segmentIndex}-${tokenIdx}`}
          className="inline-block relative overflow-hidden align-bottom"
          variants={{
            hidden: { y: "100%", opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 15
              }
            }
          }}
        >
          <span
            className="inline-block transition-all duration-300 hover:text-[var(--manifesto-accent)] hover:-translate-y-0.5 cursor-default"
          >
            {token}
          </span>
        </motion.span>
      )
    })
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex items-center justify-center w-full min-h-screen md:h-screen overflow-hidden py-24 md:py-0",
        // Background/text come from the resolved theme vars in `style` below;
        // keep only the structural classes here so the section adapts to the
        // active light/dark theme instead of being locked to a dark palette.
        "transition-colors duration-700 ease-in-out border-b border-[var(--border)]"
      )}
      style={{
        "--manifesto-bg": resolvedBg,
        "--manifesto-text": resolvedText,
        "--manifesto-accent": resolvedAccent,
        backgroundColor: resolvedBg,
        color: resolvedText,
      } as React.CSSProperties}
    >
      {/* Tactile Grids & Overlays */}
      <GrainOverlay />

      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      {/* Cursor spotlight halo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[130px] z-0"
        style={{
          left: spotlightX,
          top: spotlightY,
          background: `radial-gradient(circle, ${accentHex}33 0%, transparent 70%)`,
        }}
      />

      {/* Decorative Ambient Aura Nodes */}
      <div className="pointer-events-none absolute top-1/4 -left-20 w-80 h-80 blur-[120px] opacity-[0.06]" style={{ backgroundColor: accentHex }} />
      <div className="pointer-events-none absolute bottom-1/4 -right-20 w-96 h-96 blur-[140px] opacity-[0.04]" style={{ backgroundColor: accentHex }} />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20">

        {/* Core Manifesto Box */}
        <motion.div
          ref={contentRef}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.03
              }
            }
          }}
          className={cn(
            "w-full text-justify [text-align-last:justify] font-display font-black",
            "text-[clamp(1.8225rem,5.67vw,4.86rem)] md:text-[clamp(3rem,6vw,6rem)]",
            "leading-[1.5] md:leading-[2.1] tracking-[0.015em] uppercase"
          )}
        >
          {segments.map((seg, idx) => {
            if (seg.type === "text") {
              return (
                <React.Fragment key={`seg-${idx}`}>
                  {renderTextSegment(seg.value, idx)}
                </React.Fragment>
              )
            } else {
              const media = mediaMap[seg.index]
              return (
                <MediaCapsule
                  key={`seg-${idx}`}
                  url={media?.url}
                  mediaType={media?.type}
                  accentHex={accentHex}
                  width={seg.index === 2 ? "3em" : "2.4em"}
                  onExpand={() => {
                    const resolvedType = getResolvedMediaType(media?.url, media?.type)
                    setActiveMedia({ url: media?.url, type: resolvedType })
                  }}
                />
              )
            }
          })}
        </motion.div>

        {/* Minimal Details Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          {/* Subtle separator with accent pulse */}
          <div className="relative mb-12">
            <div className="h-px w-full" style={{
              background: `linear-gradient(90deg, ${accentHex}33 0%, var(--border) 50%, transparent 100%)`
            }} />
            <div
              className="absolute left-0 top-0 h-px w-24"
              style={{ backgroundColor: accentHex }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Descriptive Brand Quote */}
            {rightContent && (() => {
              const hasHtml = /<\/?[a-z][\s\S]*>/i.test(rightContent)
              if (hasHtml) {
                return (
                  <div
                    className="lg:col-span-8 text-[var(--foreground-muted)] text-xs sm:text-base md:text-sm leading-relaxed max-w-2xl font-light space-y-4 [&_p]:text-inherit"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(rightContent) }}
                  />
                )
              }
              const lines = rightContent.split(/\r?\n/).filter((line) => line.trim() !== "")
              return (
                <div className="lg:col-span-8 text-[var(--foreground-muted)] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-light space-y-4">
                  {lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )
            })()}

            {/* Interactive Call to Action */}
            {ctaLabel && (
              <div className="lg:col-span-4 lg:flex lg:justify-end">
                <a
                  href={ctaHref || "#"}
                  className="ff-shape-button group relative inline-flex items-center gap-3.5 h-12 px-8 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--ff-purple)]/40 text-xs font-bold text-[var(--foreground)] overflow-hidden transition-all duration-300"
                >
                  {/* Glowing background flow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"
                    style={{
                      background: `radial-gradient(circle at center, ${accentHex}1a 0%, transparent 80%)`
                    }}
                  />
                  <span className="relative z-10">{ctaLabel}</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--ff-purple)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                  {/* Subtle inner hover glow line */}
                  <div className="absolute inset-0 scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" style={{
                    boxShadow: `inset 0 0 12px ${accentHex}20`
                  }} />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Expanded Media Modal */}
      <AnimatePresence>
        {activeMedia && (
          <MediaModal
            url={activeMedia.url}
            mediaType={activeMedia.type}
            accentHex={accentHex}
            onClose={() => setActiveMedia(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
