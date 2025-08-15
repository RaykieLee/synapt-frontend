import { apiRequest } from "@/lib/api";
import {
  AppAccess,
  AppAccessCreateDto,
  AppAccessQuery,
  AppAccessUpdateDto,
  ResetApiKeyRequest
} from "@/types/app";
import { PageResult } from "@/types/base";

// 应用接入API
export const appAccessAPI = {
  // 获取应用接入列表
  getList: (params: AppAccessQuery) => {
    return apiRequest<PageResult<AppAccess>>("/api/v1/platform/app/list", "POST", {
      page_num: params.page_num || 1,
      page_size: params.page_size || 10,
      sorts: params.sorts || [
        {
          field: "create_time",
          order: "desc"
        }
      ],
      params: {
        keywords: params.params?.keywords || {},
        status: params.params?.status,
        time_range: params.params?.time_range,
        search_mode: params.params?.search_mode || "and"
      }
    });
  },

  // 获取所有启用的应用接入（用于下拉选择）
  getAll: () =>
    apiRequest<AppAccess[]>("/api/v1/platform/app/all", "GET"),

  // 获取应用接入详情
  getDetail: (app_id: number) =>
    apiRequest<AppAccess>(`/api/v1/platform/app/${app_id}`, "GET"),

  // 创建应用接入
  create: (app: AppAccessCreateDto) =>
    apiRequest<AppAccess>("/api/v1/platform/app/create", "POST", app),

  // 更新应用接入
  update: (app_id: number, app: AppAccessUpdateDto) =>
    apiRequest<AppAccess>(`/api/v1/platform/app/${app_id}`, "PUT", app),

  // 删除应用接入
  delete: (app_id: number) =>
    apiRequest<void>(`/api/v1/platform/app/${app_id}`, "DELETE"),

  // 批量删除应用接入
  batchDelete: (app_ids: number[]) =>
    apiRequest<void>("/api/v1/platform/app/batch-delete", "POST", { app_ids }),

  // 重置API密钥
  resetApiKey: (data: ResetApiKeyRequest) =>
    apiRequest<AppAccess>("/api/v1/platform/app/reset-api-key", "POST", data),
}; 