// ─────────────────────────────────────────────────────────
// Template: Editorial
// 8-col content + 4-col sticky sidebar (TOC + related)
// Magazine feel
// ─────────────────────────────────────────────────────────

import Image from "next/image"
import { cn, formatDate } from "@/lib/utils"
import { FFBadge } from "@/components/ui"
import { CTASection } from "@/components/public/sections/cta-section"
import { MarkdownRenderer } from "../markdown-renderer"
import { BlogShare } from "../blog-share"
import { RelatedPosts } from "../related-posts"
import type { BlogPost } from "../blog-data"

interface EditorialTemplateProps {
  post: BlogPost
  related: BlogPost[]
}

// ── TOC — derives headings from post content ──────────────
function buildToc(content: string): { id: string; text: string; level: 2 | 3 }[] {
  const lines = content.split("\n")
  const toc: { id: string; text: string; level: 2 | 3 }[] = []
  for (const line of lines) {
    if (line.startsWith("## ")) {
      const text = line.slice(3).replace(/\*\*/g, "").trim()
      toc.push({ id: text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), text, level: 2 })
    } else if (line.startsWith("### ")) {
      const text = line.slice(4).replace(/\*\*/g, "").trim()
      toc.push({ id: text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), text, level: 3 })
    }
  }
  return toc
}

function TableOfContents({ toc }: { toc: ReturnType<typeof buildToc> }) {
  if (toc.length === 0) return null
  return (
    <nav aria-label="İçindekiler">
      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--ff-purple)] mb-4">
        İçindekiler
      </p>
      <ol className="space-y-2">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-[12px] leading-snug transition-colors duration-150",
                "text-[var(--foreground-faint)] hover:text-[var(--ff-purple)]",
                item.level === 3 && "pl-3 border-l border-[var(--border)]"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function BlogTemplateEditorial({ post, related }: EditorialTemplateProps) {
  const toc = buildToc(post.content)

  return (
    <>
      {/* ── Cover + meta ────────────────────────────── */}
      <section
        className={cn(
          "relative w-full bg-gradient-to-br",
          post.coverGradient,
          "py-20 md:py-28 overflow-hidden"
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
            <div aria-hidden className="absolute inset-0 bg-black/55" />
          </>
        )}
        {/* Grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <FFBadge variant="white">{post.category}</FFBadge>
            <span className="text-[11px] font-mono tracking-[0.12em] uppercase text-white/70">
              {post.readMinutes} dk okuma · {formatDate(post.publishedAt)}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-white leading-[1.05] tracking-tight mb-6 text-[clamp(28px,5.5vw,68px)] max-w-4xl">
            {post.title}
          </h1>

          <p className="text-white/65 text-lg md:text-xl leading-[1.7] max-w-2xl">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 mt-8">
            <span className="ff-shape-container w-10 h-10 flex items-center justify-center text-sm font-bold text-white bg-[rgba(0,0,0,0.3)] border border-white/20 flex-shrink-0">
              {post.author.initials}
            </span>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-1">
                {post.author.name}
              </p>
              <p className="text-[12px] text-white/70 leading-none">
                {post.author.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content + Sidebar ────────────────────────── */}
      <article className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">

          {/* Main content — 8 cols */}
          <div className="lg:col-span-8">
            <MarkdownRenderer content={post.content} />

            {/* Tags */}
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

          {/* Sticky Sidebar — 4 cols */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* TOC */}
              {toc.length > 0 && (
                <div className="border border-[var(--border)] p-6">
                  <TableOfContents toc={toc} />
                </div>
              )}

              {/* Author card */}
              <div className="border border-[var(--border)] p-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--ff-purple)] mb-4">
                  Yazar
                </p>
                <div className="flex items-start gap-3">
                  <span className="w-11 h-11 flex items-center justify-center text-sm font-bold text-white bg-[var(--ff-purple)] flex-shrink-0">
                    {post.author.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-1">
                      {post.author.name}
                    </p>
                    <p className="text-[12px] text-[var(--foreground-faint)] leading-snug">
                      {post.author.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related in sidebar — compact list */}
              {related.length > 0 && (
                <div className="border border-[var(--border)] p-6">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--ff-purple)] mb-4">
                    İlgili Yazılar
                  </p>
                  <ul className="space-y-4">
                    {related.slice(0, 3).map((rel) => (
                      <li key={rel.slug} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                        <a
                          href={`/blog/${rel.slug}`}
                          className="group block"
                        >
                          <span className="inline-block mb-1">
                            <FFBadge variant="purple">{rel.category}</FFBadge>
                          </span>
                          <p className="text-[13px] font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--ff-purple)] transition-colors duration-200 line-clamp-2">
                            {rel.title}
                          </p>
                          <p className="text-[11px] text-[var(--foreground-faint)] mt-1">
                            {rel.readMinutes} dk · {formatDate(rel.publishedAt)}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* Full-width related posts below */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pb-20 md:pb-28">
          <div className="border-t border-[var(--border)] pt-16">
            <RelatedPosts posts={related} />
          </div>
        </section>
      )}

      <CTASection
        eyebrow="Bir Sonraki Adım"
        title={<>Stratejiyi <span className="text-[var(--ff-purple)]">harekete</span> geçirelim.</>}
        description="Okuduklarınızı markanıza uygulamak ister misiniz? FlixFlex ekibiyle bir oturum ayarlayalım."
      />
    </>
  )
}
