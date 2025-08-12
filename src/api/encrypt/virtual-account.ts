import { apiRequest } from '@/lib/api'
import { 
  VirtualAccount,
  VirtualAccountCreateDto,
  VirtualAccountUpdateDto,
  VirtualAccountQuery,
  VirtualAccountList
} from '@/types/encrypt/virtual-account'

export const virtualAccountAPI = {
  // 列表
  getList: (params: VirtualAccountQuery) =>
    apiRequest<VirtualAccountList>('/api/v1/encrypt/virtual-accounts/list', 'POST', params),

  // 详情
  getDetail: (id: string) =>
    apiRequest<VirtualAccount>(`/api/v1/encrypt/virtual-accounts/${id}`, 'GET'),

  // 创建
  create: (data: VirtualAccountCreateDto) =>
    apiRequest<VirtualAccount>('/api/v1/encrypt/virtual-accounts/create', 'POST', data),

  // 更新
  update: (id: string, data: VirtualAccountUpdateDto) =>
    apiRequest<VirtualAccount>(`/api/v1/encrypt/virtual-accounts/${id}`, 'PUT', data),

  // 删除
  delete: (id: string) =>
    apiRequest(`/api/v1/encrypt/virtual-accounts/${id}`, 'DELETE'),

  // 批量删除
  batchDelete: (data: { ids: string[] }) =>
    apiRequest('/api/v1/encrypt/virtual-accounts/batch-delete', 'POST', data)
}
