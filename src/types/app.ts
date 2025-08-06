import { BaseQuery, PageResult } from "./base";

// 应用接入基础类型
export interface AppAccess {
  id: number;
  app_code: string;
  app_name: string;
  api_key: string;
  ip_whitelist?: string;
  last_access_time?: string;
  access_count: number;
  expire_time?: string;
  description?: string;
  status: string;
  remark?: string;
  create_time: string;
  create_by?: string;
  update_time?: string;
  update_by?: string;
}

// 创建应用接入请求参数
export interface AppAccessCreateDto {
  app_code: string;
  app_name: string;
  ip_whitelist?: string;
  expire_time?: string;
  description?: string;
  status: string;
  remark?: string;
}

// 更新应用接入请求参数
export interface AppAccessUpdateDto {
  app_code?: string;
  app_name?: string;
  ip_whitelist?: string;
  expire_time?: string;
  description?: string;
  status?: string;
  remark?: string;
}

// 重置API密钥请求参数
export interface ResetApiKeyRequest {
  id: number;
}

// 搜索参数
export interface AppAccessSearchParams {
  keywords?: {
    app_name?: string;
    app_code?: string;
  };
  status?: string;
  time_range?: {
    create_time?: {
      start?: string;
      end?: string;
    };
    expire_time?: {
      start?: string;
      end?: string;
    };
  };
  search_mode?: "and" | "or";
}

// 排序字段定义
export interface Sort {
  field: string;
  order: "asc" | "desc";
}

// 查询参数
export interface AppAccessQuery extends BaseQuery {
  params?: AppAccessSearchParams;
  sorts?: Sort[];
} 