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