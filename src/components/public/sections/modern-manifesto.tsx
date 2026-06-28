/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { StarField } from "@/components/ui/star-field"
import { ArrowUpRight, Maximize2, X, Play, Pause } from "@/lib/icons"

// ═══════════════════════════════════════════════════
// ModernManifestoSection — BBDO-style Per-Line Justified Edition
// The headline is split into EXACTLY 4 balanced lines and each line's font size
// is scaled so the line spans the full width, left edge to right edge. Font
// grows/shrinks per line and per screen — never word spacing, never stretched
// glyphs. Sizing comes from a one-shot hidden-ruler measurement (no feedback
// loop). CSS clamp fallback yalnızca ilk paint (SSR) için.
// ═══════════════════════════════════════════════════

export interface ModernManifestoProps {
  leftText?: string
  mediaUrl1?: string
  mediaType1?: "video" | "image"
  mediaUrl2?: string
  mediaType2?: "video" | "image"
  mediaUrl3?: string
  mediaType3?: "video" | "image"
  rightContent?: string
  ctaLabel?: string
  ctaHref?: string
  hideMobileDock?: boolean
}

/* ── Segment Types & Parsing ─────────────────────── */

interface TextSegment {
  type: "text"
  value: string
}

interface MediaSegment {
  type: "media"
  index: 1 | 2 | 3
}

type Segment = TextSegment | MediaSegment

// Custom parser that preserves trailing/leading spaces around media tags
function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = []
  const regex = /\[media([123])\]/g
  let lastIndex = 0

  for (const match of raw.matchAll(regex)) {
    const before = raw.slice(lastIndex, match.index)
    if (before) {
      segments.push({ type: "text", value: before })
    }
    segments.push({ type: "media", index: Number(match[1]) as 1 | 2 | 3 })
    lastIndex = match.index! + match[0].length
  }

  const remaining = raw.slice(lastIndex)
  if (remaining) {
    segments.push({ type: "text", value: remaining })
  }
  return segments
}

/* ── Line-Fit Model ──────────────────────────────── */
// Each visual line is fitted INDEPENDENTLY so it spans the container from the
// left margin to the right margin. We split the words into N balanced lines,
// then scale every line's font size so its natural width exactly equals the
// available width. This is how the BBDO headline justifies every line to both
// edges — purely by TYPE SIZE, never by stretching glyphs or padding the word
// spacing (which the brief explicitly forbids).

interface WordItem {
  kind: "word"
  value: string
}
interface MediaItemTok {
  kind: "media"
  index: 1 | 2 | 3
}
type LineItem = WordItem | MediaItemTok

interface FittedLine {
  items: LineItem[]
  fontPx: number
  /** Extra word-spacing (px) used ONLY on lines that have no media to stretch:
   *  the slack is distributed into the gaps BETWEEN words (justify), keeping the
   *  letters themselves tight. Lines containing media keep this at 0 — their
   *  slack is absorbed by widening the media instead. */
  wordSpacingPx: number
  /** Per-item render width in px, parallel to `items`. Media items get an
   *  explicit (widened) width so they fill the line's slack; words are null
   *  (natural width). */
  itemWidthsPx: (number | null)[]
}

// Inline media-capsule widths, in em (relative to each line's own font size).
const MEDIA_EM: Record<number, number> = { 1: 2, 2: 2.6, 3: 2.2 }

// Flatten the parsed segments into an ordered list of word/media items.
function segmentsToItems(segments: Segment[]): LineItem[] {
  const items: LineItem[] = []
  for (const seg of segments) {
    if (seg.type === "media") {
      items.push({ kind: "media", index: seg.index })
    } else {
      for (const w of seg.value.split(/\s+/)) {
        if (w) items.push({ kind: "word", value: w })
      }
    }
  }
  return items
}

// Partition items into EXACTLY `lineCount` contiguous lines whose natural
// widths are as EQUAL as possible (minimum variance). Equal widths matter for
// the "equal height + full width" headline: with one shared font size, lines of
// equal natural width all fill the container with only a tiny leftover gap, so
// the per-line letter-spacing that closes that gap stays small and unobtrusive.
// The item count is small (≈ a dozen), so brute-forcing every contiguous split
// — C(n-1, L-1) combinations — is trivially cheap and finds the true optimum.
function partitionBalanced(
  widths: number[],
  spaceW: number,
  lineCount: number,
): number[][] {
  const n = widths.length
  const L = Math.max(1, Math.min(lineCount, n))
  const lineWidth = (i: number, j: number) => {
    let s = 0
    for (let k = i; k <= j; k++) s += widths[k]
    return s + (j - i) * spaceW
  }
  if (L <= 1) return [Array.from({ length: n }, (_, i) => i)]

  let bestCuts: number[] | null = null
  let bestScore = Infinity
  const cuts: number[] = new Array(L - 1)

  const evaluate = () => {
    const pts = [0, ...cuts, n]
    const ws: number[] = []
    for (let g = 0; g < L; g++) ws.push(lineWidth(pts[g], pts[g + 1] - 1))
    const mean = ws.reduce((a, b) => a + b, 0) / L
    const variance = ws.reduce((a, b) => a + (b - mean) ** 2, 0)
    if (variance < bestScore) {
      bestScore = variance
      bestCuts = pts.slice()
    }
  }

  const place = (start: number, depth: number) => {
    if (depth === L - 1) {
      evaluate()
      return
    }
    // Leave at least one item for each remaining line.
    for (let c = start; c <= n - (L - 1 - depth); c++) {
      cuts[depth] = c
      place(c + 1, depth + 1)
    }
  }
  place(1, 0)

  const pts = bestCuts ?? [0, ...Array.from({ length: L - 1 }, (_, i) => i + 1), n]
  const groups: number[][] = []
  for (let g = 0; g < L; g++) {
    const arr: number[] = []
    for (let x = pts[g]; x < pts[g + 1]; x++) arr.push(x)
    groups.push(arr)
  }
  return groups
}

/* ── Media Type Auto-Detection Helper ────────────── */

function getResolvedMediaType(url?: string, type?: "video" | "image"): "video" | "image" {
  if (!url) return "image"

  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase()
  const isImageExt = cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".svg")
  const isVideoExt = cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov")

  if (isImageExt && type === "video") return "image"
  if (isVideoExt && type === "image") return "video"
  if (type === "video" || type === "image") return type

  if (isVideoExt || url.includes("mixkit.co/videos")) {
    return "video"
  }
  return "image"
}

/* ── Grain Overlay ───────────────────────────────── */

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  )
}

/* ── Inline Media Capsule ────────────────────────── */

interface MediaCapsuleProps {
  url?: string
  mediaType?: "video" | "image"
  accentHex: string
  onExpand: () => void
  /** Fixed inline width in em (relative to the line font). Matches the ruler
   *  measurement so each line still fits the container exactly. */
  width: string
}

const capsuleVariants = {
  hidden: { y: "40%", opacity: 0, scale: 0.8 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14
    }
  }
}

function MediaCapsule({ url, mediaType, accentHex, onExpand, width }: MediaCapsuleProps) {
  if (!url) return null

  const resolvedMediaType = getResolvedMediaType(url, mediaType)

  return (
    <motion.button
      type="button"
      aria-label="Medyayı genişlet"
      variants={capsuleVariants}
      className={cn(
        "relative inline-flex items-center justify-center",
        // Use the design-system container shape (.ff-shape-container →
        // --ff-shape-container-radius, currently 16px) instead of a
        // font-relative radius. A fixed px keeps the corner rounding identical
        // on mobile and desktop; an em radius shrank to near-sharp on small
        // (mobile) type. Also inherits the palette's clip-path shape.
        "overflow-hidden ff-shape-container",
        "shadow-2xl",
        "cursor-pointer group/capsule select-none",
        "border-0 p-0 bg-transparent"
      )}
      style={{
        // Fixed em width (BBDO reference) — the auto-fit accounts for this exact
        // width so the line still spans edge to edge. NOT a flex-grow capsule.
        width,
        height: "0.78em",
        verticalAlign: "-0.1em",
        flexShrink: 0,
      }}
      whileHover={{ scale: 1.06, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onExpand}
    >
      {/* Dynamic light ring glow */}
      <div
        aria-hidden
        className="absolute -inset-1 opacity-0 group-hover/capsule:opacity-100 transition-opacity duration-500 blur-sm -z-10"
        style={{
          background: `radial-gradient(circle, ${accentHex}aa 0%, transparent 80%)`,
        }}
      />

      {/* Media content */}
      <div className="absolute inset-0 w-full h-full overflow-hidden ff-shape-container bg-[var(--surface)]">
        {resolvedMediaType === "video" ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/capsule:scale-110"
          />
        ) : (
          <img
            src={url}
            alt="manifesto visual capsule"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/capsule:scale-110"
            loading="lazy"
          />
        )}

        {/* Hover overlay shade */}
        <div className="absolute inset-0 bg-black/10 group-hover/capsule:bg-black/0 transition-colors duration-300" />

        {/* Maximize action indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/capsule:opacity-100 transition-all duration-300">
          <Maximize2 className="w-3.5 h-3.5 text-white/90 transform scale-75 group-hover/capsule:scale-100 transition-transform duration-300" />
        </div>
      </div>
    </motion.button>
  )
}

/* ── Interactive Modal ────────────────────────────── */

interface MediaModalProps {
  activeMedia: { url?: string; type?: "video" | "image" } | null
  onClose: () => void
  accentHex: string
}

function MediaModal({ activeMedia, onClose, accentHex }: MediaModalProps) {
  const [isPlaying, setIsPlaying] = React.useState(true)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Pause video and reset play state when modal closes.
  // The exit animation keeps the video element mounted for ~300 ms after
  // activeMedia becomes null — without this the video keeps decoding frames.
  React.useEffect(() => {
    if (!activeMedia) {
      videoRef.current?.pause()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(true) // reset for next open
    }
  }, [activeMedia])

  const { url, type: mediaType } = activeMedia ?? {}

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        void videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <Dialog.Root open={!!activeMedia} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {activeMedia && (
            <>
              {/* Overlay */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 backdrop-blur-xl bg-black/80"
                />
              </Dialog.Overlay>

              {/* Content */}
              <Dialog.Content asChild>
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] max-w-4xl w-[calc(100vw-2rem)] aspect-video overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 bg-zinc-950 outline-none"
                >
                  {/* Visually hidden accessible labels */}
                  <Dialog.Title className="sr-only">Medya Görüntüleyici</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Seçilen medya içeriği. Kapatmak için Escape tuşuna basın.
                  </Dialog.Description>

                  {/* Media Container */}
                  <div className="w-full h-full relative group">
                    {mediaType === "video" ? (
                      <>
                        <video
                          ref={videoRef}
                          src={url}
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                          onClick={togglePlay}
                        />
                        <button
                          type="button"
                          onClick={togglePlay}
                          aria-label={isPlaying ? "Videoyu duraklat" : "Videoyu oynat"}
                          className="absolute bottom-6 left-6 p-4 bg-black/60 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 hover:bg-black/80"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      </>
                    ) : (
                      <img src={url} alt="Genişletilmiş görsel" className="w-full h-full object-cover" />
                    )}

                    {/* Glowing Aura Frame */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        boxShadow: `inset 0 0 40px ${accentHex}`,
                      }}
                    />
                  </div>

                  {/* Close Button */}
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Kapat"
                      className="absolute top-6 right-6 p-3 bg-black/60 border border-white/10 text-white hover:scale-105 transition-transform duration-200 hover:bg-black/85"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ── Main Component ──────────────────────────────── */

export function ModernManifestoSection({
  leftText = "WE ARE [media1] FLIXFLEX WE [media2] DO BIG [media3] THINGS",
  mediaUrl1 = "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-looking-at-camera-34293-large.mp4",
  mediaType1 = "video",
  mediaUrl2 = "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-using-smartphone-40742-large.mp4",
  mediaType2 = "video",
  mediaUrl3 = "https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-ocean-1527-large.mp4",
  mediaType3 = "video",
  rightContent = "<p>We solve big problems with strategy and creative that make a big impact.</p><p>We work with brands and marketers that have the biggest ambitions.</p><p>We hire big talent and bring them big opportunities that build boundless careers.</p>",
  ctaLabel = "Birlikte Çalışalım",
  ctaHref = "/iletisim",
}: ModernManifestoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const manifestoRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(manifestoRef, { once: true, margin: "-120px" })

  // ── Per-line auto-fit → 4 full-width lines ─────────
  // (See the Line-Fit Model note above.) The headline is split into exactly 4
  // balanced lines and each line's font size is scaled so the line spans the
  // full width, from the left edge to the right edge. Font therefore grows and
  // shrinks per line and per screen — never word spacing.
  //
  // Stability: every size comes from a one-shot measurement against a hidden,
  // absolutely-positioned ruler — we NEVER read back our own resized output, so
  // there is no ResizeObserver feedback loop and no oscillation. The fit runs
  // synchronously on mount (works even in a hidden/background tab, where rAF is
  // paused) and re-runs only when the available WIDTH changes, plus once web
  // fonts finish loading (their glyph widths move the fit).
  const TARGET_LINES = 4
  const MIN_FONT = 12
  const MAX_FONT = 400
  const REF_FONT = 100 // reference px size used only for ruler measurement

  const items = React.useMemo(
    () => segmentsToItems(parseSegments(leftText || "")),
    [leftText],
  )

  const [lines, setLines] = React.useState<FittedLine[] | null>(null)

  React.useEffect(() => {
    const el = manifestoRef.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return

    let timer = 0
    let retries = 0
    let lastWidth = -1

    // Measure the natural width (at REF_FONT) of a run of items, replicating the
    // exact inline structure a visible line uses — words as inline-block spans
    // separated by single spaces, media as fixed em-width boxes — so the fit is
    // pixel-accurate. `el.className` is copied so the ruler inherits the same
    // font-family/weight/uppercase/letter-spacing that affect glyph widths.
    const measureRun = (run: LineItem[], wordSpacingPx = 0): number => {
      const ruler = document.createElement("div")
      ruler.setAttribute("aria-hidden", "true")
      ruler.className = el.className
      ruler.style.cssText =
        "position:absolute;left:-99999px;top:0;visibility:hidden;white-space:nowrap;display:inline-block;width:auto;"
      ruler.style.fontSize = `${REF_FONT}px`
      // Letters always stay tight (0). Lines without media are filled by adding
      // WORD spacing (gaps between words), measured via this same param so the
      // visible line matches the ruler exactly.
      ruler.style.letterSpacing = "0px"
      ruler.style.wordSpacing = `${wordSpacingPx}px`
      run.forEach((it, idx) => {
        if (idx > 0) ruler.appendChild(document.createTextNode(" "))
        const s = document.createElement("span")
        s.style.display = "inline-block"
        if (it.kind === "word") {
          s.textContent = it.value
        } else {
          s.style.width = `${(MEDIA_EM[it.index] ?? 2) * REF_FONT}px`
          s.style.height = "1px"
        }
        ruler.appendChild(s)
      })
      el.appendChild(ruler)
      const w = ruler.offsetWidth
      el.removeChild(ruler)
      return w
    }

    const fit = () => {
      const its = items
      const containerW = el.clientWidth
      // Width/layout may not be ready yet — retry briefly (bounded, never spins).
      if (containerW <= 0 || its.length === 0) {
        if (retries++ < 40) timer = window.setTimeout(fit, 32)
        return
      }
      retries = 0

      // Per-item widths drive the split; an approximate space width is fine here
      // because the final fill uses exact per-line measurements below.
      const widths = its.map((it) => measureRun([it]))
      const spaceApprox = REF_FONT * 0.28

      // Break into 4 lines of as-equal-as-possible natural width.
      const groups = partitionBalanced(
        widths,
        spaceApprox,
        Math.min(TARGET_LINES, its.length),
      )
      const lineRuns = groups.map((idxs) => idxs.map((i) => its[i]))

      // Exact natural widths at REF_FONT (media at its natural em width).
      const PROBE = 10
      const nat = lineRuns.map((r) => measureRun(r, 0))

      // ONE shared font size = the largest that still fits the WIDEST line at
      // its natural width (so no line overflows and no media has to shrink).
      // Equal font size ⇒ equal line height.
      const maxNat = Math.max(...nat, 1)
      const uniformFont = Math.max(
        MIN_FONT,
        Math.min(MAX_FONT, (REF_FONT * containerW) / maxNat),
      )

      const fitted: FittedLine[] = lineRuns.map((run, i) => {
        // Slack = how much this line falls short of the full width at the
        // shared font size, with media at its natural width.
        const w0 = nat[i] * (uniformFont / REF_FONT)
        const slack = Math.max(0, containerW - w0)

        const itemWidthsPx: (number | null)[] = run.map(() => null)
        const mediaPositions = run
          .map((it, ii) => (it.kind === "media" ? ii : -1))
          .filter((ii) => ii >= 0)

        let wordSpacingPx = 0
        if (mediaPositions.length > 0) {
          // Preferred path: WIDEN the media to swallow the slack, so the words
          // stay at their natural spacing. Slack is split evenly if a line has
          // more than one media.
          const extra = slack / mediaPositions.length
          for (const ii of mediaPositions) {
            const it = run[ii] as MediaItemTok
            const basePx = (MEDIA_EM[it.index] ?? 2) * uniformFont
            itemWidthsPx[ii] = basePx + extra
          }
        } else {
          // Fallback (a line with NO media): distribute the slack into the gaps
          // BETWEEN words (word-spacing). The probe measures how many word gaps
          // the line has; word-spacing has no trailing slot, so the line ends up
          // flush on both edges with the letters left tight.
          const spaces = Math.max(1, (measureRun(run, PROBE) - nat[i]) / PROBE)
          // word-spacing is absolute px and the gap COUNT is font-independent,
          // so this single value fills the slack exactly at the uniform font.
          wordSpacingPx = slack / spaces
        }

        return {
          items: run,
          fontPx: Math.round(uniformFont * 100) / 100,
          wordSpacingPx: Math.round(wordSpacingPx * 100) / 100,
          itemWidthsPx: itemWidthsPx.map((w) => (w == null ? null : Math.round(w * 100) / 100)),
        }
      })

      setLines((prev) => {
        const sig = (l: FittedLine) =>
          `${l.fontPx}|${l.wordSpacingPx}|${l.itemWidthsPx.join(",")}`
        if (
          prev &&
          prev.length === fitted.length &&
          prev.every((p, i) => sig(p) === sig(fitted[i]))
        ) {
          return prev
        }
        return fitted
      })
    }

    // Debounced re-fit. setTimeout (NOT requestAnimationFrame): rAF is paused in
    // hidden/background tabs, so an rAF fit would silently never run there.
    const schedule = () => {
      clearTimeout(timer)
      timer = window.setTimeout(fit, 0)
    }

    fit() // synchronous initial fit — runs even in a hidden tab

    // Re-fit only when the AVAILABLE width changes. Our own font changes alter
    // the headline's height, not the parent's width, so observing the parent and
    // gating on width breaks the feedback loop that caused oscillation.
    const observer = new ResizeObserver(() => {
      const w = parent.clientWidth
      if (w === lastWidth) return
      lastWidth = w
      schedule()
    })
    observer.observe(parent)
    lastWidth = parent.clientWidth

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(fit).catch(() => { })
    }

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [items])

  // Spotlight effect coordinates
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const spotlightX = useSpring(mouseX, { stiffness: 60, damping: 25 })
  const spotlightY = useSpring(mouseY, { stiffness: 60, damping: 25 })

  // Active expanded media modal
  const [activeMedia, setActiveMedia] = React.useState<{
    url?: string
    type?: "video" | "image"
  } | null>(null)

  const mediaMap: Record<number, { url?: string; type?: "video" | "image" }> = React.useMemo(() => ({
    1: { url: mediaUrl1, type: mediaType1 },
    2: { url: mediaUrl2, type: mediaType2 },
    3: { url: mediaUrl3, type: mediaType3 },
  }), [mediaUrl1, mediaType1, mediaUrl2, mediaType2, mediaUrl3, mediaType3])

  /* Colors are locked to the active theme — not user-configurable. */
  const resolvedBg = "var(--background)"
  const resolvedText = "var(--foreground)"
  const resolvedAccent = "var(--ff-purple)"
  // Hex equivalent of the default theme primary, used for the rgba glow/aura
  // effects where a CSS var with alpha suffix isn't valid.
  const accentHex = "#FF4FD8"

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  // Render one fitted item (word or inline media) inside a line. Words keep the
  // clip-and-slide reveal: an inline-block overflow-hidden wrapper (its width is
  // exactly the glyph width, so it never disturbs the per-line fit) clips the
  // inner span as it animates up from below.
  const renderItem = (it: LineItem, key: React.Key, widthPx?: number | null) => {
    if (it.kind === "media") {
      const media = mediaMap[it.index]
      // widthPx (when provided) is the fit-computed, widened width that makes
      // this media absorb the line's slack; otherwise fall back to the natural
      // em width.
      return (
        <MediaCapsule
          key={key}
          url={media?.url}
          mediaType={media?.type}
          accentHex={accentHex}
          width={widthPx != null ? `${widthPx}px` : `${MEDIA_EM[it.index] ?? 2}em`}
          onExpand={() => {
            const resolvedType = getResolvedMediaType(media?.url, media?.type)
            setActiveMedia({ url: media?.url, type: resolvedType })
          }}
        />
      )
    }
    return (
      <span key={key} className="inline-block overflow-hidden align-bottom leading-[0.85]">
        <motion.span
          className="inline-block"
          variants={{
            hidden: { y: "115%" },
            visible: {
              y: 0,
              transition: { type: "spring", stiffness: 80, damping: 15 },
            },
          }}
        >
          <span className="inline-block transition-colors duration-300 hover:text-[var(--manifesto-accent)] cursor-default">
            {it.value}
          </span>
        </motion.span>
      </span>
    )
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        // min-h-screen (NOT a fixed h-screen): each line is fitted to the full
        // width, so on wide screens the type — and therefore the headline — can
        // be taller than one viewport. Letting the section grow keeps the
        // headline AND the dashboard fully visible instead of clipping them.
        "relative flex flex-col items-center justify-center w-full min-h-screen overflow-hidden py-24 md:py-20",
        // Background/text come from the resolved theme vars in `style` below;
        // keep only the structural classes here so the section adapts to the
        // active light/dark theme instead of being locked to a dark palette.
        "transition-colors duration-700 ease-in-out border-b border-[var(--border)]"
      )}
      style={{
        "--manifesto-bg": resolvedBg,
        "--manifesto-text": resolvedText,
        "--manifesto-accent": resolvedAccent,
        backgroundColor: resolvedBg,
        color: resolvedText,
      } as React.CSSProperties}
    >
      {/* Tactile Grids & Overlays */}
      <GrainOverlay />

      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      {/* Cursor spotlight halo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[130px] z-0"
        style={{
          left: spotlightX,
          top: spotlightY,
          background: `radial-gradient(circle, ${accentHex}33 0%, transparent 70%)`,
        }}
      />

      {/* Decorative Ambient Aura Nodes */}
      <div className="pointer-events-none absolute top-1/4 -left-20 w-80 h-80 blur-[120px] opacity-[0.06]" style={{ backgroundColor: accentHex }} />
      <div className="pointer-events-none absolute bottom-1/4 -right-20 w-96 h-96 blur-[140px] opacity-[0.04]" style={{ backgroundColor: accentHex }} />

      {/*
        Outer container: on mobile, horizontal padding is removed so the
        manifesto text block bleeds to the screen edges. On md+ the original
        px-12 / xl:px-20 is restored.  The inner `max-w-[1440px]` wrapper
        keeps desktop content constrained.
      */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 py-6 md:py-12 xl:py-20">

        {/* Core Manifesto Box — BBDO-style per-line justified headline.
            Each line is its own block, sized by JS so it fills the full width
            from edge to edge. Stagger cascades: root staggers the lines, each
            line staggers its words. */}
        <motion.div
          ref={manifestoRef}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className={cn(
            "w-full font-display font-black uppercase",
            // Düz blok, sol hizalı. Her satır kendi font boyutuyla tam genişliğe
            // yaslanır; satır yüksekliği BBDO gibi sıkı.
            "block text-left",
            "leading-[0.92]",
            "tracking-[0.01em]",
          )}
        >
          {lines
            ? lines.map((line, li) => (
              <motion.div
                key={li}
                // Shared font size (equal line height). Letters stay tight
                // (letterSpacing 0); a line is filled either by widening its
                // media or — when it has none — by word-spacing (gaps between
                // words). nowrap keeps it on one line.
                className="block whitespace-nowrap"
                style={{
                  fontSize: `${line.fontPx}px`,
                  letterSpacing: "0px",
                  wordSpacing: `${line.wordSpacingPx}px`,
                }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
              >
                {line.items.map((it, ii) => (
                  <React.Fragment key={ii}>
                    {ii > 0 ? " " : null}
                    {renderItem(it, `l${li}-i${ii}`, line.itemWidthsPx[ii])}
                  </React.Fragment>
                ))}
              </motion.div>
            ))
            : (
              // Pre-fit fallback (SSR / very first paint, before the ruler
              // measurement runs): natural wrap at a viewport-scaled size so
              // there is never a flash of tiny or broken text.
              <div className="block" style={{ fontSize: "clamp(2.5rem, 9vw, 7rem)" }}>
                {items.map((it, ii) => (
                  <React.Fragment key={ii}>
                    {ii > 0 ? " " : null}
                    {it.kind === "word" ? (
                      <span className="inline-block align-bottom">{it.value}</span>
                    ) : (
                      <span
                        className="inline-block"
                        style={{
                          width: `${MEDIA_EM[it.index] ?? 2}em`,
                          height: "0.78em",
                          verticalAlign: "-0.1em",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
        </motion.div>

        {/* Minimal Details Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 px-6 md:px-0"
        >
          {/* Subtle separator with accent pulse */}
          <div className="relative mb-12">
            <div className="h-px w-full" style={{
              background: `linear-gradient(90deg, ${accentHex}33 0%, var(--border) 50%, transparent 100%)`
            }} />
            <div
              className="absolute left-0 top-0 h-px w-24"
              style={{ backgroundColor: accentHex }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Descriptive Brand Quote */}
            {rightContent && (() => {
              const hasHtml = /<\/?[a-z][\s\S]*>/i.test(rightContent)
              if (hasHtml) {
                return (
                  <div
                    className="lg:col-span-8 text-[var(--foreground-muted)] text-xs sm:text-base md:text-sm leading-relaxed max-w-2xl font-light space-y-4 [&_p]:text-inherit"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(rightContent) }}
                  />
                )
              }
              const lines = rightContent.split(/\r?\n/).filter((line) => line.trim() !== "")
              return (
                <div className="lg:col-span-8 text-[var(--foreground-muted)] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-light space-y-4">
                  {lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )
            })()}

            {/* Interactive Call to Action */}
            {ctaLabel && (
              <div className="lg:col-span-4 lg:flex lg:justify-end">
                <a
                  href={ctaHref || "#"}
                  className="ff-shape-button group relative inline-flex items-center gap-3.5 h-12 px-8 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--ff-purple)]/40 text-xs font-bold text-[var(--foreground)] overflow-hidden transition-all duration-300"
                >
                  {/* Glowing background flow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"
                    style={{
                      background: `radial-gradient(circle at center, ${accentHex}1a 0%, transparent 80%)`
                    }}
                  />
                  <span className="relative z-10">{ctaLabel}</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--ff-purple)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                  {/* Subtle inner hover glow line */}
                  <div className="absolute inset-0 scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" style={{
                    boxShadow: `inset 0 0 12px ${accentHex}20`
                  }} />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Expanded Media Modal — Radix Dialog with AnimatePresence exit animation */}
      <MediaModal
        activeMedia={activeMedia}
        accentHex={accentHex}
        onClose={() => setActiveMedia(null)}
      />
    </section>
  )
}
