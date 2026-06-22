"use client"

import * as React from "react"
import Image from "next/image"
import { motion, PanInfo, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "@/lib/icons"
import { cn } from "@/lib/utils"

export interface Testimonial {
  id: number | string
  name: string
  role: string
  company: string
  avatar?: string
  content: string
  rating?: number
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  className?: string
  autoPlay?: boolean
  interval?: number
}

export function TestimonialCarousel({
  testimonials,
  className,
  autoPlay = true,
  interval = 4500,
}: TestimonialCarouselProps) {
  const [current, setCurrent] = React.useState(0)
  const [direction, setDirection] = React.useState(1)

  const go = React.useCallback(
    (dir: 1 | -1) => {
      setDirection(dir)
      setCurrent((p) => (p + dir + testimonials.length) % testimonials.length)
    },
    [testimonials.length]
  )

  // Auto-play
  React.useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => go(1), interval)
    return () => clearInterval(t)
  }, [autoPlay, interval, go])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1)
    else if (info.offset.x > 60) go(-1)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  }

  const t = testimonials[current]

  return (
    <div className={cn("relative select-none", className)}>
      {/* Main card */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={t.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            {/* Card */}
            <div className="ff-shape-container border border-[rgba(255, 52, 197, 0.25)] bg-[var(--surface)] p-4 md:p-6 relative">
              {/* Quote icon */}
              <Quote
                size={32}
                className="absolute top-6 right-8 text-[var(--ff-charcoal)] opacity-20"
                aria-hidden
              />

              {/* Stars */}
              {t.rating && (
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-lg",
                        i < t.rating! ? "text-[var(--ff-charcoal)]" : "text-[var(--border)]"
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <p className="text-base md:text-lg leading-relaxed text-[var(--foreground-muted)] mb-8 italic">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {t.avatar ? (
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover grayscale"
                  />
                ) : (
                  <div className="ff-shape-container w-10 h-10 bg-[var(--ff-charcoal)] flex items-center justify-center text-[#0d0d0d] font-bold text-lg">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-display font-bold text-[var(--foreground)]">
                    {t.name}
                  </p>
                  <p className="text-sm text-[var(--foreground-faint)]">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        {/* Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1)
                setCurrent(i)
              }}
              className={cn(
                "h-0.5 transition-all duration-300",
                i === current
                  ? "w-8 bg-[var(--ff-charcoal)]"
                  : "w-4 bg-[var(--border)] hover:bg-[rgba(255, 79, 216,0.4)]"
              )}
              aria-label={`${i + 1}. referans`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          {[
            { dir: -1 as const, Icon: ChevronLeft, label: "Önceki" },
            { dir: 1 as const, Icon: ChevronRight, label: "Sonraki" },
          ].map(({ dir, Icon, label }) => (
            <button
              key={dir}
              onClick={() => go(dir)}
              aria-label={label}
              className={cn(
                "ff-shape-button w-10 h-10 flex items-center justify-center",
                "border border-[var(--border)]",
                "text-[var(--foreground-muted)]",
                "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
                "transition-colors duration-200"
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
