// JSON-LD <script> — "<" karakteri kaçırılır, içerikten script kapanışı
// (</script>) enjekte edilemez.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://flixflex.com.tr").replace(/\/$/, "")

/** Ana sayfa → … → mevcut sayfa breadcrumb'ı */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}
