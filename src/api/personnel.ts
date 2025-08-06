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
  CertificateLevelOption,
  PersonnelCertificateAssignDto,
  CertificatePersonnelAssignDto,
  PersonnelCertificateRemoveDto,
  CertificatePersonnelRemoveDto
} from "@/types/personnel";
import { PageResult } from "@/types/base";

// 人员资质API
export const personnelQualificationAPI = {
  // 获取人员资质列表
  getList: (params: PersonnelQualificationQuery) => {
    return apiRequest<PageResult<PersonnelQualification>>(
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
    apiRequest<PersonnelQualification>(`/api/v1/platform/personnel/qualification/${personnel_id}`, "GET"),

  // 创建人员资质
  create: (data: PersonnelQualificationCreateDto) =>
    apiRequest<PersonnelQualification>("/api/v1/platform/personnel/qualification", "POST", data),

  // 更新人员资质
  update: (personnel_id: number, data: PersonnelQualificationUpdateDto) =>
    apiRequest<PersonnelQualification>(`/api/v1/platform/personnel/qualification/${personnel_id}`, "PUT", data),

  // 删除人员资质
  delete: (personnel_id: number) =>
    apiRequest<void>(`/api/v1/platform/personnel/qualification/${personnel_id}`, "DELETE"),

  // 批量删除人员资质
  batchDelete: (data: PersonnelQualificationBatchDeleteDto) =>
    apiRequest<{ count: number }>("/api/v1/platform/personnel/qualification/batch-delete", "POST", data),

  // 批量更新人员状态
  batchUpdateStatus: (personnel_ids: number[], status: string) =>
    apiRequest<{ count: number }>("/api/v1/platform/personnel/qualification/batch-status", "POST", { personnel_ids, status }),

  // 获取人员选项列表
  getOptions: () =>
    apiRequest<PersonnelOption[]>("/api/v1/platform/personnel/qualification/options/list", "GET"),

  // 获取人员统计信息
  getStats: () =>
    apiRequest<PersonnelStats>("/api/v1/platform/personnel/qualification/stats/overview", "GET"),
};

// 证书API
export const certificateAPI = {
  // 获取证书列表
  getList: (params: CertificateQuery) => {
    return apiRequest<PageResult<Certificate>>(
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
          time_range: params.params?.time_range,
          search_mode: params.params?.search_mode || "and"
        }
      }
    );
  },

  // 获取证书详情
  getDetail: (certificate_id: number) =>
    apiRequest<Certificate>(`/api/v1/platform/personnel/certificate/${certificate_id}`, "GET"),

  // 创建证书
  create: (data: CertificateCreateDto) =>
    apiRequest<Certificate>("/api/v1/platform/personnel/certificate", "POST", data),

  // 更新证书
  update: (certificate_id: number, data: CertificateUpdateDto) =>
    apiRequest<Certificate>(`/api/v1/platform/personnel/certificate/${certificate_id}`, "PUT", data),

  // 删除证书
  delete: (certificate_id: number) =>
    apiRequest<void>(`/api/v1/platform/personnel/certificate/${certificate_id}`, "DELETE"),

  // 批量删除证书
  batchDelete: (data: CertificateBatchDeleteDto) =>
    apiRequest<{ count: number }>("/api/v1/platform/personnel/certificate/batch-delete", "POST", data),

  // 批量更新证书状态
  batchUpdateStatus: (certificate_ids: number[], status: string) =>
    apiRequest<{ count: number }>("/api/v1/platform/personnel/certificate/batch-status", "POST", { certificate_ids, status }),

  // 根据人员ID获取证书列表
  getByPersonnelId: (personnel_id: number) =>
    apiRequest<Certificate[]>(`/api/v1/platform/personnel/certificate/personnel/${personnel_id}`, "GET"),

  // 获取即将过期的证书
  getExpiring: (days: number = 30) =>
    apiRequest<Certificate[]>(`/api/v1/platform/personnel/certificate/expiring/list?days=${days}`, "GET"),

  // 获取证书选项列表
  getOptions: () =>
    apiRequest<CertificateOption[]>("/api/v1/platform/personnel/certificate/options/list", "GET"),

  // 获取证书类别选项
  getCategories: () =>
    apiRequest<CertificateCategoryOption[]>("/api/v1/platform/personnel/certificate/options/categories", "GET"),

  // 获取证书级别选项
  getLevels: () =>
    apiRequest<CertificateLevelOption[]>("/api/v1/platform/personnel/certificate/options/levels", "GET"),

  // 人员证书关联管理API
  // 为证书分配人员
  assignPersonnel: (data: CertificatePersonnelAssignDto) =>
    apiRequest<boolean>("/api/v1/platform/personnel/certificate/assign-personnel", "POST", data),

  // 为人员分配证书
  assignCertificates: (data: PersonnelCertificateAssignDto) =>
    apiRequest<boolean>("/api/v1/platform/personnel/certificate/assign-certificates", "POST", data),

  // 移除证书人员关联
  removePersonnel: (data: CertificatePersonnelRemoveDto) =>
    apiRequest<boolean>("/api/v1/platform/personnel/certificate/remove-personnel", "POST", data),

  // 移除人员证书关联
  removeCertificates: (data: PersonnelCertificateRemoveDto) =>
    apiRequest<boolean>("/api/v1/platform/personnel/certificate/remove-certificates", "POST", data),
}; 