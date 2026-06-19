"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/components/public"

interface PrevNextProps {
  prev: PortfolioItem | null
  next: PortfolioItem | null
}

function NavSide({
  item,
  direction,
}: {
  item: PortfolioItem
  direction: "prev" | "next"
}) {
  const isNext = direction === "next"

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="flex-1 block relative group min-h-[300px] md:min-h-[400px] overflow-hidden ff-shape-container border border-[var(--border)]"
    >
      {/* Background Image */}
      <img
        src={item.coverImage || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[var(--ff-purple)]/0 group-hover:bg-[var(--ff-purple)]/8 transition-colors duration-500 z-0" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/0 group-hover:ring-[var(--ff-purple)]/40 transition-all duration-500 z-0" />

      {/* Content */}
      <div className={cn(
        "absolute inset-0 z-10 p-4 md:p-6 flex flex-col justify-between text-white",
        isNext ? "items-end text-right" : "items-start text-left"
      )}>
        {/* Top: Direction Indicator */}
        <div className={cn(
          "flex items-center bg-[var(--ff-purple)]/10 backdrop-blur-sm rounded-full border-2 border-[var(--ff-purple)]/30 px-2 py-1 gap-2 text-[10px] font-semibold text-ff-purple group-hover:text-[var(--ff-purple)] transition-colors duration-300"
        )}>
          {!isNext && <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />}
          <span>{isNext ? "Sonraki Proje" : "Önceki Proje"}</span>
          {isNext && <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />}
        </div>

        {/* Bottom: Client and Title */}
        <div className={cn(
          "flex flex-col gap-2 md:gap-3",
          isNext ? "items-end" : "items-start"
        )}>
          {/* Logo or Initial */}
          {item.clientLogo ? (
            <img
              src={item.clientLogo}
              alt={item.client ?? ""}
              className="h-5 w-auto max-w-[90px] object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[var(--ff-purple)]/20 border border-[var(--ff-purple)]/40 flex items-center justify-center text-[10px] font-bold text-[var(--ff-purple)]">
              {item.client ? item.client.charAt(0) : "P"}
            </div>
          )}

          <div className={cn(
            "flex flex-col gap-1",
            isNext ? "items-end" : "items-start"
          )}>
            <span className="text-white/50 text-[11px] font-semibold">
              {item.client} &middot; {item.category}
            </span>
            <h3 className="font-display text-lg md:text-xl lg:text-2xl font-extrabold leading-[1.15] group-hover:text-[var(--ff-purple)] transition-colors duration-300 max-w-lg">
              {item.title}
            </h3>
          </div>

          {/* Hover Action */}
          <div className="h-5 overflow-hidden mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ff-purple)] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
              Projeyi İncele {isNext ? <ArrowRight size={12} className="ml-0.5" /> : <ArrowLeft size={12} className="mr-0.5 order-first" />}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent glow border */}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-0 h-[2px] w-0 bg-[var(--ff-purple)]",
          "group-hover:w-full transition-all duration-500",
          isNext ? "right-0" : "left-0"
        )}
      />
    </Link>
  )
}

export function PrevNextNav({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null

  return (
    <div className="bg-[var(--background)] py-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 xl:px-16 flex flex-col md:flex-row gap-6">
        {prev ? (
          <NavSide item={prev} direction="prev" />
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <NavSide item={next} direction="next" />
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  )
}
