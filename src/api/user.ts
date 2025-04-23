import { apiRequest } from "@/lib/api";
import { User, UserCreateDto, UserQuery, UserUpdateDto } from "@/types/user";
import { Role } from "@/types/role";

interface UserListResponse {
  rows: User[];
  total: number;
}

export const userApi = {
  // 获取用户列表
  getList: (params: UserQuery = {}) => {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");
    
    return apiRequest<UserListResponse>(`/api/v1/user/list${queryString ? `?${queryString}` : ""}`);
  },
  
  // 获取用户详情
  getDetail: (userId: number) => apiRequest<User>(`/api/v1/user/${userId}`),
  
  // 创建用户
  create: (user: UserCreateDto) => apiRequest<any>("/api/v1/user", "POST", user),
  
  // 更新用户
  update: (userId: number, user: UserUpdateDto) => 
    apiRequest<any>(`/api/v1/user/${userId}`, "PUT", user),
  
  // 删除用户
  delete: (userId: number) => apiRequest<any>(`/api/v1/user/${userId}`, "DELETE"),
  
  // 重置用户密码
  resetPassword: (userId: number, password: string) => 
    apiRequest<any>(`/api/v1/user/${userId}/password`, "PUT", { password }),
  
  // 获取可分配角色列表
  getRoles: () => apiRequest<Role[]>("/api/v1/roles/optionselect")
}; 