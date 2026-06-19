"use client"

import { motion } from "framer-motion"
import { fadeInUp, fadeInLeft, fadeInRight, ease } from "@/lib/animations"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "left" | "right"
  delay?: number
}

const variantMap = {
  up: fadeInUp,
  left: fadeInLeft,
  right: fadeInRight,
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: ScrollRevealProps) {
  const variant = variantMap[direction]

  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, ease: ease.entering }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
