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

export interface RoleQuery {
  role_name?: string;
  role_key?: string;
  status?: string;
}

export interface RoleCreateDto {
  role_name: string;
  role_key: string;
  role_sort: number;
  status: string;
  remark?: string;
  menu_ids: number[];
}

export interface RoleUpdateDto extends RoleCreateDto {
  role_id: number;
}

export interface MenuNode {
  id: number;
  label: string;
  children?: MenuNode[];
} 