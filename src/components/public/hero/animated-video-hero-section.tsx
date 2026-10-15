"use client"

// Page-builder "hero-animated-video" bölümü — page-renderer bunu next/dynamic
// ile yükler; AnimatedVideoHero (compound bileşen) yalnızca bu bölümü
// kullanan sayfaların paketine girer.

import { AnimatedVideoHero, VideoHeroProvider } from "./animated-video-hero"

interface AnimatedVideoHeroSectionProps {
  headline?: string
  subheadline?: string
  videoSrc?: string
  videoSrcMobile?: string
  clipPathVariant?: "inset" | "circle" | "none"
}

export function AnimatedVideoHeroSection(p: AnimatedVideoHeroSectionProps) {
  return (
    <VideoHeroProvider>
      <AnimatedVideoHero.Video
        videoUrl={p.videoSrc}
        videoUrlMobile={p.videoSrcMobile}
      />
      <AnimatedVideoHero.Content>
        <div className="flex flex-col items-center gap-4">
          {p.headline && (
            <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-extrabold text-white tracking-tight leading-none">
              {p.headline}
            </h1>
          )}
          {p.subheadline && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {p.subheadline}
            </p>
          )}
        </div>
      </AnimatedVideoHero.Content>
      {p.clipPathVariant && p.clipPathVariant !== "none" && (
        <AnimatedVideoHero.ClipMask insetRange={p.clipPathVariant === "circle" ? [15, 45] : [0, 35]}>
          <div className="absolute inset-0 bg-[var(--background)]" />
        </AnimatedVideoHero.ClipMask>
      )}
    </VideoHeroProvider>
  )
}
