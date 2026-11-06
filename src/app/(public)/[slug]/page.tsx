import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/page-data"
import { listPublishedPortfolio } from "@/lib/content-store"
import { PageRenderer } from "@/components/public/page-renderer"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) return {}

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${slug}` },
  }
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params
  const portfolioItems = await listPublishedPortfolio();
  const page = await getPageBySlug(slug)

  // If page doesn't exist or is a draft, show 404
  if (!page || page.status !== "published") {
    notFound()
  }

  return (
    <main className="min-h-screen pt-20">
       {/* Yönetilen sayfalarda görünür başlık h2 olabildiği için ana başlık ayrıca eklenir */}
       <h1 className="sr-only">{page.title}</h1>
       <PageRenderer sections={page.sections} portfolioItems={portfolioItems} />
    </main>
  )
}
