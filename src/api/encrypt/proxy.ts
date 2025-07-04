/**
 * 代理管理API接口
 */
import { apiRequest } from "@/lib/api"
import { 
  ProxyEntity, 
  ProxyQuery, 
  ProxyCreateDto, 
  ProxyUpdateDto,
  PageResult,
  ProxyBatchImportDto,
  ProxyBatchImportResult,
  ProxyCheckRequest,
  ProxyBatchCheckResult,
  ProxyCheckResult
} from "@/types/encrypt/proxy"

export const proxyAPI = {
  /**
   * 获取代理列表
   */
  getList: (params: ProxyQuery): Promise<PageResult<ProxyEntity>> =>
    apiRequest("/api/v1/encrypt/proxy/list", "POST", params),

  /**
   * 获取代理详情
   */
  getDetail: (id: string): Promise<ProxyEntity> =>
    apiRequest(`/api/v1/encrypt/proxy/${id}`, "GET"),

  /**
   * 创建代理
   */
  create: (data: ProxyCreateDto): Promise<ProxyEntity> =>
    apiRequest("/api/v1/encrypt/proxy", "POST", data),

  /**
   * 更新代理
   */
  update: (id: string, data: ProxyUpdateDto): Promise<ProxyEntity> =>
    apiRequest(`/api/v1/encrypt/proxy/${id}`, "PUT", data),

  /**
   * 删除代理
   */
  delete: (id: string): Promise<void> =>
    apiRequest(`/api/v1/encrypt/proxy/${id}`, "DELETE"),

  /**
   * 批量删除代理
   */
  batchDelete: (data: { ids: string[] }): Promise<{ deleted_count: number }> =>
    apiRequest("/api/v1/encrypt/proxy/batch-delete", "POST", data),

  /**
   * 检测代理连通性
   */
  checkProxy: (id: string): Promise<ProxyEntity> =>
    apiRequest(`/api/v1/encrypt/proxy/${id}/check`, "POST"),

  /**
   * 获取代理类型选项
   */
  getProxyTypes: (): Promise<Array<{ label: string; value: string }>> =>
    Promise.resolve([
      { label: 'HTTP', value: 'http' },
      { label: 'HTTPS', value: 'https' },
      { label: 'SOCKS4', value: 'socks4' },
      { label: 'SOCKS5', value: 'socks5' },
    ]),

  /**
   * 获取代理状态选项
   */
  getStatusOptions: (): Promise<Array<{ label: string; value: string }>> =>
    Promise.resolve([
      { label: '正常', value: 'normal' },
      { label: '异常', value: 'error' },
      { label: '未检测', value: 'unknown' },
    ]),

  /**
   * 批量导入代理
   */
  batchImport: (data: ProxyBatchImportDto): Promise<ProxyBatchImportResult> =>
    apiRequest("/api/v1/encrypt/proxy/batch-import", "POST", data),

  /**
   * 批量检测代理
   */
  batchCheck: (data: ProxyCheckRequest): Promise<ProxyBatchCheckResult> =>
    apiRequest("/api/v1/encrypt/proxy/batch-check", "POST", data),

  /**
   * 检测单个代理（新版本，返回详细结果）
   */
  checkSingleProxy: (id: string, timeout: number = 10): Promise<ProxyCheckResult> =>
    apiRequest(`/api/v1/encrypt/proxy/${id}/check-single`, "POST", { timeout }),
} 