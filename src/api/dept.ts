import { apiRequest } from "@/lib/api";
import { Dept, DeptCreateDto, DeptUpdateDto } from "@/types/dept";

export const deptApi = {
  // 获取部门树结构
  getTree: () => apiRequest<Dept[]>("/api/v1/depts/tree"),
  
  // 获取部门列表
  getList: () => apiRequest<Dept[]>("/api/v1/depts/list"),
  
  // 获取部门详情
  getDetail: (deptId: number) => apiRequest<Dept>(`/api/v1/depts/${deptId}`),
  
  // 创建部门
  create: (dept: DeptCreateDto) => apiRequest<any>("/api/v1/depts", "POST", dept),
  
  // 更新部门
  update: (deptId: number, dept: DeptUpdateDto) => 
    apiRequest<any>(`/api/v1/depts/${deptId}`, "PUT", dept),
  
  // 删除部门
  delete: (deptId: number) => apiRequest<any>(`/api/v1/depts/${deptId}`, "DELETE"),
}; 