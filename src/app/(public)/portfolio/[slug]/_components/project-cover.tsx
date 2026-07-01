"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"
import type { PortfolioItem } from "@/components/public"

interface ProjectCoverProps {
  project: PortfolioItem
}

// The large project cover visual. Lives below the summary tilt-cards so the
// page reads: title → key facts → the hero image.
export function ProjectCover({ project }: ProjectCoverProps) {
  const { title, client, year, category, gradient, accentColor, coverImage } = project

  return (
    <section className="relative bg-[var(--background)] py-4">
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: ease.smooth }}
          className={cn(
            "ff-shape-container relative w-full overflow-hidden",
            "h-[55vw] max-h-[680px] min-h-[320px]",
            "border border-[var(--border)]",
            !coverImage && "bg-gradient-to-br",
            !coverImage && gradient
          )}
        >
          {coverImage ? (
            /* Admin-uploaded cover image */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              {/* Grid overlay */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Big title watermark */}
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <p
                  className={cn(
                    "font-display font-extrabold text-center break-words",
                    "leading-[0.85] tracking-[-0.04em]",
                    "select-none pointer-events-none",
                    "text-[clamp(48px,9vw,160px)]"
                  )}
                  style={{ color: accentColor, opacity: 0.22 }}
                >
                  {client.toUpperCase()}
                </p>
              </div>
            </>
          )}

          {/* Corner accent marks */}
          {[
            "top-0 left-0",
            "top-0 right-0 rotate-90",
            "bottom-0 right-0 rotate-180",
            "bottom-0 left-0 -rotate-90",
          ].map((cls, i) => (
            <span
              key={i}
              aria-hidden
              className={cn("absolute w-6 h-6 pointer-events-none", cls)}
              style={{
                borderTop: `1px solid ${accentColor}`,
                borderLeft: `1px solid ${accentColor}`,
                opacity: 0.4,
              }}
            />
          ))}

          {/* Corner label */}
          <div className="absolute bottom-5 left-5 z-10">
            <span
              className="ff-shape-container relative flex items-center justify-center bg-[var(--background)]/20 backdrop-blur-sm border-2 border-[var(--ff-purple)]/30 text-center font-bold p-2 text-[11px]"
              style={{ color: accentColor, opacity: 0.6 }}
            >
              {category} · {year}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
