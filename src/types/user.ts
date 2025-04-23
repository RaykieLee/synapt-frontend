export interface User {
  user_id: number;
  user_name: string;
  nick_name: string;
  email?: string;
  phone?: string;
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
}

export interface UserQuery {
  page_num?: number;
  page_size?: number;
  user_name?: string;
  phone?: string;
  status?: string;
  dept_id?: number;
}

export interface UserCreateDto {
  user_name: string;
  nick_name: string;
  password?: string;
  email?: string;
  phone?: string;
  sex: string;
  status: string;
  dept_id?: number;
  remark?: string;
  role_ids?: number[];
  post_ids?: number[];
}

export interface UserUpdateDto extends Omit<UserCreateDto, 'password'> {
  user_id: number;
  password?: string;
} 