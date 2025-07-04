// 虚拟信息管理类型定义

export interface VirtualInfo {
  id: string
  user_id?: string
  gender?: string
  first?: string
  last?: string
  gmail?: string
  x?: string
  discord?: string
  email?: string
  phone?: string
  street_number?: string
  street_name?: string
  city?: string
  state?: string
  country?: string
  postcode?: string
  coordinates_latitude?: number
  coordinates_longitude?: number
  username?: string
  password?: string
  ssn?: string
  picture?: string
  nat?: string
  seed?: string
  wallet_word?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  status?: string
  remark?: string
  deleted?: string
}

export interface VirtualInfoCreateDto {
  user_id?: string
  gender?: string
  first?: string
  last?: string
  gmail?: string
  x?: string
  discord?: string
  email?: string
  phone?: string
  street_number?: string
  street_name?: string
  city?: string
  state?: string
  country?: string
  postcode?: string
  coordinates_latitude?: number
  coordinates_longitude?: number
  username?: string
  password?: string
  ssn?: string
  picture?: string
  nat?: string
  seed?: string
  wallet_word?: string
  status?: string
  remark?: string
}

export interface VirtualInfoUpdateDto extends VirtualInfoCreateDto {}

export interface VirtualInfoSearchParams {
  first?: string
  last?: string
  email?: string
  phone?: string
  city?: string
  username?: string
  user_id?: string
  gender?: string
  country?: string
  status?: string
  search_mode?: 'and' | 'or'
}

export interface VirtualInfoQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{ field: string; order: 'asc' | 'desc' }>
  params?: {
    keywords?: {
      first?: string
      last?: string
      email?: string
      phone?: string
      city?: string
      username?: string
    }
    user_id?: string
    gender?: string
    country?: string
    status?: string
    search_mode?: 'and' | 'or'
  }
}

export interface VirtualInfoList {
  total: number
  list: VirtualInfo[]
  page_num: number
  page_size: number
  pages: number
}

// ============= 新增：虚拟信息生成相关类型 =============

// 虚拟信息生成请求
export interface VirtualInfoGenerateRequest {
  count: number // 生成数量，1-50
  nationality: string // 国籍代码，如 "US"
  gender?: 'male' | 'female' // 性别
  use_proxy: boolean // 是否使用代理获取地理位置
  proxy_id?: string // 代理ID（use_proxy=true时必填）
  generate_wallet: boolean // 是否生成钱包助记词
  wallet_strength: 128 | 256 // 助记词强度（128=12词，256=24词）
}

// 单个虚拟信息生成结果
export interface VirtualInfoGenerateResult {
  success: boolean
  data?: Record<string, any>
  error?: string
}

// 批量虚拟信息生成结果
export interface VirtualInfoBatchGenerateResult {
  success_count: number
  failed_count: number
  total_count: number
  results: VirtualInfoGenerateResult[]
  errors: string[]
}

// 钱包生成请求
export interface WalletGenerateRequest {
  strength: 128 | 256 // 助记词强度（128=12词，256=24词）
}

// 钱包生成结果
export interface WalletGenerateResult {
  success: boolean
  mnemonic?: string
  word_count?: number
  seed?: string
  error?: string
}

// 钱包验证请求
export interface WalletVerifyRequest {
  mnemonic: string
}

// 钱包验证结果
export interface WalletVerifyResult {
  success: boolean
  word_count?: number
  error?: string
}

// 位置信息请求
export interface LocationRequest {
  proxy_id?: string
  ip?: string
}

// 位置信息结果
export interface LocationResult {
  success: boolean
  data?: {
    lat?: number
    lon?: number
    country?: string
    city?: string
    state?: string
    zip?: string
    street?: string
    isp?: string
    org?: string
    as?: string
    query?: string
  }
  error?: string
}

// 支持的国籍代码
export interface SupportedNationalities {
  codes: string[]
} 