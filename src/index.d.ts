export interface CategoryRef {
  slug: string
  name: string
}

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface PostMeta {
  description: string
  tags?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

export interface PostSummary {
  id: string
  slug: string
  title: string
  meta: PostMeta
  cover: string
  category: CategoryRef
  subcategory: CategoryRef
  url: string
  publishedAt?: string
  views: number
}

export interface Post extends PostSummary {
  body: string
}

export interface VideoItem {
  id: string
  slug: string
  title: string
  excerpt: string
  embedUrl: string
  thumbnailUrl: string
  duration: string
  category: string
  views: number
  publishedAt?: string
  order?: number
}

export interface VideoPlaylistRef {
  id: string
  slug: string
  title: string
  order: number
}

export interface Video extends VideoItem {
  playlist?: VideoPlaylistRef
}

export interface VideoPlaylist {
  id: string
  slug: string
  title: string
  description?: string
  thumbnailUrl?: string
  publishedAt?: string
  videos: VideoItem[]
}

export interface VideoCatalog {
  playlists: VideoPlaylist[]
  videos: VideoItem[]
}

export interface Subcategory {
  slug: string
  name: string
  subcategories?: Subcategory[]
}

export interface Category {
  slug: string
  name: string
  subcategories: Subcategory[]
}

export interface Taxonomy {
  categories: Category[]
}

export interface VideoTaxonomy {
  categories: CategoryRef[]
}

export interface NavSubItem {
  label: string
  to: string
  children?: NavSubItem[]
}

export interface NavItem {
  label: string
  to: string
  children?: NavSubItem[]
}

export interface Benefit {
  title: string
  text: string
  icon: string
  link?: string
  linkText?: string
  external?: boolean
}

export interface Technology {
  id: string
  label: string
  to: string
  color: string
  hoverColor: string
  textColor?: string
}

export interface Feature {
  title: string
  text: string
  icon: string
}

export interface TestQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export type SkillId = 'git' | 'css' | 'html' | 'python' | 'javascript' | 'typescript' | 'nodejs'

export interface SiteConfig {
  title: string
  url: string
  description: string
  navigation: NavItem[]
  benefits: Benefit[]
  technologies: Technology[]
  about: {
    title: string
    lead: string
    paragraphs: string[]
    features: Feature[]
  }
  media: {
    title: string
    lead: string
  }
  contact: {
    lead: string
    phone: string
    email: string
    address: string
    social: { label: string, url: string, icon: string }[]
  }
  news: {
    title: string
    lead: string
  }
  testQuestions: Record<SkillId, TestQuestion[]>
  skillLabels: Record<SkillId, string>
}

export interface BuildInfo {
  date: string
  version: string
}
