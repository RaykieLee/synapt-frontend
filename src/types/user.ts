export interface User {
  user_id: number;
  user_name: string;
  nick_name: string;
  email?: string;
  phonenumber?: string;
  sex: string;
  avatar?: string;
  status: string;
  login_ip?: string;
  login_date?: string;
  dept_id?: number;
  remark?: string;
  create_time: string;
  update_time: string;
  dept_name?: string;
  role_ids?: number[];
  post_ids?: number[];
  roles: Array<{
    role_id: number;
    role_name: string;
    role_key: string;
  }>;
}

/**
 * 新版本用户查询参数
 */
export interface UserQuery {
  page_num?: number;
  page_size?: number;
  sorts?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  params?: {
    keywords?: {
      user_name?: string;
      nick_name?: string;
      phonenumber?: string;
      email?: string;
    };
    status?: string;
    dept_id?: number;
    search_mode?: 'and' | 'or';
  };
}

/**
 * 用户搜索参数
 */
export interface UserSearchParams {
  user_name?: string;
  nick_name?: string;
  phonenumber?: string;
  email?: string;
  status?: string;
  dept_id?: number;
}

/**
 * 创建用户请求参数
 */
export interface UserCreateDto {
  user_name: string;
  nick_name: string;
  password?: string;
  email?: string;
  phonenumber?: string;
  sex: string;
  status: string;
  dept_id?: number;
  remark?: string;
  role_ids?: number[];
  post_ids?: number[];
}

/**
 * 更新用户请求参数
 */
export interface UserUpdateDto extends Omit<UserCreateDto, 'password'> {
  user_id: number;
  password?: string;
} 