"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Tag } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { staggerContainer, scaleInUp } from "@/lib/animations"
import { TiltCard } from "@/components/ui/tilt-card"

export interface Offer {
  id: string | number
  imageSrc: string
  imageAlt: string
  tag: string
  title: string
  description: string
  brandLogoSrc: string
  brandName: string
  promoCode?: string
  href: string
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <motion.div
      variants={scaleInUp}
    >
      <TiltCard
        variant="glass"
        as="a"
        href={offer.href}
        className={cn(
          "relative flex-shrink-0 w-[240px] md:w-[300px] h-[400px] md:h-[480px]",
          "cursor-pointer overflow-hidden",
          "!border-0 !bg-transparent",
          "hover:!shadow-[0_0_50px_rgba(255, 79, 216,0.25)]"
        )}
        tiltLimit={12}
        scale={1.03}
      >
        {offer.imageSrc && (
          <div className="absolute inset-0">
            <Image
              src={offer.imageSrc}
              alt={offer.imageAlt}
              fill
              sizes="(max-width: 768px) 240px, 300px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 via-55% to-black/5 to-80% transition-opacity duration-500 group-hover:to-black/20" />

        <div className="absolute inset-0 bg-[var(--ff-purple)]/0 group-hover:bg-[var(--ff-purple)]/8 transition-colors duration-500" />

        <div className="absolute inset-0 ring-1 ring-inset ring-white/0 group-hover:ring-[var(--ff-purple)]/40 transition-all duration-500" />

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="ff-shape-container inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--ff-purple)]/10 backdrop-blur-sm border border-[var(--ff-purple)]/30 text-[11px] font-semibold text-[var(--ff-purple)]">
              <Tag size={10} />
              {offer.tag}
            </span>
          </div>

          <h3 className="text-[12px] md:text-[14px] font-extrabold text-white leading-tight line-clamp-2">
            {offer.title}
          </h3>
          <p className="text-[10px] md:text-[11px] text-white/70 line-clamp-2 leading-relaxed">
            {offer.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                {offer.brandLogoSrc && (
                  <Image
                    src={offer.brandLogoSrc}
                    alt={offer.brandName}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold text-white truncate">
                  {offer.brandName}
                </span>
                {(offer.promoCode || offer.tag) && (
                  <span className="text-[10px] text-white/50 truncate">
                    {offer.promoCode || offer.tag}
                  </span>
                )}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--ff-purple)]/20 border border-[var(--ff-purple)]/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--ff-purple)] group-hover:scale-110 group-hover:rotate-[-30deg] shrink-0">
              <ArrowRight size={15} className="text-[var(--ff-purple)] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}

export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[]
}

const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  ({ offers, className, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = React.useState(false)
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const isInView = useInView(wrapperRef, { once: true, margin: "-80px" })

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    React.useEffect(() => {
      if (offers.length < 2) return

      let rafId: number
      let lastTimestamp = 0

      const animate = (timestamp: number) => {
        const el = scrollRef.current
        if (!el) {
          rafId = requestAnimationFrame(animate)
          return
        }

        if (lastTimestamp === 0) lastTimestamp = timestamp
        const delta = timestamp - lastTimestamp
        lastTimestamp = timestamp

        if (!isPaused && delta < 50) {
          const speed = (0.03 * delta)
          el.scrollLeft += speed

          if (el.scrollLeft >= el.scrollWidth / 2) {
            el.scrollLeft = el.scrollLeft - el.scrollWidth / 2
          }
        }

        rafId = requestAnimationFrame(animate)
      }

      rafId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(rafId)
    }, [isPaused, offers.length])

    const duplicated = offers.length > 2 ? [...offers, ...offers] : offers

    return (
      <div
        ref={setRefs}
        className={cn("relative w-full", className)}
        {...props}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide py-12 pb-20 px-1"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            {duplicated.map((offer, i) => (
              <OfferCard key={`${offer.id}-${i}`} offer={offer} />
            ))}
          </div>
        </motion.div>

        {/* Edge fade overlays — cards smoothly fade out at container edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-14 md:w-32 z-10"
          style={{
            background: "linear-gradient(to right, var(--background), transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-32 z-10"
          style={{
            background: "linear-gradient(to left, var(--background), transparent)",
          }}
        />
      </div>
    )
  }
)
OfferCarousel.displayName = "OfferCarousel"

export { OfferCarousel, OfferCard }

interface RawPortfolioItem {
  id?: string | number
  coverImage?: string
  title?: string
  category?: string
  description?: string
  clientLogo?: string
  client?: string
  year?: number | string
  slug?: string
}

function toRaw(item: unknown, index: number): Offer {
  const it = item as RawPortfolioItem
  return {
    id: it.id ?? index,
    imageSrc: it.coverImage || "",
    imageAlt: it.title || "",
    tag: it.category || "Proje",
    title: it.title || "",
    description: it.description || "",
    brandLogoSrc: it.clientLogo || "",
    brandName: it.client || "FlixFlex",
    promoCode: it.year?.toString() || "",
    href: `/portfolio/${it.slug || "#"}`,
  }
}

export function DemoOfferCarousel({ items }: { items?: unknown[] }) {
  const hasItems = items && items.length > 0
  const offers: Offer[] = hasItems
    ? items.map((item, index) => toRaw(item, index))
    : []

  if (offers.length === 0) return null

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 md:py-10">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="ff-shape-container inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ff-purple)]/10 backdrop-blur-xs border border-[var(--ff-purple)]/20 text-[11px] font-semibold text-[var(--ff-purple)]">
            <Tag size={11} />
            Portfolyolarımız
          </span>
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Projelerimiz
          </h2>
          <p className="text-xs text-[var(--foreground-muted)] max-w-xl">
            Sunduğumuz hizmetlerle hayata geçirdiğimiz seçkin projeler.
          </p>
          <button className="inline-flex items-center gap-1.5 px-3 py-1 underline text-[11px] font-semibold text-[var(--foreground)] hover:text-[var(--ff-purple)] transition-colors mt-6">
            Tüm Projeler
            <ArrowRight size={11} />
          </button>
        </div>
        <OfferCarousel offers={offers} />
      </div>
    </div>
  )
}
