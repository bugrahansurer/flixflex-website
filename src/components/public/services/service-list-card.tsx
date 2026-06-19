"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint,
  Clapperboard,
  Globe,
  Search,
  Target,
  Film,
  LayoutGrid,
  PenTool,
  Camera,
  FileText,
  MessageCircle,
  Video,
  TrendingUp,
  Shapes,
  BookOpen,
  Lightbulb,
  Layout,
  Sparkles,
  Scissors,
  Monitor,
  Code2,
  Zap,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"
import type { Service } from "@/components/public/sections/services-data"

const ICONS = {
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint,
  Clapperboard,
  Globe,
  Search,
  Target,
  Film,
  LayoutGrid,
  PenTool,
  Camera,
  FileText,
  MessageCircle,
  Video,
  TrendingUp,
  Shapes,
  BookOpen,
  Lightbulb,
  Layout,
  Sparkles,
  Scissors,
  Monitor,
  Code2,
  Zap,
} as const

interface ServiceListCardProps {
  service: Service
  index: number
}

export function ServiceListCard({ service, index }: ServiceListCardProps) {
  const Icon = service.icon ?? ICONS[(service.iconKey as keyof typeof ICONS) || "Globe"] ?? Globe
  const isEven = index % 2 === 0

  return (
    <motion.article
      variants={fadeInUp}
      className={cn(
        "group relative",
        "border-b border-[var(--border)] last:border-b-0"
      )}
    >
      {/* Full-card link overlay — accessibility + click area */}
      <Link
        href={`/hizmetler/${service.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${service.title} hizmetini incele`}
        tabIndex={-1}
      />

      <div
        className={cn(
          "relative flex flex-col md:flex-row gap-0",
          "transition-colors duration-300",
          "group-hover:bg-[var(--surface)]",
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        )}
      >
        {/* ── Visual panel ── */}
        <div
          className={cn(
            "flex items-center justify-center",
            "md:w-72 lg:w-80 xl:w-96 flex-shrink-0",
            "py-12 px-8",
            "bg-[var(--surface)] border-b md:border-b-0",
            isEven ? "md:border-r border-[var(--border)]" : "md:border-l border-[var(--border)]",
            "transition-colors duration-300",
            "group-hover:bg-[var(--surface-elevated)]"
          )}
        >
          <div className="relative flex flex-col items-center gap-4">
            {/* Number */}
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--foreground-faint)]">
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Icon box */}
            <div
              className={cn(
                "w-16 h-16 flex items-center justify-center",
                "border border-[var(--border)] bg-[var(--background)]",
                "text-[var(--foreground-muted)]",
                "transition-[background-color,border-color,color,box-shadow] duration-300",
                "group-hover:bg-[var(--ff-purple)] group-hover:border-[var(--ff-purple)] group-hover:text-white",
                "group-hover:shadow-[0_0_30px_rgba(var(--ff-purple),0.4)]"
              )}
            >
              <Icon size={24} strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* ── Text content ── */}
        <div
          className={cn(
            "flex flex-col justify-center gap-5",
            "flex-1 px-8 py-10 md:py-12",
            isEven ? "md:pl-12 lg:pl-16" : "md:pr-12 lg:pr-16"
          )}
        >
          {/* Title */}
          <h2
            className={cn(
              "font-display text-2xl md:text-3xl lg:text-4xl font-bold",
              "text-[var(--foreground)] leading-tight tracking-tight",
              "transition-colors duration-300"
            )}
          >
            {service.title}
          </h2>

          {/* Description */}
          <p className="text-base text-[var(--foreground-muted)] leading-relaxed max-w-xl">
            {service.description}
          </p>

          {/* Feature bullets */}
          <ul className="flex flex-col gap-2">
            {service.features.map((feature, fi) => (
              <li
                key={fi}
                className="flex items-center gap-2.5 text-[13px] text-[var(--foreground-muted)]"
              >
                <span className="w-4 h-px bg-[var(--ff-purple)] flex-shrink-0" />
                <span className="uppercase tracking-[0.1em]">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Sub-services buttons */}
          {service.subServices && service.subServices.length > 0 && (
            <div className="mt-2 space-y-3 relative z-20">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground-faint)] uppercase">
                Uzmanlık Alanlarımız
              </h4>
              <div className="flex flex-wrap gap-2">
                {service.subServices.map((sub, si) => {
                  const SubIcon = ICONS[sub.iconKey as keyof typeof ICONS] || Globe
                  return (
                    <Link
                      key={si}
                      href={sub.href}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold",
                        "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
                        "transition-all duration-200 hover:shadow-[0_2px_10px_rgba(var(--ff-purple),0.08)]",
                        "rounded-none"
                      )}
                    >
                      <SubIcon size={12} strokeWidth={2} className="opacity-80" />
                      <span>{sub.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA link — visible, styled as text link, z-index above overlay */}
          <Link
            href={`/hizmetler/${service.slug}`}
            className={cn(
              "relative z-20",
              "mt-2 inline-flex items-center gap-2",
              "text-[11px] font-bold tracking-[0.15em] uppercase",
              "text-[var(--foreground-faint)]",
              "transition-colors duration-300",
              "group-hover:text-[var(--ff-purple)]",
              "focus-visible:outline-[var(--ff-purple)]",
              "w-fit"
            )}
          >
            <span>→ Detayı Gör</span>
            <ArrowRight
              size={12}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
