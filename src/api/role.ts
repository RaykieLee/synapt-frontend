import { apiRequest } from "@/lib/api";
import { MenuNode, Role, RoleCreateDto, RoleUpdateDto } from "@/types/role";

export const roleApi = {
  // 获取角色列表
  getList: () => apiRequest<Role[]>("/api/v1/system/roles/list"),
  
  // 获取角色详情
  getDetail: (roleId: number) => apiRequest<Role>(`/api/v1/system/roles/${roleId}`),
  
  // 创建角色
  create: (role: RoleCreateDto) => apiRequest<any>("/api/v1/system/roles/create", "POST", role),
  
  // 更新角色
  update: (roleId: number, role: RoleUpdateDto) => 
    apiRequest<any>(`/api/v1/system/roles/${roleId}`, "PUT", role),
  
  // 删除角色
  delete: (roleId: number) => apiRequest<any>(`/api/v1/system/roles/${roleId}`, "DELETE"),
  
  // 获取角色可选项（通常用于用户分配角色时的下拉选择）
  getOptions: () => apiRequest<Role[]>("/api/v1/system/roles/optionselect"),
  
  // 获取菜单树（用于分配权限时的树形选择）
  getMenuTree: () => apiRequest<MenuNode[]>("/api/v1/system/menus/treeselect")
}; 