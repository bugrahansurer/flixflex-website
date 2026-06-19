"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer } from "@/lib/animations"

interface ImageTextSectionProps {
  headline?: string
  body?: string
  imageUrl?: string
  imageAlt?: string
  imagePosition?: "left" | "right"
  ctaLabel?: string
  ctaHref?: string
}

export function ImageTextSection({
  headline,
  body,
  imageUrl,
  imageAlt = "FlixFlex Image",
  imagePosition = "right",
  ctaLabel,
  ctaHref,
}: ImageTextSectionProps) {
  return (
    <section className="relative bg-[var(--background)] py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className={cn(
            "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center",
            imagePosition === "left" && "lg:direction-rtl"
          )}
        >
          {/* Text Content */}
          <motion.div
            variants={fadeInUp}
            className={cn(
              "order-2",
              imagePosition === "left" ? "lg:order-2" : "lg:order-1"
            )}
          >
            {headline && (
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-6 leading-tight tracking-tight">
                {headline}
              </h2>
            )}
            {body && (
              <p className="text-lg text-[var(--foreground-muted)] leading-relaxed mb-8">
                {body}
              </p>
            )}
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className={cn(
                  "ff-shape-button inline-flex items-center gap-2.5",
                  "px-8 py-4 text-sm font-bold",
                  "bg-[var(--ff-purple)] text-white hover:bg-[var(--ff-purple-hover)] transition-all"
                )}
              >
                {ctaLabel}
                <ArrowUpRight size={18} />
              </Link>
            )}
          </motion.div>

          {/* Image Container */}
          <motion.div
            variants={fadeInUp}
            className={cn(
              "order-1 relative",
              imagePosition === "left" ? "lg:order-1" : "lg:order-2"
            )}
          >
            <div className="ff-shape-container aspect-[4/3] relative overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--foreground-faint)]">
                  Görsel bulunamadı
                </div>
              )}
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-[var(--ff-purple)]/40 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-[var(--ff-purple)]/40 pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
