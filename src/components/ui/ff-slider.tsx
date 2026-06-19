"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface FFSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  unit?: string
}

export function FFSlider({ className, label, unit, ...props }: FFSliderProps) {
  return (
    <div className="w-full space-y-4">
      {(label || props.value) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              {label}
            </label>
          )}
          {props.value && (
            <span className="text-[12px] font-bold text-[var(--ff-purple)] font-mono bg-ff-purple/10 px-2 py-0.5 ff-shape-button border border-ff-purple/20">
              {props.value[0]}{unit}
            </span>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        className={cn(
          "relative flex items-center select-none touch-none w-full h-5 group",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="bg-[#FF4FD8]/10 relative grow h-[6px] rounded-full border border-[#FF4FD8]/30">
          <SliderPrimitive.Range className="absolute bg-gradient-to-r from-[#ff4fd8] to-[#ff4fd8] h-full rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block w-5 h-5 bg-white border-2 border-[#ff4fd8] shadow-lg transition-all ff-shape-button",
            "hover:scale-120 hover:shadow-[#ff4fd8] active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-[#ff4fd8]/50"
          )}
          aria-label="Değer seç"
        />
      </SliderPrimitive.Root>
    </div>
  )
}
