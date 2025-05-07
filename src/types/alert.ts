// 告警类别
export interface AlertCategory {
  category_id: number
  code: string
  name: string
  description?: string
  enabled: boolean
  status: string
  order_num?: number
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
}

// 告警配置
export interface AlertConfig {
  id: number
  code: string
  name: string
  description?: string
  threshold?: string
  frequency?: number
  status: string
  remark?: string
  categories: AlertCategory[]
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
}

// 告警类别查询参数
export interface AlertCategoryQuery {
  page_num?: number
  page_size?: number
  name?: string
  code?: string
  status?: string
}

// 创建告警类别请求
export interface AlertCategoryCreateDto {
  code: string
  name: string
  description?: string
  enabled?: boolean
  status?: string
  order_num?: number
  remark?: string
}

// 更新告警类别请求
export interface AlertCategoryUpdateDto {
  code?: string
  name?: string
  description?: string
  enabled?: boolean
  status?: string
  order_num?: number
  remark?: string
}

// 创建告警配置请求
export interface AlertConfigCreateDto {
  code: string
  name: string
  description?: string
  threshold?: string
  frequency?: number
  status?: string
  remark?: string
  category_ids?: number[]
}

// 更新告警配置请求
export interface AlertConfigUpdateDto {
  code?: string
  name?: string
  description?: string
  threshold?: string
  frequency?: number
  status?: string
  remark?: string
  category_ids?: number[]
}

// 告警配置查询参数
export interface AlertConfigQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  params?: {
    keywords?: {
      name?: string
      code?: string
    }
    status?: string
    category_id?: number
    time_range?: {
      create_time?: {
        start?: string
        end?: string
      }
      update_time?: {
        start?: string
        end?: string
      }
    }
    search_mode?: 'and' | 'or'
  }
} 