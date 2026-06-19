"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

// Premium, robust route transition.
//
// • Opacity-led fade with a whisper of vertical travel — feels like Linear /
//   Vercel, not a slideshow.
// • `mode="wait"` keeps exit + enter from overlapping, but timings are kept
//   short so fast navigation never feels laggy.
// • The vertical travel uses a `transform`, which would break any
//   `position: sticky` / `fixed` descendant while it is applied — so once the
//   enter animation settles we hard-reset `transform: none`. (The sticky
//   service sidebar relies on this.)
// • Honors `prefers-reduced-motion`: no transform, near-instant crossfade.
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    setSettled(false)
  }, [pathname])

  const enterY = reduce ? 0 : 10

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: enterY }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : -8 }}
        transition={{
          duration: reduce ? 0.12 : 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
        onAnimationComplete={() => setSettled(true)}
        className={cn("min-h-screen", className)}
        // Drop the transform once settled so sticky/fixed descendants work.
        style={settled ? { transform: "none" } : undefined}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
