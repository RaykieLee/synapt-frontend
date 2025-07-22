/**
 * LLM配置模块相关类型定义
 */

// ========== LLM配置相关类型 ==========

// LLM配置基础接口
export interface LLMConfig {
  id: string
  config_name: string
  provider: string
  model_name: string
  api_key: string
  base_url?: string
  max_tokens?: number
  temperature?: number
  timeout?: number
  max_retries?: number
  description?: string
  status: string
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  deleted?: string
}

// LLM配置创建参数
export interface LLMConfigCreateDto {
  config_name: string
  provider: string
  model_name: string
  api_key: string
  base_url?: string
  max_tokens?: number
  temperature?: number
  timeout?: number
  max_retries?: number
  description?: string
  status?: string
  remark?: string
}

// LLM配置更新参数
export interface LLMConfigUpdateDto {
  config_name?: string
  provider?: string
  model_name?: string
  api_key?: string
  base_url?: string
  max_tokens?: number
  temperature?: number
  timeout?: number
  max_retries?: number
  description?: string
  status?: string
  remark?: string
}

// LLM配置查询参数
export interface LLMConfigQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  params?: {
    keywords?: {
      config_name?: string
      provider?: string
      model_name?: string
    }
    status?: string
    search_mode?: 'and' | 'or'
  }
}

// ========== 搜索参数接口 ==========

// LLM配置搜索参数接口
export interface LLMConfigSearchParams {
  config_name?: string
  provider?: string
  model_name?: string
  status?: string
  search_mode?: 'and' | 'or'
}

// ========== 响应类型 ==========

// 列表响应
export interface LLMConfigListResponse {
  list: LLMConfig[]
  total: number
  page_num: number
  page_size: number
  pages: number
}