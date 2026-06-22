"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { Eyebrow } from "@/components/ui/eyebrow"
import { TiltCard } from "@/components/ui/tilt-card"
import { staggerContainer, fadeInUp, ease } from "@/lib/animations"
import {
  PORTFOLIO,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "./portfolio-data"

// ── Filter tab ────────────────────────────────────

interface FilterTabProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterTab({ label, active, onClick }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 whitespace-nowrap px-4 py-3 text-xs font-semibold",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:text-[var(--ff-purple)]",
        active
          ? "text-[var(--ff-purple)]"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="filter-tab-underline"
          className="absolute left-2 right-2 -bottom-px h-0.5 bg-[var(--ff-purple)]"
          transition={{ duration: 0.25, ease: ease.smooth }}
        />
      )}
    </button>
  )
}

// ── Portfolio card ────────────────────────────────

interface CardProps {
  slug: string
  title: string
  client: string
  year: number
  category: PortfolioCategory
  description: string
  gradient: string
  accentColor: string
  coverImage?: string | null
  tall?: boolean
  index: number
}

function PortfolioCard({
  slug,
  title,
  client,
  year,
  category,
  description,
  gradient,
  accentColor,
  coverImage,
  tall = false,
  index,
}: CardProps) {
  return (
    <motion.div
      layout
      key={slug}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: ease.smooth,
      }}
      className={cn(tall ? "row-span-2" : "row-span-1")}
    >
      <TiltCard
        variant="glass"
        as="article"
        className="overflow-hidden h-full"
      >
        {/* ── Card visual ── */}
        <div
          className={cn(
            "ff-shape-container relative w-full",
            !coverImage && "bg-gradient-to-br",
            !coverImage && gradient,
            tall ? "h-full min-h-[420px]" : "h-full"
          )}
        >
          {coverImage ? (
            /* Admin-uploaded cover image */
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            /* Fallback: gradient + client watermark when no cover image */
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p
                className={cn(
                  "font-display font-extrabold leading-[0.85] tracking-[-0.04em]",
                  "text-center break-all",
                  "text-[clamp(28px,5vw,64px)]",
                  "opacity-20 select-none pointer-events-none"
                )}
                style={{ color: accentColor }}
              >
                {client.toUpperCase()}
              </p>
            </div>
          )}

          {/* Category badge — top left */}
          <div className="absolute top-3 left-3 z-10">
            <FFBadge variant="purple">{category} - {year}</FFBadge>
          </div>

          {/* ── Info overlay ── always visible on mobile, hover-reveal on desktop */}
          <div
            className={cn(
              "ff-shape-container absolute inset-0 z-20 flex flex-col justify-end p-5",
              "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
              "transition-all duration-300 ease-out",
              "opacity-100 translate-y-0",
              "md:opacity-0 md:translate-y-[20%] md:group-hover:opacity-100 md:group-hover:translate-y-0"
            )}
          >
            <div className="md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300">
              {/* Client name small */}
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/70 mb-1">
                {client}
              </p>

              {/* Project title */}
              <h3 className="font-display text-base md:text-lg font-bold text-white leading-tight mb-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mb-4">
                {description}
              </p>

              {/* CTA affordance — the whole card is the link */}
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--ff-purple)]">
                Projeyi İncele
                <ArrowRight size={12} />
              </span>
            </div>
          </div>

          {/* Full-card tap/click target → detail page */}
          <Link
            href={`/portfolio/${slug}`}
            className="absolute inset-0 z-30"
            aria-label={`${title} — projeyi incele`}
          />
        </div>
      </TiltCard>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────

interface PortfolioSectionProps {
  items?: typeof PORTFOLIO
}

export function PortfolioSection({ items = PORTFOLIO }: PortfolioSectionProps) {
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory | "all">("all")
  const categories = useMemo(() => {
    const values = Array.from(new Set(items.map((item) => item.category)))
    return [
      { label: "Tümü", value: "all" as const },
      ...values.map((value) => ({ label: value, value })),
    ]
  }, [items])

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : items.filter((item) => item.category === activeFilter),
    [activeFilter, items]
  )

  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden"
      )}
    >
      {/* Subtle background texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">

        {/* ── Section header ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 md:mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-4">
            <Eyebrow>Seçili İşler</Eyebrow>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.05] max-w-3xl"
          >
            İşte çalıştığımız{" "}
            <span className="text-[var(--ff-purple)]">markalar.</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-4 text-[var(--foreground-muted)] text-base md:text-md max-w-xl leading-relaxed"
          >
            Ölçülebilir sonuçlar, cesur tasarımlar. İşte FlixFlex imzası taşıyan seçili projelerden bir bakış.
          </motion.p>
        </motion.div>

        {/* ── Filter tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15, ease: ease.smooth }}
          className={cn(
            "flex gap-1 mb-10 overflow-x-auto border-b border-[var(--border)]",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
          role="group"
          aria-label="Proje kategorisi filtrele"
        >
          {(items === PORTFOLIO ? PORTFOLIO_CATEGORIES : categories).map(({ label, value }) => (
            <FilterTab
              key={value}
              label={label}
              active={activeFilter === value}
              onClick={() => setActiveFilter(value)}
            />
          ))}
        </motion.div>

        {/* ── Masonry-ish grid ── */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            "gap-4 md:gap-5",
            "auto-rows-[260px]"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, index) => (
              <PortfolioCard
                key={item.slug}
                {...item}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state when filter matches nothing */}
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-24 text-center text-[var(--foreground-faint)] text-sm"
            >
              Bu kategoride henüz proje eklenmedi.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Load More ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 flex justify-center"
        >
          <button
            type="button"
            className={cn(
              "ff-btn ff-btn-outline text-xs",
              "group inline-flex items-center gap-3",
              "min-w-[200px] justify-center"
            )}
            aria-label="Daha fazla proje yükle"
          >
            <span>Tümünü Gör</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </motion.div>

      </div>
    </section>
  )
}
