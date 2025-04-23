import { apiRequest } from "@/lib/api";
import { User, UserCreateDto, UserQuery, UserUpdateDto } from "@/types/user";
import { Role } from "@/types/role";

interface UserListResponse {
  rows: User[];
  total: number;
}

// 符合接口文档的请求体结构
interface UserSearchRequest {
  page_num: number;
  page_size: number;
  order_by_column?: string;
  is_asc?: string;
  search_params: {
    user_name?: string;
    nick_name?: string;
    status?: string;
    phonenumber?: string;
  };
}

export const userApi = {
  // 获取用户列表 - 修改为POST请求，符合API文档规范
  getList: (params: UserQuery = {}) => {
    // 构建请求体
    const requestBody: UserSearchRequest = {
      page_num: params.page_num || 1,
      page_size: params.page_size || 10,
      search_params: {}
    };
    
    // 将查询参数转换为search_params
    if (params.user_name) requestBody.search_params.user_name = params.user_name;
    if (params.status) requestBody.search_params.status = params.status;
    if (params.phonenumber) requestBody.search_params.phonenumber = params.phonenumber;
    
    return apiRequest<UserListResponse>("/api/v1/users/list", "POST", requestBody);
  },
  
  // 获取用户详情
  getDetail: (userId: number) => apiRequest<User>(`/api/v1/users/${userId}`),
  
  // 创建用户
  create: (user: UserCreateDto) => apiRequest<any>("/api/v1/users", "POST", user),
  
  // 更新用户
  update: (userId: number, user: UserUpdateDto) => 
    apiRequest<any>(`/api/v1/users/${userId}`, "PUT", user),
  
  // 删除用户
  delete: (userId: number) => apiRequest<any>(`/api/v1/users/${userId}`, "DELETE"),
  
  // 重置用户密码
  resetPassword: (userId: number, password: string) => 
    apiRequest<any>(`/api/v1/users/${userId}/password`, "PUT", { password }),
  
  // 获取可分配角色列表
  getRoles: () => apiRequest<Role[]>("/api/v1/roles/actions/optionselect")
}; 