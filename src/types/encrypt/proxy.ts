/**
 * 代理管理类型定义
 */

export interface ProxyEntity {
  id: string
  proxy_type: string
  host: string
  port: number
  username?: string
  password?: string
  status?: string
  group?: string
  last_check?: string
  check_result?: any
  is_active: boolean
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  remark?: string
  deleted?: string
}

export interface ProxySearchParams {
  host?: string
  proxy_type?: string
  username?: string
  group?: string
  status?: string
  is_active?: boolean
  search_mode?: 'and' | 'or'
}

export interface ProxyQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{ field: string; order: 'asc' | 'desc' }>
  params?: {
    keywords?: {
      host?: string
      proxy_type?: string
      username?: string
      group?: string
    }
    proxy_type?: string
    status?: string
    group?: string
    is_active?: boolean
    search_mode?: 'and' | 'or'
  }
}

export interface ProxyCreateDto {
  proxy_type: string
  host: string
  port: number
  username?: string
  password?: string
  status?: string
  group?: string
  is_active?: boolean
  remark?: string
}

export interface ProxyUpdateDto {
  proxy_type?: string
  host?: string
  port?: number
  username?: string
  password?: string
  status?: string
  group?: string
  is_active?: boolean
  remark?: string
}

export interface PageResult<T> {
  total: number
  list: T[]
  page_num: number
  page_size: number
  pages: number
} 