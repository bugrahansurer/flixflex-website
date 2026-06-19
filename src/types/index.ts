// ═══════════════════════════════════════════════════════════
// FlixFlex — Global TypeScript Types
// ═══════════════════════════════════════════════════════════

// ── Navigation ────────────────────────────────────
export interface NavLink {
  label:    string
  href:     string
  external?: boolean
  children?: NavLink[]
}

// ── Blog ──────────────────────────────────────────
export type BlogTemplate = "classic" | "editorial" | "visual"
export type ContentStatus = "draft" | "published"

export interface BlogPost {
  id:          string
  title:       string
  slug:        string
  excerpt?:    string
  content:     string
  coverImage?: string
  template:    BlogTemplate
  category?:   string
  tags:        string[]
  readTime:    number
  author?:     string
  aiGenerated: boolean
  status:      ContentStatus
  publishedAt?: string | null
  metaTitle?:       string
  metaDescription?: string
  ogImage?:         string
  createdAt:   string
  updatedAt:   string
}

// ── Page Builder ──────────────────────────────────
export type SectionType =
  | "hero"
  | "stats"
  | "services"
  | "portfolio"
  | "testimonials"
  | "cta"
  | "text-content"
  | "image-text"
  | "video-embed"
  | "faq"
  | "team"
  | "contact-form"
  | "blog-grid"
  | "spacer"
  | "appointment-card"


export interface SectionBlock {
  id:      string
  type:    SectionType
  order:   number
  visible: boolean
  props:   Record<string, unknown>
}

export interface PageData {
  id:          string
  slug:        string
  title:       string
  description?: string
  sections:    SectionBlock[]
  isPublished: boolean
  publishedAt?: string | null
  metaTitle?:       string
  metaDescription?: string
  ogImage?:         string
  createdAt:   string
  updatedAt:   string
}

// ── Color Palette ─────────────────────────────────
export interface ColorTokens {
  primary:        string
  primaryHover:   string
  primaryMuted:   string
  secondary:      string
  secondaryLight: string
  background:     string
  surface:        string
  foreground:     string
  muted:          string
  border:         string
  dark: {
    background: string
    surface:    string
    foreground: string
    muted:      string
    border:     string
  }
  success: string
  warning: string
  error:   string
  info:    string
}

export interface ColorPalette {
  id:          string
  name:        string
  isActive:    boolean
  isSystem:    boolean
  colors:      ColorTokens
  fontDisplay: string
  fontBody:    string
  createdAt:   string
  updatedAt:   string
}

// ── Portfolio ─────────────────────────────────────
export type PortfolioCategory = "Marketing" | "Branding" | "Web" | "Content" | "All"

export interface PortfolioResult {
  metric: string
  value:  string
}

export interface PortfolioItem {
  id:          string
  title:       string
  slug:        string
  client?:     string
  category:    PortfolioCategory
  description?: string
  content?:    string
  coverImage:  string
  images:      string[]
  tags:        string[]
  results?:    PortfolioResult[]
  year?:       number
  isPublished: boolean
  order:       number
  createdAt:   string
  updatedAt:   string
}

// ── RBAC ──────────────────────────────────────────
export type ResourceType =
  | "blog"
  | "pages"
  | "colors"
  | "roles"
  | "users"
  | "settings"
  | "ai"
  | "media"
  | "portfolio"

export type ActionType =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "manage"

export interface Permission {
  id:       string
  resource: ResourceType
  action:   ActionType
  scope?:   string
}

export interface Role {
  id:          string
  name:        string
  description?: string
  isSystem:    boolean
  permissions: Permission[]
  _count?: {
    users: number
  }
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id:        string
  email:     string
  name?:     string
  image?:    string
  isActive:  boolean
  lastLogin?: string
  role:      Role
  roleId:    string
  createdAt: string
}

// ── AI Blog Engine ────────────────────────────────
export interface AIBlogTitle {
  title:    string
  category: string
  why:      string // AI'nın bu başlığı neden önerdiği
}

export interface AIOutlineSection {
  heading:     string
  subheadings: string[]
  notes:       string
}

export interface AIBlogOutline {
  outline:         AIOutlineSection[]
  keyPoints:       string[]
  targetKeywords:  string[]
  estimatedReadTime: number
}

export interface AIImagePlacement {
  position:    string // "after-intro" | "middle" | "before-conclusion"
  description: string
  alt:         string
  url?:        string // Generated URL
}

// ── Forms ─────────────────────────────────────────
export interface ContactFormData {
  name:    string
  email:   string
  company?: string
  service?: string
  message: string
}

// ── API Responses ─────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  error?:  string
  message?: string
}

export interface PaginatedResponse<T> {
  items:      T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

// ── Site Settings ─────────────────────────────────
export interface SiteSettings {
  siteName:    string
  siteTagline: string
  siteUrl:     string
  logo?:       string
  favicon?:    string
  email:       string
  phone?:      string
  address?:    string
  social: {
    twitter?:   string
    instagram?: string
    linkedin?:  string
    youtube?:   string
  }
  analytics?: {
    googleId?: string
  }
}
