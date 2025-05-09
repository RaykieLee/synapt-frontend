import { apiRequest } from "@/lib/api";
import { Menu, MenuCreateDto, MenuUpdateDto, ParentMenu } from "@/types/menu";

export const menuApi = {
  // 获取菜单列表
  getList: () => apiRequest<Menu[]>("/api/v1/system/menus/list"),
  
  // 获取菜单详情
  getDetail: (menuId: number) => apiRequest<Menu>(`/api/v1/system/menus/${menuId}`),
  
  // 创建菜单
  create: (menu: MenuCreateDto) => apiRequest<any>("/api/v1/system/menus/create", "POST", menu),
  
  // 更新菜单
  update: (menuId: number, menu: MenuUpdateDto) => 
    apiRequest<any>(`/api/v1/system/menus/${menuId}`, "PUT", menu),
  
  // 删除菜单
  delete: (menuId: number) => apiRequest<any>(`/api/v1/system/menus/${menuId}`, "DELETE"),
  
  // 获取菜单树
  getTree: () => apiRequest<Menu[]>("/api/v1/system/menus/tree"),
  
  // 获取用于分配的菜单树
  getTreeSelect: () => apiRequest<any[]>("/api/v1/system/menus/treeselect"),
  
  // 获取角色对应的菜单树
  getRoleMenuTree: (roleId: number) => 
    apiRequest<any>(`/api/v1/system/menus/roleMenuTreeselect/${roleId}`)
}; 
