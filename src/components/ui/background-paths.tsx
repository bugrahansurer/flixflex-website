"use client"

import { motion, useReducedMotion } from "framer-motion"

// FlixFlex adaptation — mor geometrik yollar
function FloatingPaths({ position }: { position: number }) {
  const shouldReduceMotion = useReducedMotion()

  const paths = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    // Mor-kömür gradient renkler — FlixFlex DNA
    opacity: i % 3 === 0
      ? 0.06 + i * 0.008   // mor tonlar
      : 0.03 + i * 0.004,  // charcoal tonlar
    width: 0.4 + i * 0.025,
    purple: i % 4 === 0,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        aria-hidden
      >
        {paths.map((path) =>
          shouldReduceMotion ? (
            // Reduced-motion: static paths — no JS animation loop
            <path
              key={path.id}
              d={path.d}
              stroke={path.purple ? "var(--ff-purple)" : "#888888"}
              strokeWidth={path.width}
              strokeOpacity={path.opacity}
            />
          ) : (
            <motion.path
              key={path.id}
              d={path.d}
              stroke={path.purple ? "var(--ff-purple)" : "#888888"}
              strokeWidth={path.width}
              strokeOpacity={path.opacity}
              initial={{ pathLength: 0.2, opacity: path.opacity * 0.5 }}
              animate={{
                pathLength: 1,
                opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: 18 + (path.id % 8) * 3,
                repeat: Infinity,
                ease: "linear",
                delay: path.id * 0.3,
              }}
            />
          )
        )}
      </svg>
    </div>
  )
}

interface BackgroundPathsProps {
  intensity?: "light" | "medium" | "strong"
  className?: string
}

export function BackgroundPaths({
  intensity = "medium",
  className = "",
}: BackgroundPathsProps) {
  const opacityMap = { light: 0.4, medium: 0.65, strong: 1 }

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity: opacityMap[intensity] }}
      aria-hidden
    >
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  )
}
