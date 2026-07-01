"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowUpRight, Play, Volume2, VolumeX } from "@/lib/icons"
import { AnimatedHeading } from "@/components/ui"
import { fadeInUp, withDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { ScrollIndicator } from "./scroll-indicator"
import MuxPlayer from "@/components/ui/lazy-mux-player"
import { getMuxData } from "@/lib/mux-url"

interface HeroVideoSectionProps {
  title?: string
  subtitle?: string
  videoUrl?: string
  videoUrlMobile?: string
  posterUrl?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function HeroVideoSection({
  title,
  subtitle,
  videoUrl = "/hero-background.mp4",
  videoUrlMobile,
  posterUrl,
  primaryCta,
  secondaryCta,
}: HeroVideoSectionProps) {
  const [isMuted, setIsMuted] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Detect mobile for video source
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const effectiveVideoUrl = (isMobile && videoUrlMobile) ? videoUrlMobile : videoUrl
  const isMux = effectiveVideoUrl.includes("mux.com") || (!effectiveVideoUrl.includes("/") && effectiveVideoUrl.length > 10)
  const { playbackId, src } = getMuxData(effectiveVideoUrl)

  return (
    <section
      ref={containerRef}
      className="relative h-[100vh] md:h-[100svh] w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-transparent"
    >
      {/* ── Background Video Container ───────────────── */}
      <motion.div
        style={{ y, scale, opacity }}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <div className="relative h-full w-full overflow-hidden">
          {isMux || src ? (
            <MuxPlayer
              playbackId={playbackId || undefined}
              src={src || undefined}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              poster={posterUrl}
              nohotkeys
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%"
              }}
              streamType="on-demand"
            />
          ) : (
            <video
              autoPlay
              muted={isMuted}
              loop
              playsInline
              poster={posterUrl}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            >
              <source src={effectiveVideoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </motion.div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="relative z-20 h-full w-full flex items-center justify-center px-6 md:px-10 xl:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "ff-shape-container inline-flex items-center gap-2 mb-8",
              "border border-white/20 bg-white/5 backdrop-blur-md",
              "px-4 py-2"
            )}
          >
            <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse rounded-full" />
            <span className="text-[10px] md:text-[11px] font-bold text-white">
              Creative Excellence · 2026
            </span>
          </motion.div>

          {/* Title */}
          <div className="font-display font-extrabold leading-[0.9] tracking-tighter text-white text-[clamp(48px,10vw,140px)] mb-8">
            <AnimatedHeading
              text={title || "Geleceği\nTasarlıyoruz"}
              accentWords={["Tasarlıyoruz", "Creative", "Next", "Dominant"]}
              tag="h1"
              className="block drop-shadow-2xl"
            />
          </div>

          {/* Subtitle */}
          <motion.p
            variants={withDelay(fadeInUp, 1.2)}
            initial="hidden"
            animate="visible"
            className="max-w-2xl text-lg md:text-xl leading-relaxed text-white/80 mb-12 drop-shadow-md"
          >
            {subtitle || "Sınırları zorlayan görsel hikayeler ve çarpıcı prodüksiyonlarla markanızı zirveye taşıyoruz."}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={withDelay(fadeInUp, 1.4)}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-5"
          >
            <Link
              href={primaryCta?.href || "/iletisim"}
              className={cn(
                "ff-shape-button",
                "group inline-flex items-center justify-center gap-3",
                "h-10 px-4 text-sm font-bold uppercase",
                "bg-white text-black hover:bg-[var(--ff-purple)] hover:text-white",
                "transition-all duration-300 transform hover:scale-105"
              )}
            >
              {primaryCta?.label || "Projeyi Başlat"}
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>

            <Link
              href={secondaryCta?.href || "/portfolio"}
              className={cn(
                "ff-shape-button",
                "group inline-flex items-center justify-center gap-3",
                "h-10 px-4 text-sm font-bold uppercase",
                "bg-transparent text-white border border-white/30 hover:border-white hover:bg-white/10",
                "backdrop-blur-sm transition-all duration-300"
              )}
            >
              <Play size={16} fill="currentColor" />
              {secondaryCta?.label || "Showreel İzle"}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Floating Controls ────────────────────────── */}
      <div className="absolute bottom-10 right-10 z-30 flex items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="ff-shape-button w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
          aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator className="absolute bottom-8 left-1/2 -translate-x-1/2" />
    </section>
  )
}
