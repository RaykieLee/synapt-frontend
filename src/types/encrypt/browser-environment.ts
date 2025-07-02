/**
 * 浏览器环境管理类型定义
 */

// 基础接口
export interface BrowserEnvironment {
  id: string
  name: string
  browser_type: string
  browser_id?: string
  proxy_id?: string
  status?: string
  last_used?: string
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
}

// 创建/编辑表单接口
export interface BrowserEnvironmentFormData {
  name: string
  browser_type: string
  browser_id?: string
  proxy_id?: string
  status?: string
  remark?: string
}

// 搜索参数接口
export interface BrowserEnvironmentSearchParams {
  name?: string
  browser_type?: string
  browser_id?: string
  status?: string
  search_mode?: 'and' | 'or'
}

// 查询关键词接口
export interface BrowserEnvironmentKeywords {
  name?: string
  browser_type?: string
  browser_id?: string
  status?: string
}

// 查询参数接口
export interface BrowserEnvironmentParams {
  keywords?: BrowserEnvironmentKeywords
  browser_type?: string
  status?: string
  search_mode?: 'and' | 'or'
}

// 列表查询接口
export interface BrowserEnvironmentQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{ field: string; order: 'asc' | 'desc' }>
  params?: BrowserEnvironmentParams
}

// 列表响应接口
export interface BrowserEnvironmentListResponse {
  total: number
  list: BrowserEnvironment[]
  page_num: number
  page_size: number
  pages: number
}

// 浏览器类型选项
export const BROWSER_TYPE_OPTIONS = [
  { label: 'MoreLogin', value: 'MoreLogin' },
  { label: 'HubStudio', value: 'HubStudio' }
] as const

// 状态选项
export const STATUS_OPTIONS = [
  { label: '活跃', value: 'active' },
  { label: '空闲', value: 'idle' },
  { label: '停止', value: 'stopped' },
  { label: '错误', value: 'error' }
] as const

// 状态颜色映射
export const STATUS_COLORS = {
  active: 'green',
  idle: 'blue', 
  stopped: 'gray',
  error: 'red'
} as const 