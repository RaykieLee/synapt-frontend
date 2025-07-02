import { apiRequest } from '@/lib/api'
import { 
  VirtualInfo, 
  VirtualInfoCreateDto, 
  VirtualInfoUpdateDto, 
  VirtualInfoQuery, 
  VirtualInfoList 
} from '@/types/encrypt/virtual-info'

export const virtualInfoAPI = {
  // 获取虚拟信息列表
  getList: (params: VirtualInfoQuery) => 
    apiRequest<VirtualInfoList>("/api/v1/encrypt/virtual-info/list", "POST", params),
  
  // 获取虚拟信息详情
  getDetail: (id: string) => 
    apiRequest<VirtualInfo>(`/api/v1/encrypt/virtual-info/${id}`, "GET"),
  
  // 创建虚拟信息
  create: (data: VirtualInfoCreateDto) => 
    apiRequest<VirtualInfo>("/api/v1/encrypt/virtual-info/create", "POST", data),
  
  // 更新虚拟信息
  update: (id: string, data: VirtualInfoUpdateDto) => 
    apiRequest<VirtualInfo>(`/api/v1/encrypt/virtual-info/${id}`, "PUT", data),
  
  // 删除虚拟信息
  delete: (id: string) => 
    apiRequest(`/api/v1/encrypt/virtual-info/${id}`, "DELETE"),
  
  // 批量删除虚拟信息
  batchDelete: (data: { ids: string[] }) => 
    apiRequest("/api/v1/encrypt/virtual-info/batch-delete", "POST", data),
  
  // 验证用户名唯一性
  validateUsername: (username: string, excludeId?: string) => 
    apiRequest<boolean>(`/api/v1/encrypt/virtual-info/validate/username/${username}${excludeId ? `?exclude_id=${excludeId}` : ''}`, "GET"),
  
  // 验证邮箱唯一性
  validateEmail: (email: string, excludeId?: string) => 
    apiRequest<boolean>(`/api/v1/encrypt/virtual-info/validate/email/${email}${excludeId ? `?exclude_id=${excludeId}` : ''}`, "GET"),
} 