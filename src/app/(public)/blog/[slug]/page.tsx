import type { Metadata } from "next"
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
      title: "Yazı Bulunamadı | FlixFlex",
    }
  }

  const url = `https://flixflex.com/blog/${post.slug}`

  return {
    title: `${post.title} | FlixFlex`,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      siteName: "FlixFlex",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: url,
    },
  }
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

  return (
    <>
      <ReadingProgressBar />
      <Template post={safePost} related={related} />
    </>
  )
}
