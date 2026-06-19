import Link from "next/link"
import { ArrowUpRight, Home } from "@/lib/icons"

export const metadata = {
  title: "404 — Sayfa Bulunamadı",
  description: "Aradığın sayfa burada değil — ama domine edebileceğin başka yerler var.",
}

export default function NotFound() {
  return (
    <main id="content" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[var(--background)] text-[var(--foreground)] px-6">
      {/* Purple aura */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 79, 216,0.18) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 text-center max-w-2xl">
        <p className="text-[11px] font-semibold text-[var(--ff-purple)] mb-6">
          Sayfa Bulunamadı
        </p>

        <p
          className="font-display font-extrabold leading-[0.85] tracking-[-0.04em] text-[var(--ff-purple)]"
          style={{ fontSize: "clamp(80px, 18vw, 160px)" }}
        >
          404
        </p>

        <h1 className="mt-4 font-display text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Bu sayfa{" "}
          <span className="text-[var(--foreground-muted)]">kaybolmuş.</span>
        </h1>

        <p className="mt-5 text-base md:text-md text-[var(--foreground-muted)] max-w-md mx-auto leading-relaxed">
          Aradığın URL artık burada değil ya da hiç olmadı. Domine edeceğin
          başka yerler var — devam et.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="ff-shape-button group inline-flex items-center justify-center h-9 gap-2.5 px-3 text-xs font-medium bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)] hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)] hover:shadow-[0_4px_24px_rgba(255, 79, 216,0.45)] transition-all duration-200"
          >
            <Home size={14} />
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/iletisim"
            className="ff-shape-button group inline-flex items-center justify-center h-9 gap-2.5 px-3 text-xs font-medium bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)] transition-all duration-200"
          >
            İletişime Geç
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </main>
  )
}
