"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SERVICES } from "@/components/public/sections/services-data"

interface ServiceHeroVisualProps {
  /** Service slug — icon resolved client-side to avoid serializing function across RSC boundary */
  slug: string
  index: number
}

export function ServiceHeroVisual({ slug, index }: ServiceHeroVisualProps) {
  const service = SERVICES.find((s) => s.slug === slug)
  const Icon = service?.icon
  if (!Icon) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
      className="relative flex items-center justify-center"
    >
      {/* Outer ring */}
      <div
        className={cn(
          "relative w-48 h-48 md:w-64 md:h-64",
          "border border-[var(--border)]",
          "flex items-center justify-center"
        )}
      >
        {/* Animated glow — saf CSS loop (React 19 Strict Mode'da framer güvenilir değil) */}
        <div className="ff-svc-glow absolute inset-0" />

        {/* Inner square */}
        <div
          className={cn(
            "ff-svc-inner-glow w-24 h-24 md:w-32 md:h-32",
            "bg-[var(--surface)] border border-[var(--ff-purple)]/30",
            "flex items-center justify-center"
          )}
        >
          <Icon
            size={40}
            className="text-[var(--ff-purple)]"
            strokeWidth={1.5}
          />
        </div>

        {/* Service index badge */}
        <span
          className={cn(
            "absolute top-3 right-3",
            "font-mono text-[10px] font-bold tracking-[0.15em]",
            "text-[var(--foreground-faint)]"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Corner marks */}
        {(["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"] as const).map((pos, i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute w-4 h-4 ${pos}`}
            style={{
              borderTop: "1px solid rgba(255, 79, 216,0.4)",
              borderLeft: "1px solid rgba(255, 79, 216,0.4)",
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
