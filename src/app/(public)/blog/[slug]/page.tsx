import type { Metadata } from "next"
import { JsonLd, SITE_URL, breadcrumbLd } from "@/components/seo/json-ld"
import { notFound } from "next/navigation"
import { ReadingProgressBar } from "@/components/public/blog/reading-progress-bar"
import { BlogTemplateClassic } from "@/components/public/blog/templates/blog-template-classic"
import { BlogTemplateEditorial } from "@/components/public/blog/templates/blog-template-editorial"
import { BlogTemplateVisual } from "@/components/public/blog/templates/blog-template-visual"
import type { BlogPost } from "@/components/public/blog/blog-data"
import { getPublishedBlogBySlug, listRelatedBlogPosts } from "@/lib/content-store"
import type { JSX } from "react"

export const revalidate = 60

// ── generateMetadata ─────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogBySlug(slug)

  if (!post) {
    return {
      title: "Yazı Bulunamadı",
    }
  }

  const url = `/blog/${post.slug}`
  const shareImage = post.ogImage || post.coverImage
  const images = shareImage ? [{ url: shareImage, alt: post.title }] : undefined

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      siteName: "FlixFlex",
      publishedTime: post.publishedAt,
      tags: post.tags,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(images ? { images } : {}),
    },
    alternates: {
      canonical: url,
    },
  }
}

// ── SSS → FAQPage ────────────────────────────────────────
// İçerikteki "## Sık sorulan sorular" bölümündeki "### Soru" + paragraf
// çiftlerini yapılandırılmış veriye çevirir (arama sonuçlarında SSS).
function extractFaq(content: string): { q: string; a: string }[] {
  const start = content.search(/^## Sık sorulan sorular\s*$/im)
  if (start < 0) return []
  const rest = content.slice(start).split("\n").slice(1).join("\n")
  const end = rest.search(/^## /m)
  const section = end >= 0 ? rest.slice(0, end) : rest
  return section
    .split(/^### /m)
    .slice(1)
    .map((block) => {
      const [q, ...body] = block.trim().split("\n")
      const a = body
        .join(" ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\*\*/g, "")
        .replace(/\s+/g, " ")
        .trim()
      return { q: q.trim(), a }
    })
    .filter((x) => x.q && x.a)
}

// ── Template map ─────────────────────────────────────────
const TEMPLATES: Record<
  BlogPost["template"],
  (props: { post: BlogPost; related: BlogPost[] }) => JSX.Element
> = {
  classic:   ({ post, related }) => <BlogTemplateClassic post={post} related={related} />,
  editorial: ({ post, related }) => <BlogTemplateEditorial post={post} related={related} />,
  visual:    ({ post, related }) => <BlogTemplateVisual post={post} related={related} />,
}

// ── Page ─────────────────────────────────────────────────
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await getPublishedBlogBySlug(slug)
  if (!post) notFound()

  // After notFound() TypeScript still needs narrowing
  const safePost = post as BlogPost
  const related = await listRelatedBlogPosts(slug, 3, safePost.category)
  const Template = TEMPLATES[safePost.template]

  const faq = extractFaq(safePost.content)

  return (
    <>
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((x) => ({
              "@type": "Question",
              name: x.q,
              acceptedAnswer: { "@type": "Answer", text: x.a },
            })),
          }}
        />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: safePost.title,
          description: safePost.excerpt,
          ...(safePost.coverImage ? { image: safePost.coverImage } : {}),
          datePublished: safePost.publishedAt,
          inLanguage: "tr-TR",
          articleSection: safePost.category,
          mainEntityOfPage: `${SITE_URL}/blog/${safePost.slug}`,
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: safePost.title, path: `/blog/${safePost.slug}` },
        ])}
      />
      <ReadingProgressBar />
      <Template post={safePost} related={related} />
    </>
  )
}
