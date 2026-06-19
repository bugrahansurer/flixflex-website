// ═══════════════════════════════════════════════════════════
// FlixFlex UI Component Library — Barrel Export
// ═══════════════════════════════════════════════════════════

// ── Core FlixFlex Components ─────────────────────
export { FFButton }             from "./ff-button"
export type { FFButtonProps }   from "./ff-button"

export { FFContainer, FFCard, FFSection } from "./ff-container"
export type { FFContainerProps, FFCardProps } from "./ff-container"

export { FFBadge }              from "./ff-badge"
export type { FFBadgeProps }    from "./ff-badge"

export { FFInput, FFTextarea }  from "./ff-input"
export type { FFInputProps, FFTextareaProps } from "./ff-input"

export {
  FFSelect,
  FFSelectItem,
  FFSelectGroup,
  FFSelectLabel,
  FFSelectSeparator,
} from "./ff-select"
export type { FFSelectProps } from "./ff-select"

export { FFDivider }            from "./ff-divider"
export { FFStatCounter }        from "./ff-stat-counter"
export { FFMarquee, MarqueeTag } from "./ff-marquee"
export { FFCursor }             from "./ff-cursor"
export { FFSlider }             from "./ff-slider"

// ── Theme ─────────────────────────────────────────
export { ThemeToggle }          from "./theme-toggle"

// ── Animation Components ─────────────────────────
export { BackgroundPaths }      from "./background-paths"
export {
  AnimatedHeading,
  AnimatedWords,
  RotatingText,
  FadeInText,
}                               from "./animated-text"

// ── 21st.dev Adapted ─────────────────────────────
export { TestimonialCarousel }  from "./testimonial"
export type { Testimonial }     from "./testimonial"

export { ContainerScroll }      from "./container-scroll-animation"

// ── Interaction Components ───────────────────────
export { TiltCard }             from "./tilt-card"
export type { TiltCardProps }   from "./tilt-card"

export { Eyebrow }              from "./eyebrow"
export { Magnetic }             from "./magnetic"
export { Reveal, RevealGroup, RevealItem } from "./reveal"

export { PoemAnimation }        from "./3d-animation"
export type { PoemAnimationProps } from "./3d-animation"

// NOTE: WovenLightHero is NOT re-exported here on purpose — it statically
// imports three.js (~600KB). Import it lazily via next/dynamic at the
// callsite so three.js never leaks into the shared UI barrel chunk.
export type { WovenLightHeroProps } from "./woven-light-hero"

export { ScrollExpandMedia }    from "./scroll-expansion-hero"
export type { ScrollExpandMediaProps } from "./scroll-expansion-hero"

export { FlowArt, FlowSection } from "./story-scroll"
export type { FlowArtProps, FlowSectionProps } from "./story-scroll"



