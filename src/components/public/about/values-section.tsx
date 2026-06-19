"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations"
import { VALUES, type Value } from "./about-data"
import { StarField } from "@/components/ui/star-field"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Target, TrendingUp, Sparkles, Star, Rocket, Zap, Shield, type LucideIcon } from "@/lib/icons"

// Icon-key → component map for admin-configured value cards.
const VALUE_ICONS: Record<string, LucideIcon> = {
  Target, TrendingUp, Sparkles, Star, Rocket, Zap, Shield,
}

interface ValueItemInput {
  iconKey?: string
  titleTr?: string
  title?: string
  tagline?: string
  description?: string
}

// ── Individual value card ──────────────────────────────
function ValueCard({ value, index }: { value: Value; index: number }) {
  const Icon = value.icon

  return (
    <motion.div
      variants={fadeInUp}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="h-full"
    >
      <motion.div
        variants={cardHover}
        className={cn(
          "ff-shape-container group relative flex flex-col gap-5 h-full",
          "bg-[var(--surface-elevated)] border border-[var(--border)]",
          "p-6 md:p-8",
          "transition-[border-color] duration-300",
          "hover:border-[rgba(255, 79, 216,0.45)]"
        )}
      >
        {/* Purple top border on hover */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ff-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Index */}
        <span className="font-mono text-[10px] font-semibold tracking-[0.15em] text-[var(--foreground-faint)]">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Icon */}
        <div
          className={cn(
            "ff-shape-container w-12 h-12 flex items-center justify-center",
            "border border-[var(--border)]",
            "bg-[var(--surface)]",
            "text-[var(--foreground-muted)]",
            "transition-[background-color,border-color,color,box-shadow] duration-300",
            "group-hover:bg-[var(--ff-purple)] group-hover:border-[var(--ff-purple)] group-hover:text-white",
            "group-hover:shadow-[0_0_20px_rgba(255, 79, 216,0.4)]"
          )}
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>

        {/* Title block */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--ff-purple)] mb-1">
            {value.titleTr}
          </p>
          <h3 className="font-display text-xl md:text-2xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
            {value.title}
          </h3>
        </div>

        {/* Tagline */}
        <p
          className={cn(
            "text-sm font-medium text-[var(--foreground)] leading-snug",
            "border-l-2 border-[var(--ff-purple)] pl-3",
            "transition-colors duration-300"
          )}
        >
          {value.tagline}
        </p>

        {/* Description */}
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed flex-1">
          {value.description}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────
interface ValuesSectionProps {
  eyebrow?: string
  headline?: string
  subheadline?: string
  items?: ValueItemInput[]
}

export function ValuesSection({ eyebrow, headline, subheadline, items }: ValuesSectionProps = {}) {
  const list: Value[] =
    items && items.length > 0
      ? items.map((it, i) => ({
          slug: `value-${i}`,
          title: it.title ?? it.titleTr ?? "",
          titleTr: it.titleTr ?? "",
          icon: VALUE_ICONS[it.iconKey ?? "Star"] ?? Star,
          tagline: it.tagline ?? "",
          description: it.description ?? "",
        }))
      : VALUES
  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden"
      )}
    >
      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      {/* Top right accent */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(255, 79, 216,0.07) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-14 md:mb-20 text-center"
        >
          <Eyebrow align="center" className="mb-4">{eyebrow ?? "Temel Değerlerimiz"}</Eyebrow>
          <h2
            className={cn(
              "font-display font-extrabold leading-[1.08] tracking-[-0.03em]",
              "text-[clamp(2rem,4.5vw,3.5rem)]",
              "text-[var(--foreground)]"
            )}
          >
            {headline ?? (
              <>
                İşimizin{" "}
                <span className="text-[var(--ff-purple)]">DNA&apos;sı</span> bu.
              </>
            )}
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
            {subheadline ??
              "Her kararımızı, her çalışmamızı ve her müşteri ilişkimizi şekillendiren dört temel değer."}
          </p>
        </motion.div>

        {/* Values grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {list.map((value, i) => (
            <div key={value.slug} className="bg-[var(--background)]">
              <ValueCard value={value} index={i} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
