// 项目管理类型定义

export interface ProjectManagement {
  id: string
  project_code?: string
  project_name: string
  logo_url?: string
  official_website?: string
  support_chain?: string
  sector?: string
  track?: string
  has_token?: string
  current_status?: string
  twitter_followers?: number
  financing_amount?: string
  project_description?: string
  detailed_description?: string
  participation_points?: string
  profit_summary?: string
  status?: string
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  deleted?: string
}

export interface ProjectManagementCreateDto {
  project_code?: string
  project_name: string
  logo_url?: string
  official_website?: string
  support_chain?: string
  sector?: string
  track?: string
  has_token?: string
  current_status?: string
  twitter_followers?: number
  financing_amount?: string
  project_description?: string
  participation_points?: string
  profit_summary?: string
  status?: string
  remark?: string
}

export interface ProjectManagementUpdateDto {
  project_code?: string
  project_name?: string
  logo_url?: string
  official_website?: string
  support_chain?: string
  sector?: string
  track?: string
  has_token?: string
  current_status?: string
  twitter_followers?: number
  financing_amount?: string
  project_description?: string
  participation_points?: string
  profit_summary?: string
  status?: string
  remark?: string
}

export interface ProjectManagementSearchParams {
  keywords?: {
    project_name?: string
    project_code?: string
    sector?: string
    track?: string
    support_chain?: string
  }
  current_status?: string
  has_token?: string
}

export interface ProjectManagementQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{ field: string; order: 'asc' | 'desc' }>
  params?: {
    keywords?: {
      project_code?: string
      project_name?: string
      sector?: string
      track?: string
      support_chain?: string
    }
    has_token?: string
    current_status?: string
    status?: string
    search_mode?: 'and' | 'or'
  }
}

export interface ProjectManagementList {
  total: number
  list: ProjectManagement[]
  page_num: number
  page_size: number
  pages: number
} 