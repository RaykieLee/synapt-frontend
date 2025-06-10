import { BaseQuery, BaseResponse } from './base'

/**
 * 字典类型查询参数
 */
export interface DictTypeQuery {
  pageNum?: number;
  pageSize?: number;
  dictName?: string;
  dictType?: string;
  status?: string;
}

/**
 * 字典类型搜索参数
 */
export interface DictTypeSearchParams {
  dict_name?: string;
  dict_type?: string;
  status?: string;
}

/**
 * 字典数据搜索参数
 */
export interface DictDataSearchParams {
  dict_label?: string;
  status?: string;
}

/**
 * 字典类型实体
 */
export interface DictType {
  dict_id: number;
  dict_name: string;
  dict_type: string;
  status: string;
  remark?: string;
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
}

/**
 * 创建字典类型请求参数
 */
export interface DictTypeCreateDto {
  dict_name: string;
  dict_type: string;
  status: string;
  remark?: string;
}

/**
 * 更新字典类型请求参数
 */
export interface DictTypeUpdateDto {
  dict_name?: string;
  dict_type?: string;
  status?: string;
  remark?: string;
}

/**
 * 字典数据查询参数
 */
export interface DictDataQuery {
  pageNum?: number;
  pageSize?: number;
  dictType?: string;
  dictLabel?: string;
  status?: string;
}

/**
 * 字典数据实体
 */
export interface DictData {
  dict_code: number;
  dict_sort: number;
  dict_label: string;
  dict_value: string;
  dict_type: string;
  is_default: string;
  status: string;
  remark?: string;
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
}

/**
 * 创建字典数据请求参数
 */
export interface DictDataCreateDto {
  dict_sort: number;
  dict_label: string;
  dict_value: string;
  dict_type: string;
  is_default?: string;
  status: string;
  remark?: string;
}

/**
 * 更新字典数据请求参数
 */
export interface DictDataUpdateDto {
  dict_sort?: number;
  dict_label?: string;
  dict_value?: string;
  dict_type?: string;
  is_default?: string;
  status?: string;
  remark?: string;
}

/**
 * 字典选项
 */
export interface DictOption {
  label: string;
  value: string;
}

export interface Dict {
  id: number
  dict_name: string
  dict_key: string
  dict_value: string
  status: number
  remark?: string
  created_at: string
  updated_at: string
}

export interface DictQuery extends BaseQuery {
  dict_name?: string
  dict_key?: string
  dict_value?: string
  status?: number
}

export interface DictCreateDto {
  dict_name: string
  dict_key: string
  dict_value: string
  status: number
  remark?: string
}

export interface DictUpdateDto extends DictCreateDto {
  id: number
}

export type DictResponse = BaseResponse<Dict> 