"use client"

import { useEffect, useRef, useState } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import Link from "next/link"
import { cn } from "@/lib/utils"

const projects = [
  {
    id: 1,
    title: "Marka Kimliği",
    category: "Brand Identity",
    year: "2024",
    gradient: "from-[#1A1030] via-[#2D1B4E] to-[#0F0E1A]",
    accent: "#FF4FD8",
    href: "/portfolio/marka-kimligi",
  },
  {
    id: 2,
    title: "Dijital Büyüme",
    category: "Digital Marketing",
    year: "2024",
    gradient: "from-[#0F1428] via-[#1A2A50] to-[#081228]",
    accent: "#3B82F6",
    href: "/portfolio/dijital-buyume",
  },
  {
    id: 3,
    title: "Web Deneyimi",
    category: "Web Design",
    year: "2023",
    gradient: "from-[#1A0E20] via-[#2D1555] to-[#0F0A18]",
    accent: "#8B5CF6",
    href: "/portfolio/web-deneyimi",
  },
  {
    id: 4,
    title: "Mobil Uygulama",
    category: "Developing",
    year: "2023",
    gradient: "from-[#0E1A10] via-[#1A3A28] to-[#0A120E]",
    accent: "#10B981",
    href: "/portfolio/mobil-uygulama",
  },
  {
    id: 5,
    title: "Performans",
    category: "Performance",
    year: "2023",
    gradient: "from-[#1A0E0E] via-[#3A1A1A] to-[#120A0A]",
    accent: "#EF4444",
    href: "/portfolio/performans",
  },
]

export function HorizontalShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (isMobile || !wrapperRef.current || !trackRef.current) return

    const totalWidth = trackRef.current.scrollWidth - window.innerWidth

    const ctx = gsap.context(() => {
      const tween = gsap.to(trackRef.current, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          onUpdate: (self: ScrollTrigger) => {
            if (progressRef.current) {
              progressRef.current.style.width = `${self.progress * 100}%`
            }
          },
        },
      })

      trackRef.current!.querySelectorAll<HTMLElement>(".h-card").forEach((card) => {
        gsap.from(card.querySelector(".card-content"), {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: tween,
            start: "left 80%",
            toggleActions: "play none none reverse",
          },
        })
      })
    }, wrapperRef)

    return () => ctx.revert()
  }, [isMobile])

  // Mobile fallback — vertical grid
  if (isMobile) {
    return (
      <section className="py-16 bg-[var(--background)]">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-2">
              İşlerimiz
            </p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Seçili Projeler
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={project.href}
                className={cn(
                  "relative rounded-2xl overflow-hidden h-[320px] group",
                  "bg-gradient-to-br", project.gradient
                )}
              >
                <div
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
                  style={{ background: project.accent }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-10 blur-3xl"
                  style={{ background: project.accent }}
                />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest opacity-60">
                      {project.category}
                    </span>
                    <span className="text-xs opacity-60">{project.year}</span>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold mb-4">{project.title}</h3>
                    <span className="inline-flex items-center gap-2 text-sm font-medium border border-white/30 rounded-full px-5 py-2.5">
                      Projeyi İncele <span>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href="/portfolio"
              className="flex flex-col items-center gap-4 py-12 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors border-2 border-dashed border-[var(--border)] rounded-2xl"
            >
              <div className="w-16 h-16 rounded-full border border-[var(--border)] flex items-center justify-center">
                <span className="text-2xl">→</span>
              </div>
              <span className="text-sm uppercase tracking-widest">Tüm Projeler</span>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Desktop — horizontal scroll
  return (
    <section className="relative bg-[#0A0814]">
      {/* Progress bar — absolute within section, NOT fixed */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/5 z-20">
        <div
          ref={progressRef}
          className="h-full bg-[var(--ff-purple)]"
          style={{ width: "0%" }}
        />
      </div>

      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden"
        style={{ background: "#0A0814" }}
      >
        {/* Section başlığı */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
            İşlerimiz
          </p>
          <h2 className="text-4xl font-bold text-white">
            Seçili Projeler
          </h2>
        </div>

        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="flex items-center"
          style={{
            width: `${projects.length * 80 + 30}vw`,
            paddingLeft: "15vw",
            paddingTop: "100px",
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "h-card flex-shrink-0 w-[70vw] h-[75vh]",
                "rounded-2xl overflow-hidden relative group mr-6",
                "bg-gradient-to-br", project.gradient
              )}
            >
              {/* Decorative elements */}
              <div
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl"
                style={{ background: project.accent }}
              />
              <div
                className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl"
                style={{ background: project.accent }}
              />

              {/* Geometric accent lines */}
              <div className="absolute inset-0 opacity-[0.06]">
                <div
                  className="absolute top-0 right-0 w-1/2 h-px"
                  style={{ background: `linear-gradient(to left, ${project.accent}, transparent)` }}
                />
                <div
                  className="absolute bottom-0 left-0 w-1/2 h-px"
                  style={{ background: `linear-gradient(to right, ${project.accent}, transparent)` }}
                />
              </div>

              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse at center, ${project.accent}10 0%, transparent 60%)`,
                }}
              />

              {/* Content */}
              <div className="card-content absolute inset-0 flex flex-col justify-between p-10 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest opacity-60">
                    {project.category}
                  </span>
                  <span className="text-xs opacity-60">{project.year}</span>
                </div>

                <div>
                  <h3 className="text-5xl font-bold mb-4">{project.title}</h3>
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-3 text-sm font-medium border border-white/30 rounded-full px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
                  >
                    Projeyi İncele <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Son kart — Tüm projeler */}
          <div className="flex-shrink-0 w-[30vw] h-[75vh] flex items-center justify-center">
            <Link
              href="/portfolio"
              className="group flex flex-col items-center gap-4 text-white/40 hover:text-white transition-colors"
            >
              <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--ff-purple)] transition-all duration-300">
                <span className="text-2xl">→</span>
              </div>
              <span className="text-sm uppercase tracking-widest">
                Tüm Projeler
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
