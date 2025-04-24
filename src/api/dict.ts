import { DictData, DictDataCreateDto, DictDataQuery, DictDataUpdateDto, DictOption, DictType, DictTypeCreateDto, DictTypeQuery, DictTypeUpdateDto } from '@/types/dict';
import { PaginationResult } from '@/types/pagination';
import { apiRequest } from '@/lib/api';
import { Dict, DictCreateDto, DictQuery, DictResponse, DictUpdateDto } from "@/types/dict"

/**
 * 字典API
 */
export const dictAPI = {
  /**
   * 获取字典类型列表
   */
  getDictTypes: (params: DictTypeQuery) => {
    const requestBody: Record<string, any> = {
      page_num: params.pageNum || 1,
      page_size: params.pageSize || 10,
      search_params: {}
    };

    if (params.dictName) requestBody.search_params.dict_name = params.dictName;
    if (params.dictType) requestBody.search_params.dict_type = params.dictType;
    if (params.status !== undefined) requestBody.search_params.status = params.status;

    return apiRequest<PaginationResult<DictType>>('/api/v1/dicts/types/list', 'POST', requestBody);
  },

  /**
   * 获取字典类型详情
   */
  getDictTypeDetail: (dictId: number) => apiRequest<DictType>(`/api/v1/dicts/types/${dictId}`, 'GET'),

  /**
   * 创建字典类型
   */
  createDictType: (data: DictTypeCreateDto) => apiRequest<DictType>('/api/v1/dicts/types', 'POST', data),

  /**
   * 更新字典类型
   */
  updateDictType: (dictId: number, data: DictTypeUpdateDto) => apiRequest<DictType>(`/api/v1/dicts/types/${dictId}`, 'PUT', data),

  /**
   * 删除字典类型
   */
  deleteDictType: (dictId: number) => apiRequest<void>(`/api/v1/dicts/types/${dictId}`, 'DELETE'),

  /**
   * 获取字典数据列表
   */
  getDictDataList: (params: DictDataQuery) => {
    const requestBody: Record<string, any> = {
      page_num: params.pageNum || 1,
      page_size: params.pageSize || 10,
      search_params: {}
    };

    if (params.dictType) requestBody.search_params.dict_type = params.dictType;
    if (params.dictLabel) requestBody.search_params.dict_label = params.dictLabel;
    if (params.status !== undefined) requestBody.search_params.status = params.status;

    return apiRequest<PaginationResult<DictData>>('/api/v1/dicts/data/list', 'POST', requestBody);
  },

  /**
   * 获取字典数据详情
   */
  getDictDataDetail: (dictCode: number) => apiRequest<DictData>(`/api/v1/dicts/data/${dictCode}`, 'GET'),

  /**
   * 创建字典数据
   */
  createDictData: (data: DictDataCreateDto) => apiRequest<DictData>('/api/v1/dicts/data', 'POST', data),

  /**
   * 更新字典数据
   */
  updateDictData: (dictCode: number, data: DictDataUpdateDto) => apiRequest<DictData>(`/api/v1/dicts/data/${dictCode}`, 'PUT', data),

  /**
   * 删除字典数据
   */
  deleteDictData: (dictCode: number) => apiRequest<void>(`/api/v1/dicts/data/${dictCode}`, 'DELETE'),

  /**
   * 根据字典类型获取字典选项
   */
  getDictOptions: (dictType: string) => apiRequest<DictOption[]>(`/api/v1/dicts/type/${dictType}`, 'GET')
};

export const dictApi = {
  getList: (params: DictQuery) => {
    const requestBody = {
      page: params.page,
      page_size: params.page_size,
      order_by: params.order_by,
      order: params.order,
      search_params: {}
    }
    if (params.dict_name) requestBody.search_params.dict_name = params.dict_name
    if (params.dict_key) requestBody.search_params.dict_key = params.dict_key
    if (params.dict_value) requestBody.search_params.dict_value = params.dict_value
    if (params.status) requestBody.search_params.status = params.status
    return apiRequest<DictResponse>('/api/v1/dict', {
      method: 'POST',
      data: requestBody
    })
  },
  create: (data: DictCreateDto) =>
    apiRequest<Dict>('/api/v1/dict', {
      method: 'POST',
      data
    }),
  update: (data: DictUpdateDto) =>
    apiRequest<Dict>(`/api/v1/dict/${data.id}`, {
      method: 'PUT',
      data
    }),
  delete: (id: number) =>
    apiRequest<void>(`/api/v1/dict/${id}`, {
      method: 'DELETE'
    }),
  batchDelete: (ids: number[]) =>
    apiRequest<void>('/api/v1/dict/batch', {
      method: 'DELETE',
      data: { ids }
    })
} 