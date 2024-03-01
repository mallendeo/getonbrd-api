export interface Job {
  id: number
  title: string
  description_headline: string
  recommended: boolean
  pinned: boolean
  is_hot: boolean
  salary: string
  user_id: number
  hiring_company: string
  hiring_organization: string
  remote_modality: string
  remote_zone: string | unknown
  hidden: boolean
  github_required: boolean
  linkedin_required: boolean
  portfolio_required: boolean
  allows_quick_apply: boolean
  salary_type: string
  remote: boolean
  temporarily_remote: boolean
  remote_local: boolean
  hybrid: boolean
  city: string | unknown
  country: {
    [key: string]: string
  }
}

export interface JobSearchMeta {
  jobs_offset: number
  jobs_count: number
  reset_results: boolean
  jobs_limit: number
  preferences: {
    category_ids: number[]
    tag_ids: number[]
    tenant_ids: number[]
    modality_ids: number[]
    companies_blacklist_ids: number[]
    seniority_ids: number[]
    following_company_ids: number[]
    min_salary: number | null
    max_salary: number | null
    remote_jobs: boolean
  }
}

export interface JobData {
  url: string
  title: string
  level: string
  type: string
  area: string
  date: string
  description: string
  applications?: [string, number, number?]
  repliesIn?: [string, number, number?]
  lastChecked?: [string, number]
  requiresApplyingIn?: string
  location: {
    modality?: string
    place?: string
  }
  company: {
    slug: string
    name: string
    logo: string
  }
  tags?: string[]
  salary?: {
    type: string
    min: number
    max: number
    unit: string
    currency: string
  }
}
