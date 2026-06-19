// ═══════════════════════════════════════════════════════════
// FlixFlex Public Site — Barrel Export
// ═══════════════════════════════════════════════════════════

export { FlixFlexNavbar }     from "./navbar"
export { FlixFlexLogo }       from "./navbar/logo"
export { NAV_LINKS }          from "./navbar/nav-data"
export type { NavLink }       from "./navbar/nav-data"

export { FlixFlexFooter }     from "./footer"

export { HeroSection, HeroVideoSection, AnimatedVideoHero, VideoHeroProvider, useVideoHero } from "./hero"
export { StoryScroll } from "./story-scroll"
export { ParallaxProvider } from "./parallax-provider"
export { ParallaxScrolling } from "./parallax-scrolling"
export { ScrollAnimation } from "./scroll-animation"
export { ContainerTextScroll } from "./container-text-scroll"
export { StatsSection }       from "./sections/stats-section"
export { BrandStorySection }  from "./sections/brand-story"
export { ServicesSection }      from "./sections/services-section"
export { ServiceCard }          from "./sections/service-card"
export { SubServiceRow }        from "./sections/sub-service-row"
export { SERVICES }             from "./sections/services-data"
export type { Service, SubServiceItem } from "./sections/services-data"
export { TestimonialsSection }  from "./sections/testimonials-section"
export { CTASection }           from "./sections/cta-section"
export type { CTASectionProps } from "./sections/cta-section"
export { PortfolioSection }     from "./sections/portfolio-section"
export { PortfolioVerticalScrollSection } from "./sections/portfolio-vertical-scroll"
export { TextContentSection }  from "./sections/text-content-section"
export { ImageTextSection }    from "./sections/image-text-section"
export { VideoEmbedSection }   from "./sections/video-embed-section"
export { PORTFOLIO, PORTFOLIO_CATEGORIES } from "./sections/portfolio-data"
export type { PortfolioItem, PortfolioCategory } from "./sections/portfolio-data"

// ── Services detail components ────────────────────────────
export { ProcessSteps }         from "./services/process-steps"
export { DeliverablesGrid }     from "./services/deliverables-grid"
export { ServiceHeroVisual }    from "./services/service-hero-visual"
export { ServiceCta }           from "./services/service-cta"
export { ServiceListCard }      from "./services/service-list-card"
export { ServicesListAnimated } from "./services/services-list-animated"
export { CaseStudyTeaser }      from "./services/case-study-teaser"
export type { ProcessStep }     from "./sections/services-data"

// ── About page sections ───────────────────────────────────
export { ManifestoSection, StorySection, ValuesSection, TeamSection, WhyUsSection } from "./about"
export { VALUES, TEAM, DIFFERENTIATORS } from "./about"
export type { Value, TeamMember, Differentiator } from "./about"

// ── Contact page components ───────────────────────────────
export { ContactForm }    from "./contact/contact-form"
export { ContactInfo }    from "./contact/contact-info"
export { SuccessMessage } from "./contact/success-message"

// ── Blog components ───────────────────────────────────────
export { BlogCard }           from "./blog/blog-card"
export { FeaturedPost }       from "./blog/featured-post"
export { BlogCategories }     from "./blog/blog-categories"
export { BlogShare }          from "./blog/blog-share"
export { RelatedPosts }       from "./blog/related-posts"
export { ReadingProgressBar } from "./blog/reading-progress-bar"
export { MarkdownRenderer }   from "./blog/markdown-renderer"
export { BlogListClient }     from "./blog/blog-list-client"
export { BlogTemplateClassic }   from "./blog/templates/blog-template-classic"
export { BlogTemplateEditorial } from "./blog/templates/blog-template-editorial"
export { BlogTemplateVisual }    from "./blog/templates/blog-template-visual"
export {
  POSTS,
  BLOG_CATEGORIES,
  getPost,
  getFeaturedPost,
  getRelatedPosts,
  getPostsByCategory,
}                             from "./blog/blog-data"
export type { BlogPost, BlogCategory } from "./blog/blog-data"

export { AppointmentModal } from "./appointment-modal"
export { AppointmentCardSection } from "./sections/appointment-card-section"
export { ModernManifestoSection } from "./sections/modern-manifesto"

