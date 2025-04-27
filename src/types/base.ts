export interface BaseQuery {
  page?: number
  page_size?: number
  order_by?: string
  order?: 'asc' | 'desc'
}

export interface BaseResponse<T> {
  code: number
  msg: string
  data: T
  total: number
}

// 分页结果接口
export interface PageResult<T> {
  rows: T[]
  total: number
  pageNum: number
  pageSize: number
} 