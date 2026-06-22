"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FlixFlexLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  logoUrl?: string
  logoHeight?: number
  transparent?: boolean
}

const sizeMap = {
  sm: { mark: "w-8 h-8  text-[10px]", text: "text-base" },
  md: { mark: "w-9 h-9  text-xs", text: "text-lg" },
  lg: { mark: "w-10 h-10 text-sm", text: "text-xl" },
}

export function FlixFlexLogo({ className, size = "md", logoUrl, logoHeight, transparent }: FlixFlexLogoProps) {
  const s = sizeMap[size]

  return (
    <Link
      href="/"
      aria-label="FlixFlex Ana Sayfa"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      {logoUrl ? (
        <div
          className="relative"
          style={{
            height: logoHeight || (size === "sm" ? 24 : size === "md" ? 32 : 40),
            width: logoHeight ? logoHeight * 4 : (size === "sm" ? 96 : size === "md" ? 128 : 160),
          }}
        >
          <Image
            src={logoUrl}
            alt="FlixFlex"
            fill
            sizes="(max-width: 768px) 96px, 160px"
            className="object-contain object-left"
          />
        </div>
      ) : (
        <>
          {/* Mor mark */}
          <motion.span
            className={cn(
              "ff-shape-button relative flex items-center justify-center",
              "bg-[var(--ff-purple)] text-white font-bold tracking-tight",
              "transition-shadow duration-300",
              "group-hover:shadow-[0_0_20px_rgba(255, 79, 216,0.5)]",
              s.mark
            )}
            whileHover={{ rotate: -6 }}
            transition={{ duration: 0.2 }}
          >
            FF
            <span
              aria-hidden
              className="ff-shape-container absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
              }}
            />
          </motion.span>

          {/* Text */}
          <span
            className={cn(
              "font-display font-extrabold tracking-tight leading-none transition-colors duration-300",
              transparent ? "text-white" : "text-[var(--foreground)]",
              s.text
            )}
          >
            Flix<span className="text-[var(--ff-purple)]">Flex</span>
          </span>
        </>
      )}
    </Link>
  )
}
