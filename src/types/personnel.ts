// 简化的人员信息（用于证书中显示）
export interface PersonnelQualificationSimple {
  id: number
  name: string
  department?: string
  position?: string
}

// 证书接口
export interface Certificate {
  id: number
  certificate_name: string
  certificate_category: string
  certificate_level: number
  issuing_authority?: string
  certificate_number?: string
  issue_date?: string
  expiry_date?: string
  certificate_file?: string
  status: string
  remark?: string
  personnel: PersonnelQualificationSimple[]  // 持有该证书的人员列表
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
}

// 人员资质接口
export interface PersonnelQualification {
  id: number
  name: string
  gender: string
  age?: number
  entry_date?: string
  phone?: string
  email?: string
  department?: string
  position?: string
  education?: string
  major?: string
  work_experience?: string
  status: string
  remark?: string
  certificates: Certificate[]
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
}

// 人员资质查询参数
export interface PersonnelQualificationQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  params?: {
    keywords?: {
      name?: string
      department?: string
      position?: string
    }
    status?: string
    gender?: string
    department?: string
    age_range?: {
      min?: number
      max?: number
    }
    time_range?: {
      entry_date?: {
        start?: string
        end?: string
      }
      create_time?: {
        start?: string
        end?: string
      }
    }
    search_mode?: 'and' | 'or'
  }
}

// 证书查询参数
export interface CertificateQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  params?: {
    keywords?: {
      certificate_name?: string
      issuing_authority?: string
      certificate_number?: string
    }
    status?: string
    certificate_category?: string
    certificate_level?: number
    time_range?: {
      issue_date?: {
        start?: string
        end?: string
      }
      expiry_date?: {
        start?: string
        end?: string
      }
      create_time?: {
        start?: string
        end?: string
      }
    }
    search_mode?: 'and' | 'or'
  }
}

// 创建人员资质请求
export interface PersonnelQualificationCreateDto {
  name: string
  gender: string
  age?: number
  entry_date?: string
  phone?: string
  email?: string
  department?: string
  position?: string
  education?: string
  major?: string
  work_experience?: string
  status?: string
  remark?: string
}

// 更新人员资质请求
export interface PersonnelQualificationUpdateDto {
  name?: string
  gender?: string
  age?: number
  entry_date?: string
  phone?: string
  email?: string
  department?: string
  position?: string
  education?: string
  major?: string
  work_experience?: string
  status?: string
  remark?: string
}

// 创建证书请求
export interface CertificateCreateDto {
  certificate_name: string
  certificate_category: string
  certificate_level: number
  issuing_authority?: string
  certificate_number?: string
  issue_date?: string
  expiry_date?: string
  certificate_file?: string
  status?: string
  remark?: string
}

// 更新证书请求
export interface CertificateUpdateDto {
  certificate_name?: string
  certificate_category?: string
  certificate_level?: number
  issuing_authority?: string
  certificate_number?: string
  issue_date?: string
  expiry_date?: string
  certificate_file?: string
  status?: string
  remark?: string
}

// 批量删除人员资质请求
export interface PersonnelQualificationBatchDeleteDto {
  personnel_ids: number[]
}

// 批量删除证书请求
export interface CertificateBatchDeleteDto {
  certificate_ids: number[]
}

// 证书统计信息
export interface CertificateStats {
  total_certificates: number
  by_category: Record<string, number>
  by_level: Record<string, number>
  expiring_soon: number
}

// 人员统计信息
export interface PersonnelStats {
  total_personnel: number
  by_department: Record<string, number>
  by_gender: Record<string, number>
  avg_age: number
  certificate_stats: CertificateStats
}

// 人员选项
export interface PersonnelOption {
  value: number
  label: string
  department?: string
  position?: string
}

// 证书选项
export interface CertificateOption {
  value: number
  label: string
  category?: string
  level?: string
  personnel_name?: string
}

// 证书类别选项
export interface CertificateCategoryOption {
  value: string
  label: string
}

// 证书级别选项
export interface CertificateLevelOption {
  value: string
  label: string
}

// 人员证书关联管理接口
export interface PersonnelCertificateAssociation {
  personnel_id: number
  certificate_id: number
  obtain_date?: string
  remark?: string
}

export interface PersonnelCertificateAssignDto {
  personnel_id: number
  certificate_ids: number[]
  obtain_date?: string
  remark?: string
}

export interface CertificatePersonnelAssignDto {
  certificate_id: number
  personnel_ids: number[]
  obtain_date?: string
  remark?: string
}

export interface PersonnelCertificateRemoveDto {
  personnel_id: number
  certificate_ids: number[]
}

export interface CertificatePersonnelRemoveDto {
  certificate_id: number
  personnel_ids: number[]
} 