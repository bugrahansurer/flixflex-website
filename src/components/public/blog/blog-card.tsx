import { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { TiltCard } from "@/components/ui/tilt-card"
import { ArrowRight } from "@/lib/icons"
import type { BlogPost } from "./blog-data"

interface BlogCardProps {
  post: BlogPost
  className?: string
}

// Memoized: the blog list re-renders on every search keystroke /
// filter change, but each card's `post` is a stable reference, so
// memo skips re-rendering the cards that stayed in the list.
export const BlogCard = memo(function BlogCard({ post, className }: BlogCardProps) {
  return (
    <TiltCard
      variant="glass"
      as="article"
      className={cn("h-full", className)}
    >
      {/* Cover gradient */}
      <Link
        href={`/blog/${post.slug}`}
        className="ff-shape-container block relative overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        <div
          className={cn(
            "relative w-full h-[200px] md:h-[220px] overflow-hidden",
            !post.coverImage && "bg-gradient-to-br",
            !post.coverImage && post.coverGradient
          )}
        >
          {post.coverImage ? (
            /* Admin-uploaded cover image */
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            /* Fallback: gradient + category watermark when no cover image */
            <div className="ff-shape-container absolute inset-0 flex items-center justify-center p-4">
              <p
                className="font-display font-extrabold text-center leading-[0.85] opacity-10 select-none pointer-events-none break-words text-[clamp(20px,3.5vw,44px)] text-white"
                aria-hidden
              >
                {post.category.toUpperCase()}
              </p>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <FFBadge variant="purple">{post.category}</FFBadge>
          </div>

          {/* Read time */}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-mono font-medium text-white/70">
              {post.readMinutes} dk
            </span>
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 pt-3 gap-3">
        <h3 className="font-display font-bold text-base md:text-lg leading-snug tracking-tight text-[var(--foreground)] group-hover:text-[var(--ff-purple)] transition-colors duration-200 line-clamp-2">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        {/* Author + date strip */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto">
          <div className="flex items-center gap-2.5">
            {/* Avatar initials */}
            <span
              className="ff-shape-container w-7 h-7 flex items-center justify-center text-[10px] font-bold text-white bg-[var(--ff-purple)] flex-shrink-0"
              aria-hidden
            >
              {post.author.initials}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-[var(--foreground)] leading-none">
                {post.author.name}
              </span>
              <span className="text-[10px] text-[var(--foreground-faint)] leading-none">
                {formatDate(post.publishedAt)}
              </span>
            </div>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--ff-purple)] hover:gap-2 transition-all duration-200"
            aria-label={`${post.title} yazısını oku`}
          >
            Oku
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </TiltCard>
  )
})
