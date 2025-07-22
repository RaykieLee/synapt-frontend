import { apiRequest } from "@/lib/api";
import { 
  LLMConfig, 
  LLMConfigCreateDto, 
  LLMConfigUpdateDto, 
  LLMConfigQuery, 
  LLMConfigListResponse 
} from "@/types/llm-config";

export const llmConfigAPI = {
  // 获取大模型配置列表（分页查询）
  getList: (query: LLMConfigQuery) => 
    apiRequest<LLMConfigListResponse>("/api/v1/platform/llm-config/list", "POST", query),

  // 获取所有启用的大模型配置（用于下拉选择）
  getAllEnabled: () => 
    apiRequest<LLMConfig[]>("/api/v1/platform/llm-config/all", "GET"),

  // 根据ID获取大模型配置详情
  getById: (id: string) => 
    apiRequest<LLMConfig>(`/api/v1/platform/llm-config/${id}`, "GET"),

  // 创建大模型配置
  create: (data: LLMConfigCreateDto) => 
    apiRequest<LLMConfig>("/api/v1/platform/llm-config", "POST", data),

  // 更新大模型配置
  update: (id: string, data: LLMConfigUpdateDto) => 
    apiRequest<LLMConfig>(`/api/v1/platform/llm-config/${id}`, "PUT", data),

  // 删除大模型配置
  delete: (id: string) => 
    apiRequest<boolean>(`/api/v1/platform/llm-config/${id}`, "DELETE"),

  // 批量删除大模型配置
  batchDelete: (data: { ids: string[] }) => 
    apiRequest<number>("/api/v1/platform/llm-config/batch-delete", "POST", data),
};