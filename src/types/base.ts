export interface BaseQuery {
  page_num?: number
  page_size?: number
  order_by_column?: string
  is_asc?: 'asc' | 'desc'
}

export interface BaseResponse<T> {
  code: number
  msg: string
  data: T
}

// 分页结果接口
export interface PageResult<T> {
  list: T[]
  total: number
  page_num: number
  page_size: number
  pages: number
} 