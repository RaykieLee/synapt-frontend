export interface Dept {
  dept_id: number;
  parent_id: number;
  dept_name: string;
  ancestors: string;
  order_num: number;
  leader: string;
  phone: string;
  email: string;
  status: string;
  create_time: string;
  children?: Dept[];
}

export interface DeptQuery {
  dept_name?: string;
  status?: string;
}

export interface DeptCreateDto {
  parent_id: number;
  dept_name: string;
  order_num: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: string;
}

export interface DeptUpdateDto extends DeptCreateDto {
  dept_id: number;
} 