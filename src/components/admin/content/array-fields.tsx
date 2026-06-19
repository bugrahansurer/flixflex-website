"use client"

import type * as React from "react"
import { Plus, Trash2 } from "@/lib/icons"
import { cn } from "@/lib/utils"

export const inputCls =
  "ff-shape-container w-full h-9 bg-[#f7f7f5] border border-[#CCCCCC] px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#666666] outline-none focus:border-[#ff4fd8] transition-colors"

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold text-[#666666]">
        {label}
      </span>
      {children}
    </label>
  )
}

export function StringListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  function patch(index: number, value: string) {
    onChange(values.map((item, i) => (i === index ? value : item)))
  }

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-[#666666]">
        {label}
      </span>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => patch(index, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="ff-shape-button flex justify-center items-center w-9 h-9 border border-[#CCCCCC] text-[#666666] hover:text-red-500"
              aria-label="Satırı sil"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className={cn(
          "ff-shape-button inline-flex items-center gap-1.5 border border-[#CCCCCC]",
          "px-3 py-1.5 text-[12px] text-[#666666] hover:text-[#ff4fd8] transition-colors"
        )}
      >
        <Plus size={13} />
        Ekle
      </button>
    </div>
  )
}
