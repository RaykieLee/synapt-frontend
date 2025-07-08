/**
 * 浏览器环境管理API接口
 */
import { apiRequest } from '@/lib/api'
import type {
  BrowserEnvironment,
  BrowserEnvironmentFormData,
  BrowserEnvironmentQuery,
  BrowserEnvironmentListResponse
} from '@/types/encrypt/browser-environment'

// API路径常量
const API_PREFIX = '/api/v1/encrypt/browser-environment'

export const browserEnvironmentAPI = {
  /**
   * 获取浏览器环境列表
   */
  getList: (params: BrowserEnvironmentQuery) =>
    apiRequest<BrowserEnvironmentListResponse>(`${API_PREFIX}/list`, 'POST', params),

  /**
   * 获取浏览器环境详情
   */
  getDetail: (id: string) =>
    apiRequest<BrowserEnvironment>(`${API_PREFIX}/${id}`, 'GET'),

  /**
   * 创建浏览器环境
   */
  create: (data: BrowserEnvironmentFormData) =>
    apiRequest<BrowserEnvironment>(`${API_PREFIX}/create`, 'POST', data),

  /**
   * 更新浏览器环境
   */
  update: (id: string, data: Partial<BrowserEnvironmentFormData>) =>
    apiRequest<BrowserEnvironment>(`${API_PREFIX}/${id}`, 'PUT', data),

  /**
   * 删除浏览器环境
   */
  delete: (id: string) =>
    apiRequest(`${API_PREFIX}/${id}`, 'DELETE'),

  /**
   * 批量删除浏览器环境
   */
  batchDelete: (data: { ids: string[] }) =>
    apiRequest<{ deleted_count: number }>(`${API_PREFIX}/batch-delete`, 'POST', data),

  /**
   * 验证环境名称唯一性
   */
  validateName: (name: string, excludeId?: string) =>
    apiRequest<boolean>(`${API_PREFIX}/validate/name/${encodeURIComponent(name)}`, 'GET', undefined, {
      params: excludeId ? { exclude_id: excludeId } : undefined
    }),

  /**
   * 验证浏览器实例ID唯一性
   */
  validateBrowserId: (browserId: string, excludeId?: string) =>
    apiRequest<boolean>(`${API_PREFIX}/validate/browser-id/${encodeURIComponent(browserId)}`, 'GET', undefined, {
      params: excludeId ? { exclude_id: excludeId } : undefined
    }),

  /**
   * 根据浏览器类型获取环境列表
   */
  getByType: (browserType: string) =>
    apiRequest<BrowserEnvironment[]>(`${API_PREFIX}/by-type/${encodeURIComponent(browserType)}`, 'GET'),

  /**
   * 更新最后使用时间
   */
  updateLastUsed: (id: string) =>
    apiRequest(`${API_PREFIX}/${id}/last-used`, 'PATCH'),

  /**
   * 创建浏览器环境并调用第三方API
   */
  createWithApi: (data: BrowserEnvironmentFormData) =>
    apiRequest<BrowserEnvironment>(`${API_PREFIX}/create-with-api`, 'POST', data),

  /**
   * 启动浏览器环境
   */
  start: (id: string) =>
    apiRequest(`${API_PREFIX}/${id}/start`, 'POST'),

  /**
   * 停止浏览器环境
   */
  stop: (id: string) =>
    apiRequest(`${API_PREFIX}/${id}/stop`, 'POST'),

  /**
   * 删除浏览器环境并调用第三方API
   */
  deleteWithApi: (id: string) =>
    apiRequest(`${API_PREFIX}/${id}/with-api`, 'DELETE'),

  /**
   * 获取HubStudio环境列表
   */
  getHubStudioEnvironments: () =>
    apiRequest<Array<{
      container_code: string
      container_name: string
      tag_name: string
      remark: string
      create_time: string
      status: string
      core_version: number
    }>>(`${API_PREFIX}/hubstudio/environments`, 'GET'),

  /**
   * 同步HubStudio环境到数据库
   */
  syncHubStudioEnvironments: (data: { container_codes: string[] }) =>
    apiRequest<{
      synced_count: number
      skipped_count: number
      error_count: number
      errors: string[]
      total_requested: number
    }>(`${API_PREFIX}/hubstudio/sync`, 'POST', data),

  /**
   * 同步环境到浏览器（为未同步的环境创建远程实例）
   */
  syncToBrowser: (id: string) =>
    apiRequest<BrowserEnvironment>(`${API_PREFIX}/${id}/sync-to-browser`, 'POST')
} 