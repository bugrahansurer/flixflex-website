"use client"

import * as React from "react"
import type { SectionBlock } from "@/types/page-builder"
import { cn } from "@/lib/utils"

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  section: SectionBlock
  index: number
  children: React.ReactNode
}

// Sections that render their OWN full-viewport layout (≥100vh) and manage
// their internal height/scroll. When pinned for a parallax/sticky overlap,
// they must NOT be vertically centered (that shifts their first fold up and
// leaves a gap at the bottom). Instead they fill the pin box from the top so
// the fold's bottom edge sits flush against the viewport bottom.
const SELF_SIZED_TYPES = new Set<string>([
  "scroll-expansion-hero",
  "hero-animated-video",
  "woven-light-hero",
  "poem-animation",
])

export const SectionWrapper = React.forwardRef<HTMLDivElement, SectionWrapperProps>(
  ({ section, index, children, className, style, ...props }, ref) => {
    const transition = section.transition || "normal"
    const isPinned = !!section.stickyPin
    const selfSized = SELF_SIZED_TYPES.has(section.type)

    /**
     * Z-INDEX STRATEJİSİ:
     * - Bölümler sıralı olarak yükselen z-index değerlerine sahip olmalı.
     * - Böylece her yeni bölüm bir öncekinin "üstünde" kalır.
     */
    const getStyles = (): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: "relative",
        width: "100%",
        zIndex: 10 + index, // Her bölüm bir öncekinden üstte
        backgroundColor: "var(--background)",
        ...style,
      }

      // STICKY / STICKY PIN veya PARALLAX DECK (Kart Yığılma Geçişi)
      if (transition === "sticky" || transition === "parallax" || isPinned) {
        const isParallax = transition === "parallax"
        return {
          ...base,
          position: "sticky",
          top: 0,
          // Pin to a full viewport. Self-sized heroes top-align their own
          // 100vh fold (no centering) so the bottom edge stays flush with
          // the viewport bottom; the next section overlaps on top via the
          // ascending z-index. Regular content keeps the centered card look.
          height: (transition === "sticky" || isParallax) ? "100vh" : "auto",
          overflow: "hidden",
          // Rounded top + drop shadow only for non-self-sized parallax cards;
          // a full-bleed hero should stay edge-to-edge with no corner radius.
          borderTopLeftRadius: (isParallax && index > 0 && !selfSized) ? "24px" : "0",
          borderTopRightRadius: (isParallax && index > 0 && !selfSized) ? "24px" : "0",
          boxShadow: (isParallax && index > 0 && !selfSized) ? "0 -20px 40px rgba(0,0,0,0.15)" : "none",
        }
      }

      // OVERLAP (Üzerine Binme)
      if (transition === "overlap") {
        return {
          ...base,
          boxShadow: "0 -20px 50px rgba(0,0,0,0.15)", // Üstteki bölümün gölgesi
        }
      }

      return base
    }

    return (
      <div
        ref={ref}
        style={getStyles()}
        className={cn(
          "transition-shadow duration-500 w-full",
          // Center the pinned content ONLY for regular sections. Self-sized
          // heroes fill the 100vh box from the top themselves — centering
          // them shifts the fold up and leaves the reported bottom gap.
          (transition === "sticky" || transition === "parallax" || (isPinned && transition !== "normal")) &&
            !selfSized &&
            "flex items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

SectionWrapper.displayName = "SectionWrapper"

