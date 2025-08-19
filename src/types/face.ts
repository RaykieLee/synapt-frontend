/**
 * 人脸识别模块相关类型定义
 */

// ========== 人脸库相关类型 ==========

// 人脸库基础接口
export interface FaceLibrary {
  id: string
  library_code: string
  library_name: string
  description?: string
  total_persons: number
  total_faces: number
  status: string
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  deleted?: string
}

// 人脸库创建参数
export interface FaceLibraryCreateDto {
  library_code: string
  library_name: string
  description?: string
  status?: string
  remark?: string
}

// 人脸库更新参数
export interface FaceLibraryUpdateDto {
  library_code?: string
  library_name?: string
  description?: string
  status?: string
  remark?: string
}

// 人脸库查询参数
export interface FaceLibraryQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  params?: {
    keywords?: {
      library_code?: string
      library_name?: string
    }
    status?: string
    time_range?: {
      create_time?: {
        start?: string
        end?: string
      }
      update_time?: {
        start?: string
        end?: string
      }
    }
    search_mode?: 'and' | 'or'
  }
}

// ========== 人员相关类型 ==========

// 人员基础接口
export interface FacePerson {
  id: string
  library_id: string
  person_code: string
  person_name: string
  face_count: number
  status: string
  remark?: string
  library?: FaceLibrary
  user_id?: number
  user_name?: string
  nick_name?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  deleted?: string
}

// 人员创建参数
export interface FacePersonCreateDto {
  library_id: string
  person_code: string
  person_name: string
  status?: string
  remark?: string
}

// 人员更新参数
export interface FacePersonUpdateDto {
  library_id?: string
  person_code?: string
  person_name?: string
  status?: string
  remark?: string
}

// 人员查询参数
export interface FacePersonQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  params?: {
    keywords?: {
      person_code?: string
      person_name?: string
    }
    status?: string
    library_id?: string
    time_range?: {
      create_time?: {
        start?: string
        end?: string
      }
      update_time?: {
        start?: string
        end?: string
      }
    }
    search_mode?: 'and' | 'or'
  }
}



// ========== 人脸图片相关类型 ==========

// 人脸图片简化接口（避免循环引用）
export interface FaceImageSimple {
  id: string
  person_id: string
  library_id: string
  image_id?: string
  face_feature?: string
  status?: string
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  deleted?: string
}

// ========== 搜索参数接口 ==========

// 人脸库搜索参数接口
export interface FaceLibrarySearchParams {
  library_code?: string
  library_name?: string
  status?: string
}

// 人员搜索参数接口
export interface FacePersonSearchParams {
  person_code?: string
  person_name?: string
  status?: string
  library_id?: string
}



// ========== 响应类型 ==========

// 列表响应
export interface FaceLibraryListResponse {
  list: FaceLibrary[]
  total: number
  page_num: number
  page_size: number
  pages: number
}

export interface FacePersonListResponse {
  list: FacePerson[]
  total: number
  page_num: number
  page_size: number
  pages: number
}

// ========== 人脸识别结果类型 ==========

// 人脸框位置
export interface FaceBox {
  left: number
  top: number
  right: number
  bottom: number
}

// 人脸匹配结果
export interface FaceMatch {
  person_id: string
  person_name: string
  library_id: string
  confidence: number
  face_image_id: string
}

// 识别到的人脸信息
export interface RecognizedFace {
  face_index: number
  face_box: FaceBox
  matches: FaceMatch[]
  error?: string
}

// 人脸识别结果
export interface FaceRecognitionResult {
  success: boolean
  message: string
  face_count?: number
  faces: RecognizedFace[]
  image_url?: string
}

 