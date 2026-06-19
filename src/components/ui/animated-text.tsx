"use client"

import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Letter-by-letter animated heading ────────────
interface AnimatedHeadingProps {
  text: string
  className?: string
  delay?: number
  tag?: "h1" | "h2" | "h3"
  accentWords?: string[]   // Words to color in purple
}

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 80, rotateX: -40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.028,
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  }),
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.09,
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
}

export function AnimatedHeading({
  text,
  className,
  delay = 0,
  tag: Tag = "h1",
  accentWords = [],
}: AnimatedHeadingProps) {
  const words = text.split(" ")

  return (
    <Tag
      className={cn("overflow-hidden", className)}
      style={{ perspective: "800px" }}
    >
      {words.map((word, wi) => {
        const isAccent = accentWords.includes(word)
        return (
          <span key={wi} className="inline-flex overflow-hidden mr-[0.3em] last:mr-0">
            {word.split("").map((letter, li) => {
              const globalIndex = wi * 10 + li
              return (
                <motion.span
                  key={li}
                  custom={globalIndex + delay * 30}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "inline-block",
                    isAccent && "text-[var(--ff-purple)]"
                  )}
                  style={{ transformOrigin: "50% 100% -20px" }}
                >
                  {letter}
                </motion.span>
              )
            })}
          </span>
        )
      })}
    </Tag>
  )
}

// ── Word-by-word animated text ────────────────────
interface AnimatedWordsProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedWords({ text, className, delay = 0 }: AnimatedWordsProps) {
  const words = text.split(" ")
  return (
    <p className={cn("overflow-hidden", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i + delay * 10}
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}

// ── Rotating text (animated-hero pattern) ─────────
interface RotatingTextProps {
  words: string[]
  className?: string
  accentClassName?: string
}

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"

export function RotatingText({
  words,
  className,
  accentClassName = "text-[var(--ff-purple)]",
}: RotatingTextProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 2200)
    return () => clearInterval(t)
  }, [words.length])

  return (
    <span className={cn("relative inline-block overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className={cn("inline-block", accentClassName)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ── Fade-in text block ────────────────────────────
interface FadeInTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function FadeInText({
  children,
  className,
  delay = 0,
  direction = "up",
}: FadeInTextProps) {
  const initial = {
    up: { opacity: 0, y: 30 },
    down: { opacity: 0, y: -30 },
    left: { opacity: 0, x: 40 },
    right: { opacity: 0, x: -40 },
    none: { opacity: 0 },
  }[direction]

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
