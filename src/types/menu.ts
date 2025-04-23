export interface Menu {
  menu_id: number;
  menu_name: string;
  parent_id: number;
  order_num: number;
  path: string;
  component?: string;
  query?: string;
  is_frame: number;
  is_cache: number;
  menu_type: string; // 'M': 目录, 'C': 菜单, 'F': 按钮
  visible: string; // '0': 显示, '1': 隐藏
  status: string; // '0': 正常, '1': 停用
  perms?: string;
  icon: string;
  create_time: string;
  update_time: string;
  remark?: string;
  children?: Menu[];
}

export interface MenuQuery {
  menu_name?: string;
  status?: string;
}

export interface MenuCreateDto {
  menu_name: string;
  parent_id: number;
  order_num: number;
  path: string;
  component?: string;
  is_frame: number;
  is_cache: number;
  menu_type: string;
  visible: string;
  status: string;
  perms?: string;
  icon: string;
  remark?: string;
}

export interface MenuUpdateDto extends MenuCreateDto {
  menu_id: number;
}

export interface ParentMenu {
  id: number;
  name: string;
} 