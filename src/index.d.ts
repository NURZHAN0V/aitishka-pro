export interface CategoryRef {
  slug: string
  name: string
}

export interface PostSummary {
  id: string
  slug: string
  title: string
  description: string
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

export interface Video {
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
}

export interface Subcategory {
  slug: string
  name: string
}

export interface Category {
  slug: string
  name: string
  subcategories: Subcategory[]
}

export interface Taxonomy {
  categories: Category[]
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
  contact: {
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
