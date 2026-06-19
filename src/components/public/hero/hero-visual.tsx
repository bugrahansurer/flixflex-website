"use client"

import { motion } from "framer-motion"
import { Sparkles } from "@/lib/icons"
import { cn } from "@/lib/utils"

// Abstract geometric composition — right side of hero
// FlixFlex DNA: sharp corners, mor aksanlar, layered depth

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full aspect-square max-w-[560px] mx-auto",
        className
      )}
      aria-hidden
    >
      {/* Outer rotating frame */}
      <motion.div
        className="ff-shape-container absolute inset-0 border border-[rgba(255, 79, 216,0.25)]"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 8, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      />

      {/* Counter-rotating accent */}
      <motion.div
        className="ff-shape-container absolute inset-4 border border-[var(--border-strong)]"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: -4, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.75 }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "ff-shape-container absolute inset-8 bg-[var(--surface-elevated)]",
          "border border-[var(--border)]",
          "shadow-[0_25px_80px_-20px_rgba(255, 79, 216,0.35)]",
          "flex flex-col"
        )}
      >
        {/* Window chrome */}
        <div className="h-9 border-b border-[var(--border)] flex items-center gap-1.5 px-3">
          <span className="w-2 h-2 bg-[#FF5F57]" />
          <span className="w-2 h-2 bg-[#FEBC2E]" />
          <span className="w-2 h-2 bg-[#28C840]" />
          <span className="ml-3 text-[10px] text-[var(--foreground-faint)] font-mono">
            flixflex / dashboard
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-[var(--ff-purple)] font-medium">
            <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          {/* Headline mini */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--foreground-faint)] font-mono">
              Q2 Performance
            </p>
            <div className="flex items-baseline gap-2">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="font-display text-3xl font-bold text-[var(--foreground)]"
              >
                +340%
              </motion.span>
              <span className="text-[11px] text-[#16a34a] uppercase tracking-wider">
                ▲ growth
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-24">
            {[40, 28, 64, 52, 78, 92, 70, 96].map((h, i) => (
              <motion.span
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{
                  delay: 1.3 + i * 0.06,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={cn(
                  "flex-1",
                  i === 5 || i === 7
                    ? "bg-[var(--ff-purple)]"
                    : "bg-[var(--border-strong)]"
                )}
              />
            ))}
          </div>

          {/* Metric row */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {[
              { label: "ROAS", value: "8.4x" },
              { label: "CTR", value: "6.2%" },
              { label: "Reach", value: "2.1M" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.08 }}
                className="border border-[var(--border)] px-2 py-1.5"
              >
                <p className="text-[var(--foreground-faint)] uppercase tracking-wider text-[9px]">
                  {m.label}
                </p>
                <p className="font-display font-bold text-[var(--foreground)]">
                  {m.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating badge — top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, x: 30 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
          "ff-shape-container absolute -top-3 -right-3 z-10",
          "px-3 py-2 bg-[var(--ff-purple)] text-white",
          "shadow-[0_10px_30px_rgba(255, 79, 216,0.4)]",
          "flex items-center gap-1.5"
        )}
      >
        <Sparkles size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          AI Boost
        </span>
      </motion.div>

      {/* Floating mini-card — bottom left */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className={cn(
          "ff-shape-container absolute -bottom-4 -left-4 z-10",
          "bg-[#0C0C0C] text-white p-4 min-w-[160px]",
          "border-l-2 border-l-[var(--ff-purple)]",
          "shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
        )}
        style={{
          animation: "ff-float 6s ease-in-out infinite",
        }}
      >
        <p className="text-[9px] uppercase tracking-widest text-white/70 mb-1">
          campaign
        </p>
        <p className="font-display text-sm font-bold leading-tight">
          Hyper-targeted reach
        </p>
        <div className="mt-2 h-1 bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ delay: 2.1, duration: 1.2, ease: "easeOut" }}
            className="h-full bg-[var(--ff-purple)]"
          />
        </div>
      </motion.div>
    </div>
  )
}
