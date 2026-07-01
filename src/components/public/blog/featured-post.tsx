import Image from "next/image"
import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { ArrowRight } from "@/lib/icons"
import type { BlogPost } from "./blog-data"

interface FeaturedPostProps {
  post: BlogPost
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <article
      className={cn(
        "group relative w-full overflow-hidden",
        "border border-[var(--border)]",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-[rgba(255, 79, 216,0.5)]",
        "hover:shadow-[0_12px_60px_rgba(255, 79, 216,0.12)]"
      )}
    >
      {/* Full-width cover — admin image when set, else gradient */}
      <div
        className={cn(
          "relative w-full h-[420px] md:h-[520px] overflow-hidden",
          !post.coverImage && "bg-gradient-to-br",
          !post.coverImage && post.coverGradient
        )}
      >
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {/* Dark gradient overlay for readability */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        {/* Top badges */}
        <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
          <FFBadge variant="white">
            <span className="w-1.5 h-1.5 bg-white animate-pulse" />
            Öne Çıkan
          </FFBadge>
          <FFBadge variant="purple">{post.category}</FFBadge>
        </div>

        {/* Read time — top right */}
        <div className="absolute top-5 right-5 z-10">
          <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-white/70 uppercase">
            {post.readMinutes} dk okuma
          </span>
        </div>

        {/* Content overlay — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold text-white/70"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2
            className={cn(
              "font-display font-extrabold text-white leading-tight tracking-tight mb-4",
              "text-[clamp(22px,4vw,48px)]",
              "max-w-3xl"
            )}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mb-6 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Author + CTA row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="ff-shape-container w-9 h-9 flex items-center justify-center text-[11px] font-bold text-white bg-[var(--ff-purple)] flex-shrink-0">
                {post.author.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-white leading-none mb-1">
                  {post.author.name}
                </p>
                <p className="text-[11px] text-white/70 leading-none">
                  {post.author.role} · {formatDate(post.publishedAt)}
                </p>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className={cn(
                "group/btn inline-flex items-center gap-2.5",
                "px-6 py-3 text-sm font-medium",
                "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)]",
                "hover:shadow-[0_4px_24px_rgba(255, 79, 216,0.5)]",
                "transition-all duration-200 self-start sm:self-auto"
              )}
            >
              Makaleyi Oku
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover/btn:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
