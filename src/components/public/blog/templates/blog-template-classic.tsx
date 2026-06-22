// ─────────────────────────────────────────────────────────
// Template: Classic
// Single column, centred, big cover, typography focused
// ─────────────────────────────────────────────────────────

import Image from "next/image"
import { cn, formatDate } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { CTASection } from "@/components/public/sections/cta-section"
import { MarkdownRenderer } from "../markdown-renderer"
import { BlogShare } from "../blog-share"
import { RelatedPosts } from "../related-posts"
import type { BlogPost } from "../blog-data"

interface ClassicTemplateProps {
  post: BlogPost
  related: BlogPost[]
}

export function BlogTemplateClassic({ post, related }: ClassicTemplateProps) {
  return (
    <>
      {/* ── Hero cover ─────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        <div
          className={cn(
            "relative w-full h-[380px] md:h-[520px] bg-gradient-to-br",
            post.coverGradient
          )}
        >
          {post.coverImage && (
            <>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-black/40" />
            </>
          )}
          {/* Grid overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              aria-hidden
              className="font-display font-extrabold leading-[0.85] tracking-[-0.04em] text-center opacity-[0.08] select-none pointer-events-none text-white text-[clamp(48px,10vw,140px)]"
            >
              {post.category.toUpperCase()}
            </p>
          </div>

          {/* Dark overlay for contrast */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]"
          />
        </div>
      </section>

      {/* ── Article ────────────────────────────────── */}
      <article className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pb-20 md:pb-28">
        {/* Centred content column */}
        <div className="max-w-2xl mx-auto">

          {/* Category + read time */}
          <div className="flex flex-wrap items-center gap-3 mb-6 -mt-4 relative z-10">
            <FFBadge variant="purple">{post.category}</FFBadge>
            <span className="text-[11px] font-mono text-[var(--foreground-faint)] uppercase tracking-[0.12em]">
              {post.readMinutes} dk okuma
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-extrabold text-[var(--foreground)] leading-[1.08] tracking-tight mb-6 text-[clamp(28px,5vw,52px)]">
            {post.title}
          </h1>

          {/* Excerpt / lead */}
          <p className="text-lg md:text-xl text-[var(--foreground-muted)] leading-[1.7] mb-8 border-l-2 border-[var(--ff-purple)] pl-5">
            {post.excerpt}
          </p>

          {/* Author strip */}
          <div className="flex items-center gap-3 pb-8 mb-8 border-b border-[var(--border)]">
            <span className="ff-shape-container w-10 h-10 flex items-center justify-center text-sm font-bold text-white bg-[var(--ff-purple)] flex-shrink-0">
              {post.author.initials}
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)] leading-none mb-1">
                {post.author.name}
              </p>
              <p className="text-[12px] text-[var(--foreground-faint)] leading-none">
                {post.author.role} · {formatDate(post.publishedAt)}
              </p>
            </div>
          </div>

          {/* Body content */}
          <MarkdownRenderer content={post.content} />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[var(--border)]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)]/40 hover:text-[var(--ff-purple)] transition-colors duration-200 cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="mt-8">
            <BlogShare title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* Related posts — full width */}
        {related.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[var(--border)]">
            <RelatedPosts posts={related} />
          </div>
        )}
      </article>

      <CTASection
        eyebrow="Birlikte Büyüyelim"
        title={<>Markanızı bir üst seviyeye <span className="text-[var(--ff-purple)]">taşıyalım.</span></>}
        description="Bu makaleyi beğendiyseniz, FlixFlex'in markanız için neler yapabileceğini keşfedin."
      />
    </>
  )
}
