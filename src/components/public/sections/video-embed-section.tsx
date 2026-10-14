"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"

// Doğrudan video dosyası mı (R2/CDN), yoksa YouTube/Vimeo gibi gömülebilir sayfa mı?
const isDirectVideoUrl = (url: string) =>
  /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || url.startsWith("/media-cdn/")

interface VideoEmbedSectionProps {
  headline?: string
  videoUrl?: string
  aspectRatio?: "16/9" | "4/3" | "1/1"
  autoplay?: boolean
}

export function VideoEmbedSection({
  headline,
  videoUrl,
  aspectRatio = "16/9",
  autoplay = false,
}: VideoEmbedSectionProps) {
  // Convert typical watch URL to embed URL if needed
  const embedUrl = React.useMemo(() => {
    if (!videoUrl) return ""
    if (videoUrl.includes("youtube.com/watch?v=")) {
      return videoUrl.replace("watch?v=", "embed/")
    }
    return videoUrl
  }, [videoUrl])

  const ratioClass = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
  }[aspectRatio]

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 bg-[var(--background)] py-0 overflow-hidden">
      <div className="w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mx-auto"
        >
          {headline && (
            <h2 className="font-display text-2xl md:text-4xl font-bold text-[var(--foreground)] mb-10 text-center tracking-tight">
              {headline}
            </h2>
          )}
          
          <div className={cn(
            "ff-shape-container relative overflow-hidden bg-black border border-[var(--border)] shadow-2xl",
            ratioClass
          )}>
            {videoUrl ? (
              isDirectVideoUrl(videoUrl) ? (
                <video
                  src={videoUrl}
                  autoPlay={autoplay}
                  muted={autoplay}
                  loop={autoplay}
                  controls={!autoplay}
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={`${embedUrl}${autoplay ? "?autoplay=1&mute=1" : ""}`}
                  title={headline || "Video Embed"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground-faint)]">
                Video URL belirtilmedi
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
