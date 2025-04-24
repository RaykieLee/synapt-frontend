import { Config, ConfigCreateDto, ConfigQuery, ConfigUpdateDto } from '../types/config';
import { PaginationResult } from '../types/pagination';
import { apiRequest } from '../lib/api';

/**
 * 系统配置API
 */
export const configAPI = {
  /**
   * 获取配置列表
   */
  getList: (params: ConfigQuery) => {
    const requestBody: Record<string, any> = {
      page_num: params.pageNum || 1,
      page_size: params.pageSize || 10,
      search_params: {}
    };

    if (params.config_name) requestBody.search_params.config_name = params.config_name;
    if (params.config_key) requestBody.search_params.config_key = params.config_key;
    if (params.config_value) requestBody.search_params.config_value = params.config_value;
    if (params.status !== undefined) requestBody.search_params.status = params.status;

    return apiRequest<PaginationResult<Config>>('/api/v1/configs/list', 'POST', requestBody);
  },

  /**
   * 获取配置详情
   */
  getDetail: (id: number) => apiRequest<Config>(`/api/v1/configs/${id}`, 'GET'),

  /**
   * 创建配置
   */
  create: (data: ConfigCreateDto) => {
    const requestBody = {
      config_name: data.config_name,
      config_key: data.config_key,
      config_value: data.config_value,
      status: data.status,
      remark: data.remark,
      group_name: data.group_name,
      is_frontend: data.is_frontend
    };

    return apiRequest<Config>('/api/v1/configs', 'POST', requestBody);
  },

  /**
   * 更新配置
   */
  update: (data: ConfigUpdateDto) => {
    const requestBody = {
      config_name: data.config_name,
      config_key: data.config_key,
      config_value: data.config_value,
      status: data.status,
      remark: data.remark,
      group_name: data.group_name,
      is_frontend: data.is_frontend
    };

    return apiRequest<Config>(`/api/v1/configs/${data.id}`, 'PUT', requestBody);
  },

  /**
   * 删除配置
   */
  delete: (id: number) => apiRequest<void>(`/api/v1/configs/${id}`, 'DELETE'),

  /**
   * 刷新缓存
   */
  refreshCache: () => apiRequest<void>('/api/v1/configs/refresh-cache', 'POST'),

  /**
   * 获取AI体验中心菜单配置
   */
  getAiExperienceMenu: () => apiRequest<string>('/api/v1/configs/key/ai_experience_center_menu')
}; 