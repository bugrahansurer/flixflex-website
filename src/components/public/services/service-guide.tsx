import type { ReactNode } from "react"
import Link from "next/link"
import { JsonLd } from "@/components/seo/json-ld"
import { Eyebrow } from "@/components/ui/eyebrow"
import type { ServiceGuide } from "./service-guides"

// "[metin](/yol)" → iç link. Sadece site içi yollar desteklenir.
const LINK_RE = /\[([^\]]+)\]\((\/[^)\s]*)\)/g

function InlineText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(LINK_RE)) {
    const i = m.index ?? 0
    if (i > last) parts.push(text.slice(last, i))
    parts.push(
      <Link
        key={i}
        href={m[2]}
        className="text-[var(--ff-purple)] underline underline-offset-2 hover:opacity-80"
      >
        {m[1]}
      </Link>,
    )
    last = i + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

const plain = (text: string) => text.replace(LINK_RE, "$1")

/**
 * Hizmet sayfasının alt kısmındaki uzun içerik + SSS.
 * Sunucuda render edilir; SSS <details> ile açılır, böylece metin
 * JavaScript olmadan da arama motorlarına görünür.
 */
export function ServiceGuideSection({ guide }: { guide: ServiceGuide }) {
  return (
    <section className="py-20 md:py-28 bg-[var(--background)] border-t border-[var(--border)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
          })),
        }}
      />
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr] gap-12 lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow className="mb-4">{guide.eyebrow}</Eyebrow>
          </div>

          <div className="flex flex-col gap-14 max-w-3xl">
            {guide.sections.map((s) => (
              <article key={s.heading} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--foreground)]">
                  {s.heading}
                </h2>
                {s.paragraphs?.map((p, i) => (
                  <p key={i} className="text-base text-[var(--foreground-muted)] leading-relaxed">
                    <InlineText text={p} />
                  </p>
                ))}
                {s.bullets && (
                  <ul className="flex flex-col gap-3 pl-5 list-disc marker:text-[var(--ff-purple)]">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="text-base text-[var(--foreground-muted)] leading-relaxed">
                        <InlineText text={b} />
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--foreground)]">
                Sık sorulan sorular
              </h2>
              <div className="border-t border-[var(--border)]">
                {guide.faqs.map((f) => (
                  <details key={f.q} className="group border-b border-[var(--border)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-[var(--foreground)] hover:text-[var(--ff-purple)] transition-colors duration-150">
                      <h3 className="text-base md:text-lg">{f.q}</h3>
                      <span aria-hidden className="text-xl leading-none transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="pb-5 text-base text-[var(--foreground-muted)] leading-relaxed">
                      <InlineText text={f.a} />
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
