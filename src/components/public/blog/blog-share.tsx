"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Twitter, Linkedin, Link2, Check } from "@/lib/icons"

interface BlogShareProps {
  title: string
  slug: string
  className?: string
}

export function BlogShare({ title, slug, className }: BlogShareProps) {
  const [copied, setCopied] = useState(false)

  // Start with the canonical URL on BOTH server and first client render so
  // hydration matches; swap to the real origin after mount (preview/staging).
  const [url, setUrl] = useState(`https://flixflex.com/blog/${slug}`)
  useEffect(() => {
    setUrl(`${window.location.origin}/blog/${slug}`)
  }, [slug])

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const ta = document.createElement("textarea")
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const btnBase = cn(
    "ff-shape-container inline-flex items-center gap-2 px-4 py-1.5",
    "text-[11px] font-semibold",
    "border border-[var(--border)]",
    "transition-all duration-200",
    "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-purple)]",
    "text-[var(--foreground-muted)]"
  )

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--foreground-faint)] mr-1">
        Paylaş:
      </span>

      {/* Twitter / X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnBase}
        aria-label="Twitter'da paylaş"
      >
        <Twitter size={12} />
        Twitter
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnBase}
        aria-label="LinkedIn'de paylaş"
      >
        <Linkedin size={12} />
        LinkedIn
      </a>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          btnBase,
          copied && "border-[#16a34a] text-[#16a34a] hover:border-[#16a34a] hover:text-[#16a34a]"
        )}
        aria-label="Bağlantıyı kopyala"
      >
        {copied ? <Check size={12} /> : <Link2 size={12} />}
        {copied ? "Kopyalandı!" : "Bağlantı"}
      </button>
    </div>
  )
}
