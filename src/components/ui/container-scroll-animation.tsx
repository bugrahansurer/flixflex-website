"use client"

import React, { useRef } from "react"
import { useScroll, useTransform, motion, MotionValue } from "framer-motion"

// FlixFlex adaptation — kömür/mor border
export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // matchMedia fires only when the breakpoint boundary is crossed —
    // not on every pixel of resize — eliminating the per-pixel setState calls.
    const mq = window.matchMedia("(max-width: 768px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read initial breakpoint on mount
    setIsMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const scaleDimensions = isMobile ? [0.7, 0.9] : [1.05, 1]
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions)
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div className="py-10 md:py-40 w-full relative" style={{ perspective: "1000px" }}>
        <motion.div style={{ translateY: translate }} className="mx-auto text-center mb-8">
          {titleComponent}
        </motion.div>
        <ScrollCard rotate={rotate} translate={translate} scale={scale}>
          {children}
        </ScrollCard>
      </div>
    </div>
  )
}

function ScrollCard({
  rotate, scale, children,
}: {
  rotate: MotionValue<number>
  scale: MotionValue<number>
  translate: MotionValue<number>
  children: React.ReactNode
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        // FlixFlex: mor glow shadow
        boxShadow:
          "0 0 0 1px rgba(255, 79, 216,0.3), 0 20px 60px rgba(255, 79, 216,0.2), 0 60px 80px rgba(0,0,0,0.4)",
      }}
      className="mx-auto h-[30rem] md:h-[40rem] w-full border-2 border-[rgba(255, 79, 216,0.35)] p-2 md:p-4 bg-[#111111]"
    >
      <div className="h-full w-full overflow-hidden bg-[#0C0C0C] md:p-4">
        {children}
      </div>
    </motion.div>
  )
}
