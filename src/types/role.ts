export interface Role {
  role_id: number;
  role_name: string;
  role_key: string;
  role_sort: number;
  status: string;
  remark?: string;
  create_time: string;
  update_time: string;
  menu_ids: number[];
}

/**
 * 新版本角色查询参数
 */
export interface RoleQuery {
  page_num?: number;
  page_size?: number;
  sorts?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  params?: {
    keywords?: {
      role_name?: string;
      role_key?: string;
    };
    status?: string;
    search_mode?: 'and' | 'or';
  };
}

/**
 * 角色搜索参数
 */
export interface RoleSearchParams {
  role_name?: string;
  role_key?: string;
  status?: string;
}

/**
 * 创建角色请求参数
 */
export interface RoleCreateDto {
  role_name: string;
  role_key: string;
  role_sort: number;
  status: string;
  remark?: string;
  menu_ids: number[];
}

/**
 * 更新角色请求参数
 */
export interface RoleUpdateDto extends RoleCreateDto {
  role_id: number;
}

export interface MenuNode {
  id: number;
  label: string;
  children?: MenuNode[];
} 