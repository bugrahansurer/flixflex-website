"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwatchRowProps {
  swatches: string[]
}

export function SwatchRow({ swatches }: SwatchRowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = React.useState(swatches.length)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const calculateVisible = () => {
      const containerWidth = container.offsetWidth
      const swatchSize = 28 // w-7 = 1.75rem = 28px
      const gap = 6 // gap-1.5 = 0.375rem = 6px
      
      // Calculate how many swatches + gaps fit
      // (count * swatchSize) + ((count - 1) * gap) <= containerWidth
      // count * (swatchSize + gap) - gap <= containerWidth
      // count <= (containerWidth + gap) / (swatchSize + gap)
      
      const count = Math.floor((containerWidth + gap) / (swatchSize + gap))
      
      if (count < swatches.length) {
        // Leave room for the "+N" indicator
        setVisibleCount(Math.max(1, count - 1))
      } else {
        setVisibleCount(swatches.length)
      }
    }

    const observer = new ResizeObserver(calculateVisible)
    observer.observe(container)
    calculateVisible()

    return () => observer.disconnect()
  }, [swatches.length])

  const remaining = swatches.length - visibleCount

  return (
    <div 
      ref={containerRef} 
      className="flex items-center gap-1.5 w-full overflow-hidden min-h-[28px]"
    >
      {swatches.slice(0, visibleCount).map((color, idx) => (
        <div
          key={idx}
          title={color}
          className="ff-shape-container w-7 h-7 border border-[#CCCCCC] flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      ))}
      
      {remaining > 0 && (
        <div 
          title={`${remaining} daha renk`}
          className={cn(
            "ff-shape-container w-7 h-7 flex items-center justify-center flex-shrink-0",
            "bg-[#f7f7f5] border border-[#CCCCCC]",
            "text-[10px] font-bold text-[#888888]"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
