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