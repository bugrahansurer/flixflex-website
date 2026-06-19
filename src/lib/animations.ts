// ═══════════════════════════════════════════════════════════
// FlixFlex — Framer Motion Animation Variants
// Her yerde tutarlı animasyon dili
// ═══════════════════════════════════════════════════════════

import { Variants, Transition } from "framer-motion"

// ── Easing Curves ─────────────────────────────────
export const ease = {
  smooth:   [0.25, 0.1, 0.25, 1.0]   as [number, number, number, number],
  bounce:   [0.34, 1.56, 0.64, 1.0]  as [number, number, number, number],
  sharp:    [0.4, 0, 0.2, 1]         as [number, number, number, number],
  entering: [0.0, 0.0, 0.2, 1]       as [number, number, number, number],
  leaving:  [0.4, 0.0, 1, 1]         as [number, number, number, number],
}

// ── Spring Presets ────────────────────────────────
export const spring = {
  gentle:  { type: "spring", stiffness: 120, damping: 20 } as Transition,
  snappy:  { type: "spring", stiffness: 300, damping: 30 } as Transition,
  bouncy:  { type: "spring", stiffness: 400, damping: 15 } as Transition,
  slow:    { type: "spring", stiffness: 80,  damping: 25 } as Transition,
}

// ── Fade Variants ─────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
}

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.entering } },
}

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.entering } },
}

export const fadeInLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: ease.entering } },
}

export const fadeInRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: ease.entering } },
}

// ── Scale Variants ────────────────────────────────
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: ease.bounce } },
}

export const scaleInUp: Variants = {
  hidden:  { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: spring.snappy },
}

// ── Stagger Container ─────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren:  0.08,
      delayChildren:    0.1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren:  0.05,
      delayChildren:    0.05,
    },
  },
}

export const staggerContainerSlow: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren:  0.15,
      delayChildren:    0.2,
    },
  },
}

// ── Hero Letter Animation ─────────────────────────
// Her harfi ayrı ayrı animate et
export const letterContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren:   0.05,
    },
  },
}

export const letterChild: Variants = {
  hidden:  { opacity: 0, y: 100, rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", stiffness: 180, damping: 18 },
  },
}

// ── Page Transition ───────────────────────────────
export const pageEnter: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.entering },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.25, ease: ease.leaving },
  },
}

// ── Card Hover ────────────────────────────────────
export const cardHover = {
  rest:  { scale: 1, boxShadow: "0 0 0px rgba(255, 79, 216,0)" },
  hover: {
    scale: 1.01,
    boxShadow: "0 8px 40px rgba(255, 79, 216,0.15)",
    transition: { duration: 0.25, ease: ease.smooth },
  },
}

// ── Purple Glow Pulse ─────────────────────────────
export const purpleGlowPulse = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(255, 79, 216,0)",
      "0 0 30px rgba(255, 79, 216,0.4)",
      "0 0 0px rgba(255, 79, 216,0)",
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
}

// ── Floating Element ──────────────────────────────
export const floatingElement = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
}

// ── Slide Reveal ──────────────────────────────────
// Clip-path reveal (soldan sağa)
export const slideReveal: Variants = {
  hidden:  { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.8, ease: ease.entering },
  },
}

// ── Navbar Variants ───────────────────────────────
export const navbarVariants: Variants = {
  top:      { backgroundColor: "rgba(0,0,0,0)", borderBottomColor: "rgba(255,255,255,0)" },
  scrolled: { backgroundColor: "var(--background)", borderBottomColor: "var(--border)" },
}

export const mobileMenuVariants: Variants = {
  closed: { opacity: 0, x: "100%", transition: { duration: 0.3, ease: ease.leaving } },
  open:   { opacity: 1, x: "0%",   transition: { duration: 0.35, ease: ease.entering } },
}

export const mobileMenuItemVariants: Variants = {
  closed: { opacity: 0, x: 30 },
  open:   (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: ease.entering },
  }),
}

// ── Stats Counter ─────────────────────────────────
export const counterVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: ease.bounce },
  },
}

// ── Accordion ─────────────────────────────────────
export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: "hidden" },
  expanded:  {
    height: "auto",
    opacity: 1,
    overflow: "visible",
    transition: { height: { duration: 0.3, ease: ease.sharp }, opacity: { duration: 0.2, delay: 0.1 } },
  },
}

// ── Helper: delay variant ─────────────────────────
export function withDelay(variant: Variants, delay: number): Variants {
  const visible = variant.visible
  if (!visible || typeof visible !== "object") return variant
  const existingTransition = (visible as Record<string, unknown>).transition as Transition | undefined
  return {
    ...variant,
    visible: {
      ...visible,
      transition: { ...existingTransition, delay },
    },
  }
}
