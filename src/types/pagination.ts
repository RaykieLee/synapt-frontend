/**
 * 分页查询返回结果
 */
export interface PaginationResult<T> {
  rows: T[];
  total: number;
}

/**
 * 分页查询参数
 */
export interface PaginationQuery {
  pageNum?: number;
  pageSize?: number;
} 