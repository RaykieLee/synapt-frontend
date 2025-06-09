import { apiRequest } from "@/lib/api";
import { User, UserCreateDto, UserQuery, UserUpdateDto } from "@/types/user";

// 新版本用户列表响应
interface UserListResponse {
  rows: User[];
  total: number;
  page_num: number;
  page_size: number;
  pages: number;
}

export const userApi = {
  // 获取用户列表
  getList: (params: UserQuery = {}) => {
    return apiRequest<UserListResponse>("/api/v1/system/users/list", "POST", params);
  },
  
  // 获取用户详情
  getDetail: (userId: number) => apiRequest<User>(`/api/v1/system/users/${userId}`),
  
  // 创建用户
  create: (user: UserCreateDto) => apiRequest<any>("/api/v1/system/users/create", "POST", user),
  
  // 更新用户
  update: (userId: number, user: UserUpdateDto) => 
    apiRequest<any>(`/api/v1/system/users/${userId}`, "PUT", user),
  
  // 删除用户
  delete: (userId: number) => apiRequest<any>(`/api/v1/system/users/${userId}`, "DELETE"),

  // 检查用户名是否已存在
  checkUsername: (username: string, userId?: number) => 
    apiRequest<boolean>(`/api/v1/system/users/check-username/${username}${userId ? `?user_id=${userId}` : ''}`, "GET"),

  // 批量删除用户
  batchDelete: (userIds: number[]) => 
    apiRequest<any>(`/api/v1/system/users/batch/${userIds.join(',')}`, "DELETE"),

  // 重置密码
  resetPassword: (userId: number, newPassword: string) => 
    apiRequest<any>(`/api/v1/system/users/${userId}/reset-password?new_password=${newPassword}`, "PUT"),

  // 获取可分配角色列表
  getRoles: () => apiRequest<any[]>("/api/v1/system/roles/actions/optionselect")
}; 