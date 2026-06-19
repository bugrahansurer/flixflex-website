import { StarField } from "@/components/ui/star-field"

interface MaintenanceScreenProps {
  title?: string
  message?: string
}

// Full-screen maintenance notice shown to public visitors when
// maintenance mode is enabled. Logged-in admins bypass this (see
// the public layout gate).
export function MaintenanceScreen({ title, message }: MaintenanceScreenProps) {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[var(--background)] text-[var(--foreground)] px-6 text-center">
      <StarField className="z-0" />

      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,79,216,0.12) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-xl">
        <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ff-purple)] mb-6">
          <span aria-hidden className="h-px w-7 bg-gradient-to-r from-[var(--ff-purple)] to-transparent" />
          FlixFlex
        </span>

        <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] mb-5">
          {title?.trim() || "Kısa bir bakımdayız."}
        </h1>

        <p className="text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed">
          {message?.trim() ||
            "Sitemizi sizin için daha iyi hale getiriyoruz. Çok kısa süre içinde tekrar buradayız — teşekkürler."}
        </p>

        <div className="mt-10 flex items-center gap-2 text-[12px] text-[var(--foreground-faint)]">
          <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" aria-hidden />
          Yakında tekrar yayında
        </div>
      </div>
    </main>
  )
}
