import { PaginationResult } from '@/types/pagination';

/**
 * 系统配置查询参数
 */
export interface ConfigQuery {
  pageNum?: number;
  pageSize?: number;
  config_name?: string;
  config_key?: string;
  config_value?: string;
  status?: string;
}

/**
 * 系统配置实体
 */
export interface Config {
  id: number;
  config_name: string;
  config_key: string;
  config_value: string;
  status: string;
  remark?: string;
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
  config_id?: number;
  config_type?: string;
  group_name?: string;
  is_frontend?: boolean;
}

/**
 * 创建配置请求参数
 */
export interface ConfigCreateDto {
  config_name: string;
  config_key: string;
  config_value: string;
  status: string;
  remark?: string;
  group_name?: string;
  is_frontend?: boolean;
}

/**
 * 更新配置请求参数
 */
export interface ConfigUpdateDto extends ConfigCreateDto {
  id?: number;
}

/**
 * 配置列表响应
 */
export interface ConfigListResponse {
  code: number;
  msg: string;
  data: Config[];
  total: number;
}

/**
 * 配置详情响应
 */
export interface ConfigDetailResponse {
  code: number;
  msg: string;
  data: Config;
} 