import { apiRequest } from "@/lib/api";
import { 
  AlertCategory, 
  AlertCategoryCreateDto, 
  AlertCategoryQuery, 
  AlertCategoryUpdateDto, 
  AlertConfig, 
  AlertConfigCreateDto, 
  AlertConfigQuery, 
  AlertConfigUpdateDto,
  AlertLog,
  AlertLogCreateDto,
  AlertLogQuery,
  AlertLogUpdateDto,
  AlertLogBatchProcessDto
} from "@/types/alert";
import { PageResult } from "@/types/base";

// 告警配置API
export const alertConfigAPI = {
  // 获取告警配置列表
  getList: (params: AlertConfigQuery) => {
    return apiRequest<PageResult<AlertConfig>>("/api/v1/platform/alerts/config/list", "POST", {
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
        category_ids: params.params?.category_ids,
        search_mode: params.params?.search_mode || "and"
      }
    });
  },

  // 获取所有启用的告警配置（用于下拉选择）
  getAll: () =>
    apiRequest<AlertConfig[]>("/api/v1/platform/alerts/config/all", "GET"),

  // 获取告警配置详情
  getDetail: (config_id: number) =>
    apiRequest<AlertConfig>(`/api/v1/platform/alerts/config/${config_id}`, "GET"),

  // 创建告警配置
  create: (config: AlertConfigCreateDto) =>
    apiRequest<AlertConfig>("/api/v1/platform/alerts/config/create", "POST", config),

  // 更新告警配置
  update: (config_id: number, config: AlertConfigUpdateDto) =>
    apiRequest<AlertConfig>(`/api/v1/platform/alerts/config/${config_id}`, "PUT", config),

  // 删除告警配置
  delete: (config_id: number) =>
    apiRequest<void>(`/api/v1/platform/alerts/config/${config_id}`, "DELETE"),

  // 批量删除告警配置
  batchDelete: (config_ids: number[]) =>
    apiRequest<void>("/api/v1/platform/alerts/config/batch-delete", "POST", { config_ids }),
};

// 告警类别API
export const alertCategoryAPI = {
  // 获取告警类别列表
  getList: (params: AlertCategoryQuery) => {
    return apiRequest<PageResult<AlertCategory>>("/api/v1/platform/alerts/category/list", "POST", {
      page_num: params.page_num || 1, 
      page_size: params.page_size || 10,
      sorts: params.sorts || [
        {
          field: "create_time",
          order: "desc"
        }
      ],
      params: {
        keywords: {
          name: params.params?.keywords?.name,
          code: params.params?.keywords?.code,
        },
        status: params.params?.status,
        config_id: params.params?.config_id,
        search_mode: params.params?.search_mode || "and"
      }
    });
  },

  // 获取所有启用的告警类别（用于下拉选择）
  getAll: (config_id?: number) => 
    apiRequest<AlertCategory[]>(`/api/v1/platform/alerts/category/all${config_id ? `?config_id=${config_id}` : ''}`, "GET"),

  // 获取告警类别详情
  getDetail: (category_id: number) =>
    apiRequest<AlertCategory>(`/api/v1/platform/alerts/category/${category_id}`, "GET"),

  // 创建告警类别
  create: (category: AlertCategoryCreateDto) =>
    apiRequest<AlertCategory>("/api/v1/platform/alerts/category/create", "POST", category),

  // 更新告警类别
  update: (category_id: number, category: AlertCategoryUpdateDto) =>
    apiRequest<AlertCategory>(`/api/v1/platform/alerts/category/${category_id}`, "PUT", category),

  // 删除告警类别
  delete: (category_id: number) =>
    apiRequest<void>(`/api/v1/platform/alerts/category/${category_id}`, "DELETE"),

  // 批量删除告警类别
  batchDelete: (category_ids: number[]) =>
    apiRequest<void>("/api/v1/platform/alerts/category/batch-delete", "POST", { category_ids }),
};

// 告警日志API
export const alertLogAPI = {
  // 获取告警日志列表
  getList: (params: AlertLogQuery) => {
    return apiRequest<PageResult<AlertLog>>("/api/v1/platform/alerts/log/list", "POST", {
      page_num: params.page_num || 1, 
      page_size: params.page_size || 10,
      sorts: params.sorts || [
        {
          field: "create_time",
          order: "desc"
        }
      ],
      params: {
        keywords: {
          title: params.params?.keywords?.title,
          content: params.params?.keywords?.content,
          device_name: params.params?.keywords?.device_name,
        },
        status: params.params?.status,
        level: params.params?.level,
        source: params.params?.source,
        alert_config_id: params.params?.alert_config_id,
        category_id: params.params?.category_id,
        time_range: params.params?.time_range,
        search_mode: params.params?.search_mode || "and"
      }
    });
  },

  // 获取告警日志详情
  getDetail: (log_id: number) =>
    apiRequest<AlertLog>(`/api/v1/platform/alerts/log/${log_id}`, "GET"),

  // 创建告警日志
  create: (log: AlertLogCreateDto) =>
    apiRequest<AlertLog>("/api/v1/platform/alerts/log/create", "POST", log),

  // 更新告警日志
  update: (log_id: number, log: AlertLogUpdateDto) =>
    apiRequest<AlertLog>(`/api/v1/platform/alerts/log/${log_id}`, "PUT", log),

  // 删除告警日志
  delete: (log_id: number) =>
    apiRequest<void>(`/api/v1/platform/alerts/log/${log_id}`, "DELETE"),

  // 批量删除告警日志
  batchDelete: (log_ids: number[]) =>
    apiRequest<void>("/api/v1/platform/alerts/log/batch-delete", "POST", { log_ids }),

  // 批量处理告警日志
  batchProcess: (data: AlertLogBatchProcessDto) =>
    apiRequest<void>("/api/v1/platform/alerts/log/batch-process", "PUT", data),

  // 获取实时告警（按配置编码）
  getRealtimeAlerts: (configCode: string, limit: number = 8) => 
    apiRequest<AlertLog[]>(`/api/v1/platform/alerts/log/realtime/${configCode}?limit=${limit}`, "GET"),
}; 