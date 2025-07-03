import { apiRequest } from '@/lib/api'
import { 
  ProjectManagement, 
  ProjectManagementCreateDto, 
  ProjectManagementUpdateDto, 
  ProjectManagementQuery, 
  ProjectManagementList 
} from '@/types/encrypt/project-management'

export const projectManagementAPI = {
  // 获取项目管理列表
  getList: (params: ProjectManagementQuery) => 
    apiRequest<ProjectManagementList>("/api/v1/encrypt/project-management/list", "POST", params),
  
  // 获取项目管理详情
  getDetail: (id: string) => 
    apiRequest<ProjectManagement>(`/api/v1/encrypt/project-management/${id}`, "GET"),
  
  // 创建项目管理
  create: (data: ProjectManagementCreateDto) => 
    apiRequest<ProjectManagement>("/api/v1/encrypt/project-management/create", "POST", data),
  
  // 更新项目管理
  update: (id: string, data: ProjectManagementUpdateDto) => 
    apiRequest<ProjectManagement>(`/api/v1/encrypt/project-management/${id}`, "PUT", data),
  
  // 删除项目管理
  delete: (id: string) => 
    apiRequest(`/api/v1/encrypt/project-management/${id}`, "DELETE"),
  
  // 批量删除项目管理
  batchDelete: (data: { ids: string[] }) => 
    apiRequest("/api/v1/encrypt/project-management/batch-delete", "POST", data),
  
  // 验证项目编号唯一性
  validateProjectCode: (projectCode: string, excludeId?: string) => 
    apiRequest<boolean>(`/api/v1/encrypt/project-management/validate/project-code/${projectCode}${excludeId ? `?exclude_id=${excludeId}` : ''}`, "GET"),
  
  // 验证项目名称唯一性
  validateProjectName: (projectName: string, excludeId?: string) => 
    apiRequest<boolean>(`/api/v1/encrypt/project-management/validate/project-name/${projectName}${excludeId ? `?exclude_id=${excludeId}` : ''}`, "GET"),
} 