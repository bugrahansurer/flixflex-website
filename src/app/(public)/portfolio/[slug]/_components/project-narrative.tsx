"use client"

import { motion } from "framer-motion"
import { staggerContainer, fadeInRight, fadeInUp } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import type { PortfolioItem } from "@/components/public"

interface ProjectNarrativeProps {
  project: PortfolioItem
}

export function ProjectNarrative({ project }: ProjectNarrativeProps) {
  // Real admin-entered content only — no fabricated boilerplate.
  const paragraphs = (project.narrativeParagraphs ?? []).filter((p) => p?.trim())
  const sidebarItems = (project.sidebarItems ?? []).filter(
    (s) => s?.heading?.trim() && s?.body?.trim()
  )

  const hasParagraphs = paragraphs.length > 0
  const hasSidebar = sidebarItems.length > 0

  // Nothing real to show → hide the whole section.
  if (!hasParagraphs && !hasSidebar) return null

  const twoCol = hasParagraphs && hasSidebar

  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden"
      )}
    >
      {/* Subtle dot bg */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className={cn("grid gap-12 lg:gap-16 items-start", twoCol ? "lg:grid-cols-12" : "grid-cols-1")}>

          {/* ── Long-form narrative ── */}
          {hasParagraphs && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className={cn("space-y-6", twoCol ? "lg:col-span-8" : "max-w-3xl")}
            >
              <motion.div variants={fadeInUp}>
                <Eyebrow>Proje Hikâyesi</Eyebrow>
              </motion.div>

              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  variants={fadeInUp}
                  className={cn(
                    "leading-relaxed text-[var(--foreground-muted)]",
                    i === 0
                      ? "text-lg md:text-xl font-medium text-[var(--foreground)]"
                      : "text-base md:text-lg"
                  )}
                >
                  {para}
                </motion.p>
              ))}
            </motion.div>
          )}

          {/* ── Sidebar ── */}
          {hasSidebar && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className={cn(
                "ff-shape-container space-y-0 border border-[var(--border)]",
                twoCol ? "lg:col-span-4" : "max-w-md"
              )}
            >
              {sidebarItems.map((item, i) => (
                <motion.div
                  key={item.heading}
                  variants={fadeInRight}
                  className={cn(
                    "p-6",
                    i !== sidebarItems.length - 1 && "border-b border-[var(--border)]"
                  )}
                >
                  {/* Heading with accent bar */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-px bg-[var(--ff-purple)]" />
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-[var(--foreground)]">
                      {item.heading}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
