// 标书人员资质识别相关API服务

import { apiRequest } from "@/lib/api";

// 证书要求接口
export interface CertificateRequirement {
  证书名称?: string;
  证书类型?: string;
  证书等级?: string;
}

// 学历要求接口
export interface EducationRequirement {
  学历: string;
  专业?: string[];
  最少数量?: number;
}

// 负责人要求接口
export interface LeaderRequirement {
  评分: number;
  所需工作经验年限?: number;
  学历要求?: EducationRequirement;
  证书要求?: CertificateRequirement[];
}

// 团队整体要求接口
export interface TeamOverallRequirement {
  评分: number;
  证书要求: CertificateRequirement[];
  持有证书的最小比例: number;
  最低人数要求: number;
  所需工作经验年限: number;
}

// 团队要求接口
export interface TeamRequirement {
  学历要求: Array<{
    评分: number;
    学历: string;
    最少数量: number;
  }>;
  整体要求: TeamOverallRequirement[];
}

// 标书人员要求结构
export interface TenderRequirement {
  负责人要求: LeaderRequirement[];
  团队要求: TeamRequirement;
}

// 人员资质信息接口（用于识别结果展示）
export interface PersonQualification {
  name: string;
  id_card: string;
  education: string;
  major: string;
  work_experience: string;
  certifications: string[];
  position: string;
  company: string;
  project_experience: string[];
  skills: string[];
  confidence: number;
}

// 识别结果接口
export interface RecognitionResult {
  success: boolean;
  data: PersonQualification[];
  message?: string;
  processing_time: number;
  tender_requirements?: TenderRequirement; // 可选的标书要求结构
}

// 文件上传参数
export interface FileUploadParams {
  attachment_id: string; // 改为接收附件ID
}

// 文本识别参数
export interface TextRecognitionParams {
  text: string;
}

/**
 * 文件上传识别人员资质
 * @param params 文件上传参数
 */
export const recognizeFileQualification = async (params: FileUploadParams): Promise<RecognitionResult> => {
  return apiRequest<RecognitionResult>(
    '/api/v1/ai/qualification/recognize/file', 
    'POST', 
    { attachment_id: params.attachment_id },
    { timeout: 2000000 } // 2分钟超时
  );
};

/**
 * 文本识别人员资质
 * @param params 文本识别参数
 */
export const recognizeTextQualification = async (params: TextRecognitionParams): Promise<RecognitionResult> => {
  // AI文本处理也需要较长时间，设置1分钟超时
  return apiRequest<RecognitionResult>(
    '/api/v1/ai/qualification/recognize/text', 
    'POST', 
    params,
    { timeout: 60000 } // 1分钟超时
  );
};

/**
 * 获取示例图片列表
 */
export const getExampleImages = async (): Promise<string[]> => {
  return apiRequest<string[]>('/api/v1/ai/qualification/examples', 'GET');
};

/**
 * 获取支持的文件格式
 */
export const getSupportedFormats = async (): Promise<string[]> => {
  return apiRequest<string[]>('/api/v1/ai/qualification/formats', 'GET');
}; 