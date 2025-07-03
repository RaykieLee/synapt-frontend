import { apiRequest } from "@/lib/api";
import { 
  FaceLibrary, 
  FaceLibraryCreateDto, 
  FaceLibraryQuery, 
  FaceLibraryUpdateDto,
  FacePerson,
  FacePersonCreateDto,
  FacePersonQuery,
  FacePersonUpdateDto,
  FaceRecognitionResult
} from "@/types/face";
import { BaseResponse, PageResult } from "@/types/base";

// 人脸库API
export const faceLibraryAPI = {
  // 获取人脸库列表
  getList: (params: FaceLibraryQuery) => {
    return apiRequest<BaseResponse<PageResult<FaceLibrary>>>("/api/v1/platform/face/library/list", "POST", {
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

  // 获取所有启用的人脸库（用于下拉选择）
  getAll: () => 
    apiRequest<BaseResponse<FaceLibrary[]>>("/api/v1/platform/face/library/all", "GET"),

  // 获取人脸库详情
  getDetail: (library_id: string) => 
    apiRequest<BaseResponse<FaceLibrary>>(`/api/v1/platform/face/library/${library_id}`, "GET"),

  // 创建人脸库
  create: (library: FaceLibraryCreateDto) => 
    apiRequest<BaseResponse<FaceLibrary>>("/api/v1/platform/face/library/create", "POST", library),

  // 更新人脸库
  update: (library_id: string, library: FaceLibraryUpdateDto) => 
    apiRequest<BaseResponse<FaceLibrary>>(`/api/v1/platform/face/library/${library_id}`, "PUT", library),

  // 删除人脸库
  delete: (library_id: string) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/face/library/${library_id}`, "DELETE"),

  // 批量删除人脸库
  batchDelete: (library_ids: string[]) => 
    apiRequest<BaseResponse<void>>("/api/v1/platform/face/library/batch-delete", "POST", { library_ids }),
};

// 人员API
export const facePersonAPI = {
  // 获取人员列表
  getList: (params: FacePersonQuery) => {
    return apiRequest<BaseResponse<PageResult<FacePerson>>>("/api/v1/platform/face/person/list", "POST", {
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
        library_id: params.params?.library_id,
        time_range: params.params?.time_range,
        search_mode: params.params?.search_mode || "and"
      }
    });
  },

  // 获取所有启用的人员（用于下拉选择）
  getAll: (library_id?: string) => 
    apiRequest<BaseResponse<FacePerson[]>>(`/api/v1/platform/face/person/all${library_id ? `?library_id=${library_id}` : ''}`, "GET"),

  // 获取人员详情
  getDetail: (person_id: string) => 
    apiRequest<BaseResponse<FacePerson>>(`/api/v1/platform/face/person/${person_id}`, "GET"),

  // 创建人员
  create: (person: FacePersonCreateDto) => 
    apiRequest<BaseResponse<FacePerson>>("/api/v1/platform/face/person/create", "POST", person),

  // 更新人员
  update: (person_id: string, person: FacePersonUpdateDto) => 
    apiRequest<BaseResponse<FacePerson>>(`/api/v1/platform/face/person/${person_id}`, "PUT", person),

  // 删除人员
  delete: (person_id: string) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/face/person/${person_id}`, "DELETE"),

  // 批量删除人员
  batchDelete: (person_ids: string[]) => 
    apiRequest<BaseResponse<void>>("/api/v1/platform/face/person/batch-delete", "POST", { person_ids }),
};

// 人脸图片API
export const faceImageAPI = {
  // 删除人脸图片
  delete: (image_id: string) => 
    apiRequest<BaseResponse<boolean>>(`/api/v1/platform/face/image/${image_id}`, "DELETE"),

  // 批量删除人脸图片
  batchDelete: (image_ids: string[]) => 
    apiRequest<BaseResponse<number>>("/api/v1/platform/face/image/batch-delete", "POST", { image_ids }),

  // 识别图片中的人脸
  recognize: (image_id: string) => 
    apiRequest<BaseResponse<FaceRecognitionResult>>("/api/v1/platform/face/image/recognize", "POST", { image_id }),
};

 