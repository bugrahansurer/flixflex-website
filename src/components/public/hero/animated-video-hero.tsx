"use client"

import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  type MotionValue,
  useReducedMotion,
} from "framer-motion"
import MuxPlayer from "@/components/ui/lazy-mux-player"
import { getMuxData, muxThumbnail, muxPosterSrcSet } from "@/lib/mux-url"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// ═══════════════════════════════════════════════════════════
// AnimatedVideoHero — Context-based scroll-driven video hero
//
// Usage:
//   <VideoHeroProvider>
//     <HeroVideo />
//     <HeroClipMask>
//       <SomeOverlay />
//     </HeroClipMask>
//     <HeroContent>
//       <h1>Title</h1>
//     </HeroContent>
//   </VideoHeroProvider>
// ═══════════════════════════════════════════════════════════

// ── Context ─────────────────────────────────────────────────
interface VideoHeroContextValue {
  scrollYProgress: MotionValue<number>
  containerRef: React.RefObject<HTMLDivElement | null>
}

const VideoHeroContext = React.createContext<VideoHeroContextValue | null>(null)

/**
 * Hook to access the shared scrollYProgress MotionValue within
 * any component rendered inside a VideoHeroProvider.
 */
export function useVideoHero(): VideoHeroContextValue {
  const ctx = React.useContext(VideoHeroContext)
  if (!ctx) {
    throw new Error(
      "useVideoHero must be used within a <VideoHeroProvider>",
    )
  }
  return ctx
}

// ── VideoHeroProvider ───────────────────────────────────────
interface VideoHeroProviderProps {
  children: React.ReactNode
  className?: string
  /** useScroll offset */
  offset?: any
  /** Minimum height utility class override */
  heightClass?: string
}

export function VideoHeroProvider({
  children,
  className,
  offset = ["start start", "end start"],
  heightClass = "h-[100dvh]",
}: VideoHeroProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset,
  })

  const value = React.useMemo<VideoHeroContextValue>(
    () => ({ scrollYProgress, containerRef }),
    [scrollYProgress, containerRef],
  )

  return (
    <VideoHeroContext.Provider value={value}>
      <section
        ref={containerRef}
        className={cn(
          "relative w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-transparent",
          heightClass,
          className,
        )}
      >
        {children}
      </section>
    </VideoHeroContext.Provider>
  )
}

// ── HeroVideo (background) ──────────────────────────────────
interface HeroVideoProps {
  /** Video source URL or Mux playbackId (desktop) */
  videoUrl?: string
  /** Video source URL or Mux playbackId for mobile (optional, falls back to videoUrl) */
  videoUrlMobile?: string
  /** Poster image before video loads */
  posterUrl?: string
  /** Dark overlay strength 0–1 (default: 0.5) */
  overlayStrength?: number
  className?: string
}

export function HeroVideo({
  videoUrl = "/hero-background.mp4",
  videoUrlMobile,
  posterUrl,
  className,
}: HeroVideoProps) {
  const { scrollYProgress } = useVideoHero()
  const shouldReduce = useReducedMotion()
  const isMobileViewport = useMediaQuery("(max-width: 767px)")

  // ── Scroll-driven transforms ──────────────────────────
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const scale = useTransform(
    scrollYProgress,
    [1, 0.4, 0.8, 1],
    [1, 0.5, 1, 1.5],
  )
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // ── Active video URL: mobile override if provided ─────
  const activeVideoUrl =
    isMobileViewport && videoUrlMobile ? videoUrlMobile : videoUrl

  // ── Video source detection ────────────────────────────
  const isMux =
    activeVideoUrl.includes("mux.com") ||
    (!activeVideoUrl.includes("/") && activeVideoUrl.length > 10)
  const { playbackId, src } = getMuxData(activeVideoUrl)

  // LCP optimizasyonu: MuxPlayer dynamic(ssr:false) olduğundan poster'ı yalnızca
  // hydrate sonrası getirir (geç keşif → yüksek LCP). Bunu önlemek için poster'ı
  // SSR'da anında görünen, fetchPriority=high bir <img> olarak da basıyoruz;
  // video hazır olunca üzerini örter. Böylece LCP öğesi ilk HTML'de bulunur.
  const posterSrc =
    posterUrl || (playbackId ? muxThumbnail(playbackId, { width: 1200 }) : undefined)

  return (
    <motion.div
      style={shouldReduce ? {} : { y, scale, opacity }}
      className={cn("absolute inset-0 z-0 h-full w-full", className)}
    >

      {/* Video wrapper */}
      <div className="relative h-full w-full overflow-hidden">
        {/* SSR poster — LCP için anında boyanır, video yüklenince altında kalır */}
        {posterSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            srcSet={playbackId ? muxPosterSrcSet(playbackId) : undefined}
            sizes="100vw"
            alt=""
            aria-hidden
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {isMux || src ? (
          <MuxPlayer
            playbackId={playbackId || undefined}
            src={src || undefined}
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl}
            nohotkeys
            onError={() => { /* headless/kısıtlı ağda geçici MediaError'ı sessizce geç */ }}
            streamType="on-demand"
            className="absolute inset-0 w-full h-full"
            style={{
              width: "100%",
              height: "100%",
              // MuxPlayer shadow DOM CSS variables — bu değişkenler
              // shadow boundary'yi aşarak iç <video> elementine ulaşır.
              ["--media-object-fit" as string]: "cover",
              ["--media-object-position" as string]: "center center",
            }}
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>
    </motion.div>
  )
}

// ── HeroContent (foreground) ────────────────────────────────
interface HeroContentProps {
  children: React.ReactNode
  className?: string
}

export function HeroContent({ children, className }: HeroContentProps) {
  const { scrollYProgress } = useVideoHero()
  const shouldReduce = useReducedMotion()

  const translateY = useTransform(scrollYProgress, [0, 0.6], ["0%", "100%"])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 1, 0])

  return (
    <motion.div
      style={shouldReduce ? {} : { y: translateY, opacity }}
      className={cn(
        "relative z-20 h-full w-full flex items-center justify-center",
        "px-6 md:px-10 xl:px-16 text-center",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

// ── HeroClipMask (scroll-driven clip-path) ──────────────────
interface HeroClipMaskProps {
  children: React.ReactNode
  className?: string
  /**
   * ScrollYProgress → inset percentage range.
   * First value at scrollYProgress=0, second at scrollYProgress=1.
   * Default: [0, 35] — clip grows inward as user scrolls.
   */
  insetRange?: [number, number]
}

export function HeroClipMask({
  children,
  className,
  insetRange = [0, 35],
}: HeroClipMaskProps) {
  const { scrollYProgress } = useVideoHero()
  const shouldReduce = useReducedMotion()

  const insetY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [insetRange[0], insetRange[1], insetRange[0]],
  )
  const insetX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [insetRange[0], insetRange[1] * 0.6, insetRange[0]],
  )

  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}%)`

  return (
    <motion.div
      style={shouldReduce ? {} : { clipPath }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

// ── Namespace Export ────────────────────────────────────────
/**
 * Convenience namespace so consumers can do:
 *   <AnimatedVideoHero.Provider>
 *     <AnimatedVideoHero.Video />
 *     <AnimatedVideoHero.Content>…</AnimatedVideoHero.Content>
 *   </AnimatedVideoHero.Provider>
 */
export const AnimatedVideoHero = {
  Provider: VideoHeroProvider,
  Video: HeroVideo,
  Content: HeroContent,
  ClipMask: HeroClipMask,
} as const
