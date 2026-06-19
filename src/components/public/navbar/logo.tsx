"use client"

import Link from "next/link"
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
  sm: { mark: "w-7 h-7  text-[10px]", text: "text-base" },
  md: { mark: "w-9 h-9  text-xs",     text: "text-lg"  },
  lg: { mark: "w-11 h-11 text-sm",    text: "text-xl"  },
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
        <img
          src={logoUrl}
          alt="FlixFlex"
          className="w-auto object-contain"
          style={{ height: logoHeight || (size === "sm" ? 24 : size === "md" ? 32 : 40) }}
        />
      ) : (
        <>
          {/* Mor mark */}
          <motion.span
            className={cn(
              "relative flex items-center justify-center",
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
