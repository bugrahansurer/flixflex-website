"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Globe } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { fadeInUp, ease } from "@/lib/animations"
import { TiltCard } from "@/components/ui/tilt-card"
import { FFDivider } from "@/components/ui/ff-divider"
import { SubServiceRow, ICON_MAP } from "./sub-service-row"
import type { Service } from "./services-data"

// ── Number formatter ───────────────────────────────
function padIndex(i: number) {
  return String(i + 1).padStart(2, "0")
}

// ── Props ──────────────────────────────────────────
interface ServiceCardProps {
  service: Service
  index: number
}

// ── Component ──────────────────────────────────────
export function ServiceCard({ service, index }: ServiceCardProps) {
  const iconFromKey = ICON_MAP[service.iconKey ?? ""]
  const Icon = service.icon ?? iconFromKey ?? Globe
  const subServices = service.subServices ?? []

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: ease.entering,
      }}
    >
      <TiltCard
        variant="glass"
        className="overflow-hidden p-5 lg:p-6 h-full"
      >
        <article className="flex h-full flex-col">
          {/* ── Cover image banner (admin-uploaded) ── */}
          {service.coverImage && (
            <div className="relative -mx-5 -mt-5 lg:-mx-6 lg:-mt-6 mb-5 h-32 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.coverImage}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)]/50 to-transparent" />
            </div>
          )}

          {/* ── Top gradient line (visible on hover) ── */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-[2px]",
              "bg-gradient-to-r from-transparent via-[var(--ff-purple)]/30 to-transparent",
              "opacity-0 transition-opacity duration-300",
              "group-hover:opacity-100"
            )}
          />

          {/* ── Top row: number badge + icon box ── */}
          <div className="flex items-start justify-between">
            {/* Number badge */}
            <span
              className={cn(
                "font-mono text-[10px] font-semibold tracking-[0.15em]",
                "text-[var(--foreground-faint)]",
                "select-none"
              )}
            >
              {padIndex(index)}
            </span>

            {/* Icon box — dark bg, white icon */}
            <span
              className={cn(
                "ff-shape-container",
                "flex h-11 w-11 shrink-0 items-center justify-center",
                "rounded-2xl",
                "text-[var(--ff-purple)]",
                "transition-[background-color,border-color] duration-300"
              )}
            >
              <Icon size={22} strokeWidth={1.5} />
            </span>
          </div>

          {/* ── Title ── */}
          <h3
            className={cn(
              "mt-4 font-display text-[18px] font-semibold tracking-tight",
              "text-[var(--foreground)]",
              "lg:text-[21px] leading-tight"
            )}
          >
            {service.title}
          </h3>

          {/* ── Description ── */}
          <p
            className={cn(
              "mt-2.5 text-[13px] leading-relaxed",
              "text-[var(--foreground-muted)]",
              "line-clamp-2",
              "lg:text-[14px]"
            )}
          >
            {service.description}
          </p>

          {/* ── Detail link ── */}
          <Link
            href={`/hizmetler/${service.slug}`}
            className={cn(
              "mt-3 mb-5 inline-flex items-center gap-2",
              "text-[11px] font-semibold",
              "text-[var(--ff-purple)] hover:scale-[0.95]",
              "transition-all duration-300",
              "focus-visible:outline-[var(--ff-purple)]",
              "w-fit"
            )}
          >
            <span>Detaylı İncele</span>
            <motion.span
              className="inline-block"
              variants={{
                rest: { x: 0 },
                hover: { x: 5, transition: { duration: 0.25, ease: ease.smooth } },
              }}
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </motion.span>
          </Link>

          {/* ── Divider ── */}
          {subServices.length > 0 && (
            <>
              <FFDivider variant="purple" className="mb-1" />

              {/* ── Sub-service rows ── */}
              <ul className="mt-1 divide-y divide-[var(--border)]">
                {subServices.map((sub) => (
                  <SubServiceRow
                    key={sub.iconKey + sub.label}
                    iconKey={sub.iconKey}
                    label={sub.label}
                    href={sub.href}
                  />
                ))}
              </ul>
            </>
          )}
        </article>
      </TiltCard>
    </motion.div>
  )
}
