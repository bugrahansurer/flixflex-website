"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { staggerContainer, fadeInUp } from "@/lib/animations"

interface SuccessMessageProps {
  refCode?: string
  onReset: () => void
}

export function SuccessMessage({ refCode, onReset }: SuccessMessageProps) {
  return (
    <motion.div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center py-16 px-6 gap-6"
    >
      {/* Animated checkmark ring */}
      <motion.div
        variants={{
          hidden:  { scale: 0.5, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 280, damping: 20, delay: 0.05 },
          },
        }}
        className="relative"
      >
        {/* Outer pulse ring */}
        <motion.span
          className="absolute inset-0 border border-[var(--ff-purple)] rounded-full opacity-75"
          animate={{
            scale:   [1, 1.5, 1.5],
            opacity: [0.7, 0, 0],
          }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
        <span
          className={cn(
            "w-20 h-20 flex items-center justify-center",
            "bg-[rgba(255, 79, 216,0.1)] border border-[rgba(255, 79, 216,0.35)]"
          )}
        >
          <CheckCircle2 size={40} className="text-[var(--ff-purple)]" strokeWidth={1.5} />
        </span>
      </motion.div>

      {/* Heading */}
      <motion.div variants={fadeInUp} className="space-y-3 max-w-md">
        <Eyebrow align="center">Mesajınız İletildi</Eyebrow>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-[var(--foreground)] leading-tight">
          Teşekkürler!{" "}
          <span className="text-[var(--ff-purple)]">Sesinizi duyduk.</span>
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
          Ekibimiz en kısa sürede — genellikle{" "}
          <span className="text-[var(--foreground)] font-medium">24 saat içinde</span> —
          sizinle iletişime geçecek. Lütfen e-posta kutunuzu kontrol etmeyi unutmayın.
        </p>
      </motion.div>

      {/* Reference code */}
      {refCode && (
        <motion.div
          variants={fadeInUp}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5",
            "border border-[var(--border)] bg-[var(--surface)]",
            "text-[11px] tracking-wider uppercase"
          )}
        >
          <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] shrink-0" />
          <span className="text-[var(--foreground-faint)]">Referans kodu:</span>
          <span className="font-mono font-bold text-[var(--foreground)]">{refCode}</span>
        </motion.div>
      )}

      {/* Reset button */}
      <motion.div variants={fadeInUp}>
        <button
          onClick={onReset}
          className={cn(
            "mt-2 inline-flex items-center gap-2",
            "px-6 py-3 text-[12px] font-medium uppercase tracking-[0.08em]",
            "border border-[var(--border)] text-[var(--foreground-muted)]",
            "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
            "transition-colors duration-200"
          )}
        >
          Yeni mesaj gönder
        </button>
      </motion.div>
    </motion.div>
  )
}
