"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CalendarDays, ArrowRight } from "@/lib/icons"

import { useUIStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Magnetic } from "@/components/ui/magnetic"

interface AppointmentCardSectionProps {
  eyebrow?: string
  headline?: string
  description?: string
  ctaLabel?: string
}

export function AppointmentCardSection({
  eyebrow = "Hızlı Randevu",
  headline = "Ön Görüşme Randevusu Alın",
  description = "Projelerinizi, hedeflerinizi ve nasıl yardımcı olabileceğimizi konuşmak üzere hemen ücretsiz bir ön görüşme randevusu oluşturun.",
  ctaLabel = "Randevu Al",
}: AppointmentCardSectionProps) {
  const setAppointmentModalOpen = useUIStore((state) => state.setAppointmentModalOpen)

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[var(--background)]">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--ff-purple)]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--ff-purple)]/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className={cn(
            "ff-shape-container border border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-xs relative overflow-hidden",
            "p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12"
          )}
        >
          {/* Subtle line glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--ff-purple)]/40 to-transparent" />

          {/* Icon + Texts */}
          <div className="flex flex-col md:flex-row items-start gap-6 max-w-3xl">
            <div className="ff-shape-button w-10 h-10 shrink-0 flex items-center justify-center border border-[var(--ff-purple)]/20 bg-[var(--ff-purple)]/10 text-[var(--ff-purple)]">
              <CalendarDays size={24} className="stroke-[1.5]" />
            </div>
            <div>
              <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight mb-4">
                {headline}
              </h2>
              <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center">
            <Magnetic>
              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className={cn(
                  "ff-shape-button",
                  "group inline-flex items-center justify-center gap-2.5 h-11",
                  "px-8 py-4 text-[13px] font-semibold cursor-pointer",
                  "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                  "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]",
                  "hover:shadow-[0_4px_24px_rgba(255, 79, 216,0.4)]",
                  "transition-all duration-200 whitespace-nowrap"
                )}
              >
                <span>{ctaLabel}</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
