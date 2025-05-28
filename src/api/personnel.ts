import { apiRequest } from "@/lib/api";
import { 
  PersonnelQualification,
  PersonnelQualificationCreateDto,
  PersonnelQualificationUpdateDto,
  PersonnelQualificationQuery,
  PersonnelQualificationBatchDeleteDto,
  Certificate,
  CertificateCreateDto,
  CertificateUpdateDto,
  CertificateQuery,
  CertificateBatchDeleteDto,
  PersonnelStats,
  PersonnelOption,
  CertificateOption,
  CertificateCategoryOption,
  CertificateLevelOption
} from "@/types/personnel";
import { BaseResponse, PageResult } from "@/types/base";

// 人员资质API
export const personnelQualificationAPI = {
  // 获取人员资质列表
  getList: (params: PersonnelQualificationQuery) => {
    return apiRequest<BaseResponse<PageResult<PersonnelQualification>>>(
      "/api/v1/platform/personnel/qualification/list", 
      "POST", 
      {
        page_num: params.page_num || 1,
        page_size: params.page_size || 10,
        sorts: params.sorts || [{ field: "create_time", order: "desc" }],
        params: {
          keywords: params.params?.keywords || {},
          status: params.params?.status,
          gender: params.params?.gender,
          department: params.params?.department,
          age_range: params.params?.age_range,
          time_range: params.params?.time_range,
          search_mode: params.params?.search_mode || "and"
        }
      }
    );
  },

  // 获取人员资质详情
  getDetail: (personnel_id: number) => 
    apiRequest<BaseResponse<PersonnelQualification>>(`/api/v1/platform/personnel/qualification/${personnel_id}`, "GET"),

  // 创建人员资质
  create: (data: PersonnelQualificationCreateDto) => 
    apiRequest<BaseResponse<PersonnelQualification>>("/api/v1/platform/personnel/qualification", "POST", data),

  // 更新人员资质
  update: (personnel_id: number, data: PersonnelQualificationUpdateDto) => 
    apiRequest<BaseResponse<PersonnelQualification>>(`/api/v1/platform/personnel/qualification/${personnel_id}`, "PUT", data),

  // 删除人员资质
  delete: (personnel_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/personnel/qualification/${personnel_id}`, "DELETE"),

  // 批量删除人员资质
  batchDelete: (data: PersonnelQualificationBatchDeleteDto) => 
    apiRequest<BaseResponse<{ count: number }>>("/api/v1/platform/personnel/qualification/batch-delete", "POST", data),

  // 获取人员选项列表
  getOptions: () => 
    apiRequest<BaseResponse<PersonnelOption[]>>("/api/v1/platform/personnel/qualification/options/list", "GET"),

  // 获取人员统计信息
  getStats: () => 
    apiRequest<BaseResponse<PersonnelStats>>("/api/v1/platform/personnel/qualification/stats/overview", "GET"),
};

// 证书API
export const certificateAPI = {
  // 获取证书列表
  getList: (params: CertificateQuery) => {
    return apiRequest<BaseResponse<PageResult<Certificate>>>(
      "/api/v1/platform/personnel/certificate/list", 
      "POST", 
      {
        page_num: params.page_num || 1,
        page_size: params.page_size || 10,
        sorts: params.sorts || [{ field: "create_time", order: "desc" }],
        params: {
          keywords: params.params?.keywords || {},
          status: params.params?.status,
          certificate_category: params.params?.certificate_category,
          certificate_level: params.params?.certificate_level,
          personnel_id: params.params?.personnel_id,
          time_range: params.params?.time_range,
          search_mode: params.params?.search_mode || "and"
        }
      }
    );
  },

  // 获取证书详情
  getDetail: (certificate_id: number) => 
    apiRequest<BaseResponse<Certificate>>(`/api/v1/platform/personnel/certificate/${certificate_id}`, "GET"),

  // 创建证书
  create: (data: CertificateCreateDto) => 
    apiRequest<BaseResponse<Certificate>>("/api/v1/platform/personnel/certificate", "POST", data),

  // 更新证书
  update: (certificate_id: number, data: CertificateUpdateDto) => 
    apiRequest<BaseResponse<Certificate>>(`/api/v1/platform/personnel/certificate/${certificate_id}`, "PUT", data),

  // 删除证书
  delete: (certificate_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/personnel/certificate/${certificate_id}`, "DELETE"),

  // 批量删除证书
  batchDelete: (data: CertificateBatchDeleteDto) => 
    apiRequest<BaseResponse<{ count: number }>>("/api/v1/platform/personnel/certificate/batch-delete", "POST", data),

  // 根据人员ID获取证书列表
  getByPersonnelId: (personnel_id: number) => 
    apiRequest<BaseResponse<Certificate[]>>(`/api/v1/platform/personnel/certificate/personnel/${personnel_id}`, "GET"),

  // 获取即将过期的证书
  getExpiring: (days: number = 30) => 
    apiRequest<BaseResponse<Certificate[]>>(`/api/v1/platform/personnel/certificate/expiring/list?days=${days}`, "GET"),

  // 获取证书选项列表
  getOptions: () => 
    apiRequest<BaseResponse<CertificateOption[]>>("/api/v1/platform/personnel/certificate/options/list", "GET"),

  // 获取证书类别选项
  getCategories: () => 
    apiRequest<BaseResponse<CertificateCategoryOption[]>>("/api/v1/platform/personnel/certificate/options/categories", "GET"),

  // 获取证书级别选项
  getLevels: () => 
    apiRequest<BaseResponse<CertificateLevelOption[]>>("/api/v1/platform/personnel/certificate/options/levels", "GET"),
}; 