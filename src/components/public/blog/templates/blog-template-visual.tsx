// ─────────────────────────────────────────────────────────
// Template: Visual
// Full-width images interspersed with content
// Portfolio / campaign feel
// ─────────────────────────────────────────────────────────

import Image from "next/image"
import { cn, formatDate } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { CTASection } from "@/components/public/sections/cta-section"
import { MarkdownRenderer } from "../markdown-renderer"
import { BlogShare } from "../blog-share"
import { RelatedPosts } from "../related-posts"
import type { BlogPost } from "../blog-data"

interface VisualTemplateProps {
  post: BlogPost
  related: BlogPost[]
}

// Alternate gradient panels derived from post gradient by reversing
function VisualBreak({
  gradient,
  label,
  index,
}: {
  gradient: string
  label: string
  index: number
}) {
  const heights = ["h-[240px]", "h-[300px]", "h-[200px]"]
  const h = heights[index % heights.length]

  return (
    <div
      className={cn(
        "relative w-full my-12 md:my-16 overflow-hidden",
        `bg-gradient-to-br ${gradient}`,
        h
      )}
      aria-hidden
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Label watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-display font-extrabold text-white opacity-[0.07] select-none text-[clamp(32px,8vw,100px)] tracking-[-0.04em] text-center">
          {label.toUpperCase()}
        </p>
      </div>
      {/* Index label */}
      <div className="absolute bottom-4 right-6">
        <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  )
}

export function BlogTemplateVisual({ post, related }: VisualTemplateProps) {
  // Split the content into "chapters" at each ## heading
  // We'll render a visual break between major sections
  const sections = post.content.split(/(?=^## )/m).filter(Boolean)

  return (
    <>
      {/* ── Full-bleed hero ─────────────────────────── */}
      <section
        className={cn(
          "relative w-full min-h-[60vh] flex flex-col justify-end",
          `bg-gradient-to-br ${post.coverGradient}`,
          "overflow-hidden pb-0"
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
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          </>
        )}
        {/* Grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Large watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            aria-hidden
            className="font-display font-extrabold text-white opacity-[0.06] leading-none select-none text-[clamp(64px,15vw,200px)] tracking-[-0.05em] text-center"
          >
            {post.category}
          </p>
        </div>

        {/* Bottom dark ramp */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[var(--background)]"
        />

        {/* Meta strip */}
        <div className="relative mx-auto max-w-[1440px] w-full px-6 md:px-10 xl:px-16 pt-28 pb-16 md:pb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <FFBadge variant="white">{post.category}</FFBadge>
            <span className="text-[11px] font-mono tracking-[0.12em] uppercase text-white/70">
              {post.readMinutes} dk · {formatDate(post.publishedAt)}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-white leading-[1.05] tracking-tight text-[clamp(30px,6vw,80px)]">
            {post.title}
          </h1>
        </div>
      </section>

      {/* ── Author + excerpt ────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pt-10 pb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 pb-10 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="w-11 h-11 flex items-center justify-center text-sm font-bold text-white bg-[var(--ff-purple)] flex-shrink-0">
              {post.author.initials}
            </span>
            <div>
              <p className="font-semibold text-[var(--foreground)] text-sm leading-none mb-1">
                {post.author.name}
              </p>
              <p className="text-[12px] text-[var(--foreground-faint)] leading-none">
                {post.author.role}
              </p>
            </div>
          </div>

          <p className="text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed border-l border-[var(--ff-purple)] pl-5 md:border-l-0 md:pl-0">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* ── Content with interspersed visual breaks ─── */}
      <article className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pb-16">
        {sections.map((section, idx) => (
          <div key={idx}>
            {/* Visual break before sections (except the first) */}
            {idx > 0 && (
              <VisualBreak
                gradient={post.coverGradient}
                label={post.tags[idx % post.tags.length] ?? post.category}
                index={idx - 1}
              />
            )}
            <div className="max-w-3xl mx-auto">
              <MarkdownRenderer content={section} />
            </div>
          </div>
        ))}

        {/* Tags */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[var(--border)]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)] transition-colors duration-200 cursor-default"
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
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pb-20 md:pb-28">
          <div className="border-t border-[var(--border)] pt-16">
            <RelatedPosts posts={related} />
          </div>
        </section>
      )}

      <CTASection
        eyebrow="Vizyon Gerçeğe Dönüşsün"
        title={<>Yaratıcılığı <span className="text-[var(--ff-purple)]">eyleme</span> dönüştürüyoruz.</>}
        description="FlixFlex ile markanız için cesur, ölçülebilir ve akılda kalıcı kampanyalar hayata geçirelim."
      />
    </>
  )
}
