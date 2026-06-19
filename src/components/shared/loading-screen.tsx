"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "ff:loadingScreen:seen"
// Snappier than before — minimalist loaders shouldn't linger.
const DURATION_MS = 1100

interface LoadingScreenProps {
  /** Current site logo (white/transparent variant preferred for the dark loader). */
  logoUrl?: string
  /** Optional logo height in px (from site settings). */
  logoHeight?: number
}

export function LoadingScreen({ logoUrl, logoHeight }: LoadingScreenProps) {
  const [visible, setVisible] = React.useState(false)

  // Show only on the first visit of a session.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (window.sessionStorage.getItem(STORAGE_KEY)) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration mismatch guard
    setVisible(true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const timer = window.setTimeout(() => {
      setVisible(false)
      window.sessionStorage.setItem(STORAGE_KEY, "1")
      document.body.style.overflow = prevOverflow
    }, DURATION_MS)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ff-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
          className={cn(
            "fixed inset-0 z-[100] bg-[#0A0A0A]",
            "flex flex-col items-center justify-center gap-7"
          )}
          aria-label="FlixFlex yükleniyor"
          role="status"
        >
          {/* Logo — current site logo, or the branded mark as fallback */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="FlixFlex"
                className="w-auto object-contain"
                style={{ height: logoHeight || 44 }}
              />
            ) : (
              <span className="inline-flex items-center gap-2.5 select-none">
                <span className="flex h-10 w-10 items-center justify-center bg-[var(--ff-purple)] text-white font-bold text-sm tracking-tight">
                  FF
                </span>
                <span className="font-display text-2xl font-extrabold leading-none tracking-tight text-white">
                  Flix<span className="text-[var(--ff-purple)]">Flex</span>
                </span>
              </span>
            )}
          </motion.div>

          {/* Minimal progress line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="relative h-px w-28 overflow-hidden bg-white/10"
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-[var(--ff-purple)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: DURATION_MS / 1000 - 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
