import { apiRequest } from "@/lib/api";
import { 
  AlertCategory, 
  AlertCategoryCreateDto, 
  AlertCategoryQuery, 
  AlertCategoryUpdateDto, 
  AlertConfig, 
  AlertConfigCreateDto, 
  AlertConfigQuery, 
  AlertConfigUpdateDto 
} from "@/types/alert";
import { BaseResponse, PageResult } from "@/types/base";

// 告警配置API
export const alertConfigAPI = {
  // 获取告警配置列表
  getList: (params: AlertConfigQuery) => {
    console.log('API getList params:', params); // 添加日志
    return apiRequest<BaseResponse<PageResult<AlertConfig>>>("/api/v1/platform/alerts/config/list", "POST", {
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
        category_id: params.params?.category_id,
        search_mode: params.params?.search_mode || "and"
      }
    });
  },

  // 获取告警配置详情
  getDetail: (config_id: number) => 
    apiRequest<BaseResponse<AlertConfig>>(`/api/v1/platform/alerts/config/${config_id}`, "GET"),

  // 创建告警配置
  create: (config: AlertConfigCreateDto) => 
    apiRequest<BaseResponse<AlertConfig>>("/api/v1/platform/alerts/config/create", "POST", config),

  // 更新告警配置
  update: (config_id: number, config: AlertConfigUpdateDto) => 
    apiRequest<BaseResponse<AlertConfig>>(`/api/v1/platform/alerts/config/${config_id}`, "PUT", config),

  // 删除告警配置
  delete: (config_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/alerts/config/${config_id}`, "DELETE"),

  // 批量删除告警配置
  batchDelete: (config_ids: number[]) => 
    apiRequest<BaseResponse<void>>("/api/v1/platform/alerts/config/batch-delete", "POST", { config_ids }),
};

// 告警类别API
export const alertCategoryAPI = {
  // 获取告警类别列表
  getList: (params: AlertCategoryQuery) => 
    apiRequest<BaseResponse<PageResult<AlertCategory>>>("/api/v1/platform/alerts/category/list", "POST", { 
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
        search_mode: params.params?.search_mode || "and"
      }
    }),

  // 获取所有启用的告警类别（用于下拉选择）
  getAll: () => 
    apiRequest<BaseResponse<AlertCategory[]>>("/api/v1/platform/alerts/category/all", "GET"),

  // 获取告警类别详情
  getDetail: (category_id: number) => 
    apiRequest<BaseResponse<AlertCategory>>(`/api/v1/platform/alerts/category/${category_id}`, "GET"),

  // 创建告警类别
  create: (category: AlertCategoryCreateDto) => 
    apiRequest<BaseResponse<AlertCategory>>("/api/v1/platform/alerts/category", "POST", category),

  // 更新告警类别
  update: (category_id: number, category: AlertCategoryUpdateDto) => 
    apiRequest<BaseResponse<AlertCategory>>(`/api/v1/platform/alerts/category/${category_id}`, "PUT", category),

  // 删除告警类别
  delete: (category_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/alerts/category/${category_id}`, "DELETE"),

  // 批量删除告警类别
  batchDelete: (category_ids: number[]) => 
    apiRequest<BaseResponse<void>>("/api/v1/platform/alerts/category/batch-delete", "POST", { category_ids }),
}; 