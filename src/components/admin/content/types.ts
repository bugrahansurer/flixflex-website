export interface AdminServiceOption {
  id: string
  title: string
  slug: string
  isPublished: boolean
}

export interface AdminPortfolioRecord {
  id: string
  title: string
  slug: string
  client: string | null
  clientLogo: string | null
  category: string
  description: string | null
  content?: string | null
  coverImage: string
  images: string[]
  tags: string[]
  results?: unknown
  gradient: string
  accentColor: string
  tall: boolean
  narrativeParagraphs?: unknown
  sidebarItems?: unknown
  resultStats?: unknown
  year: number | null
  isPublished: boolean
  order: number
  services?: AdminServiceOption[]
}

export interface AdminServiceRecord {
  id: string
  title: string
  slug: string
  description: string
  body: string
  icon: string
  features: string[]
  processSteps: unknown
  deliverables: string[]
  isPublished: boolean
  order: number
  metaTitle?: string | null
  metaDescription?: string | null
  parentId?: string | null
  coverImage?: string | null
  accentColor?: string | null
  gradient?: string | null
  motionDesign?: string | null
  children?: AdminServiceRecord[]
  parent?: { id: string; title: string } | null
  portfolios?: AdminPortfolioRecord[]
}
