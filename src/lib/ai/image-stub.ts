// ═══════════════════════════════════════════════════════════
// FlixFlex — Image Placeholder Generator (STUB)
//
// TODO: Replace with real Replicate / DALL-E / Imagen call
// when the image-gen pipeline is greenlit. Until then we
// deterministically derive a tasteful brand-coloured gradient
// SVG from a hash of the prompt — same prompt = same image,
// which is handy for cached previews and Storybook stories.
// ═══════════════════════════════════════════════════════════

// ── DJB2 hash → 32-bit unsigned int ────────────────────────
function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// ── FlixFlex-tuned gradient palette ────────────────────────
// Each pair is anchored on the FlixFlex purple so generated
// images never feel off-brand — the second colour rotates
// across the spectrum for visual variety.
const PALETTE: Array<[string, string]> = [
  ["var(--ff-purple)", "#0C0C0C"], // signature
  ["var(--ff-purple)", "#1A3A6B"], // deep blue
  ["var(--ff-purple)", "#0D6931"], // emerald
  ["var(--ff-purple)", "#B45309"], // amber
  ["var(--ff-purple)", "#9D174D"], // hot pink
  ["var(--ff-purple)", "#0369A1"], // ocean
  ["var(--ff-purple)", "#7F1D1D"], // crimson
  ["var(--ff-purple)", "#4C1D95"], // royal purple
]

/**
 * Build a deterministic SVG gradient placeholder as a
 * `data:image/svg+xml,...` URL.
 *
 * Determinism matters: the wizard re-renders the same image
 * thumbnails between steps and we don't want the gradient
 * to flicker on each re-render.
 */
export function generateImagePlaceholder(prompt: string): string {
  const hash = djb2(prompt || "fallback")
  const [a, b] = PALETTE[hash % PALETTE.length]
  const angle = hash % 360
  // Use a stable id so multiple inlined SVGs don't fight over `gradient`
  const id = `g${hash.toString(36).slice(0, 6)}`
  const label = (prompt || "FlixFlex").slice(0, 32)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="${id}" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#${id})"/>
  <rect width="1200" height="630" fill="rgba(0,0,0,0.35)"/>
  <text x="60" y="555" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.85)" letter-spacing="2">FLIXFLEX // AI</text>
  <text x="60" y="595" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.55)">${escapeXml(label)}</text>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
