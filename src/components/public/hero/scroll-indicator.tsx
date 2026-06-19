"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ScrollIndicator({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.6 }}
      className={cn(
        "flex flex-col items-center gap-2 text-[var(--foreground-muted)]",
        className
      )}
      aria-hidden
    >
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono">
        Kaydır
      </span>
      <span className="relative w-px h-12 bg-[var(--border)] overflow-hidden">
        <motion.span
          className="absolute inset-x-0 top-0 h-3 bg-[var(--ff-purple)] rounded-full"
          animate={{ y: ["-100%", "400%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  )
}
