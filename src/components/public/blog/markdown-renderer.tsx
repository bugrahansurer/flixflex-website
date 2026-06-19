// ═══════════════════════════════════════════════════════════
// FlixFlex — Simple Markdown Renderer
// No MDX library — pure paragraph/heading splitting
// ═══════════════════════════════════════════════════════════

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// ── Inline bold (**text**) ────────────────────────────────
function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-[var(--foreground)]">{part}</strong> : part
  )
}

// ── Block renderer ────────────────────────────────────────
interface MarkdownRendererProps {
  content: string
  className?: string
  /** Optional accent colour override, defaults to #FF4FD8 */
  accentColor?: string
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const blocks = content.split(/\n\n+/)

  const elements: ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return
    elements.push(
      <ul
        key={`ul-${key}`}
        className="my-5 space-y-2 pl-5 list-disc text-[var(--foreground-muted)] leading-relaxed"
      >
        {listBuffer.map((item, i) => (
          <li key={i} className="pl-1">
            {parseBold(item)}
          </li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  blocks.forEach((block, idx) => {
    const trimmed = block.trim()
    if (!trimmed) return

    const lines = trimmed.split("\n")

    // Check if the block is an entirely list block
    const isListBlock = lines.every((l) => l.startsWith("- "))
    if (isListBlock) {
      flushList(String(idx))
      elements.push(
        <ul
          key={idx}
          className="my-5 space-y-2 pl-5 list-disc text-[var(--foreground-muted)] leading-relaxed"
        >
          {lines.map((line, i) => (
            <li key={i} className="pl-1">
              {parseBold(line.slice(2))}
            </li>
          ))}
        </ul>
      )
      return
    }

    // Single-line block checks
    if (trimmed.startsWith("## ")) {
      flushList(String(idx))
      elements.push(
        <h2
          key={idx}
          className="font-display font-bold text-2xl md:text-3xl text-[var(--foreground)] mt-10 mb-4 leading-tight tracking-tight"
        >
          {parseBold(trimmed.slice(3))}
        </h2>
      )
      return
    }

    if (trimmed.startsWith("### ")) {
      flushList(String(idx))
      elements.push(
        <h3
          key={idx}
          className="font-display font-bold text-xl md:text-2xl text-[var(--foreground)] mt-8 mb-3 leading-tight tracking-tight"
        >
          {parseBold(trimmed.slice(4))}
        </h3>
      )
      return
    }

    // Image block — ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      flushList(String(idx))
      const [, alt, url] = imgMatch
      elements.push(
        <figure key={idx} className="my-8 -mx-2 md:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            loading="lazy"
            className="ff-shape-container w-full h-auto object-cover border border-[var(--border)]"
          />
          {alt && (
            <figcaption className="mt-2 text-center text-[12px] text-[var(--foreground-faint)]">
              {alt}
            </figcaption>
          )}
        </figure>
      )
      return
    }

    if (trimmed.startsWith("> ")) {
      flushList(String(idx))
      elements.push(
        <blockquote
          key={idx}
          className={cn(
            "my-6 pl-5 border-l-2 border-[var(--ff-purple)] text-[var(--foreground)]",
            "italic text-[var(--foreground-muted)] text-lg leading-relaxed"
          )}
        >
          {parseBold(trimmed.slice(2))}
        </blockquote>
      )
      return
    }

    // Multi-line block — treat each line separately if mixed
    // Otherwise render as paragraph
    flushList(String(idx))
    elements.push(
      <p
        key={idx}
        className="text-[var(--foreground-muted)] leading-[1.85] text-base md:text-[17px] my-4"
      >
        {parseBold(trimmed)}
      </p>
    )
  })

  // Flush any remaining list items
  flushList("end")

  return (
    <div className={cn("prose-like", className)}>
      {elements}
    </div>
  )
}
