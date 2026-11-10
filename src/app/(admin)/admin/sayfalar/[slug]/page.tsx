// /admin/sayfalar/[slug] — kendi ekranı yok; üst menüdeki (breadcrumb) sayfa
// adına tıklanınca 404 yerine o sayfanın düzenleyicisi açılır.
import { redirect } from "next/navigation"

type Props = { params: Promise<{ slug: string }> }

export default async function PageSlugRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/admin/sayfalar/${encodeURIComponent(decodeURIComponent(slug))}/edit`)
}
