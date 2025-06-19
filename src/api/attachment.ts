import { apiRequest } from "@/lib/api";
import type { 
  Attachment, 
  AttachmentListResponse, 
  AttachmentQuery, 
  AttachmentStats,
  AttachmentBatchDelete,
  PresignedUrlRequest,
  PresignedUrlResponse,
  UploadConfirmRequest,
  DownloadUrlResponse
} from '@/types/attachment'

// 获取附件列表
export const getAttachmentList = async (query: AttachmentQuery) => {
  return apiRequest<AttachmentListResponse>('/api/v1/system/attachments/list', 'POST', query)
}

// 获取附件详情
export const getAttachment = async (id: string) => {
  return apiRequest<Attachment>(`/api/v1/system/attachments/${id}`, 'GET')
}

// 生成上传预签名URL
export const generateUploadPresignedUrl = async (request: PresignedUrlRequest) => {
  return apiRequest<PresignedUrlResponse>('/api/v1/system/attachments/presigned-url', 'POST', request)
}

// 直接上传到MinIO（使用预签名URL）
export const uploadToMinio = async (
  uploadUrl: string,
  fields: Record<string, any>,
  file: File,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData()
  
  // 先添加所有的字段
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value)
  })
  
  // 最后添加文件
  formData.append('file', file)

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('POST', uploadUrl)
    xhr.send(formData)
  })
}

// 确认上传完成
export const confirmUpload = async (request: UploadConfirmRequest) => {
  return apiRequest<Attachment>('/api/v1/system/attachments/confirm-upload', 'POST', request)
}

// 生成下载预签名URL
export const generateDownloadPresignedUrl = async (attachmentId: string) => {
  return apiRequest<DownloadUrlResponse>(`/api/v1/system/attachments/${attachmentId}/download-url`, 'GET')
}

// 完整的上传流程（封装函数）
export const uploadFile = async (
  file: File,
  entityCode: string,
  entityId?: number,
  scene: string = 'attachment',
  onProgress?: (progress: number) => void
): Promise<Attachment> => {
  try {
    // 1. 生成预签名URL
    const presignedResult = await generateUploadPresignedUrl({
      filename: file.name,
      content_type: file.type,
      entity_code: entityCode,
      entity_id: entityId,
      scene: scene
    })

    // 2. 根据方法类型选择上传方式
    if (presignedResult.method === 'PUT') {
      // 使用PUT方法直接上传
      await uploadWithPut(presignedResult.upload_url, file, onProgress)
    } else {
      // 使用POST方法上传（带表单字段）
      await uploadToMinio(
        presignedResult.upload_url,
        presignedResult.fields,
        file,
        onProgress
      )
    }

    // 3. 确认上传完成
    const confirmResult = await confirmUpload({
      attachment_id: presignedResult.attachment_id,
      file_size: file.size
    })

    return confirmResult
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

// PUT方法上传
const uploadWithPut = async (
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}

// 删除附件
export const deleteAttachment = async (id: string) => {
  return apiRequest<void>(`/api/v1/system/attachments/${id}`, 'DELETE')
}

// 批量删除附件
export const batchDeleteAttachments = async (data: AttachmentBatchDelete) => {
  return apiRequest<void>('/api/v1/system/attachments/batch-delete', 'POST', data)
}

// 根据实体获取附件列表
export const getAttachmentsByEntity = async (entityCode: string, entityId: number) => {
  return apiRequest<Attachment[]>(`/api/v1/system/attachments/entity/${entityCode}/${entityId}`, 'GET')
}

// 获取附件统计信息
export const getAttachmentStats = async () => {
  return apiRequest<AttachmentStats>('/api/v1/system/attachments/stats/overview', 'GET')
}

// 下载文件（通过预签名URL）
export const downloadFile = async (attachmentId: string, fileName: string) => {
  try {
    // 生成下载URL
    const urlResult = await generateDownloadPresignedUrl(attachmentId)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = urlResult.download_url
    link.download = fileName
    link.target = '_blank'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// 获取附件预览URL
export const getAttachmentPreviewUrl = async (attachmentId: string) => {
  try {
    const urlResult = await apiRequest<DownloadUrlResponse>(`/api/v1/system/attachments/${attachmentId}/preview-url`, 'GET')
    return urlResult.download_url
  } catch (error) {
    console.error('Get preview URL failed:', error)
    throw error
  }
}

// 下载文件（简化版本，自动获取文件名）
export const downloadAttachment = async (attachmentId: string) => {
  try {
    // 先获取附件详情来获取文件名
    const attachment = await getAttachment(attachmentId)
    await downloadFile(attachmentId, attachment.file_name)
  } catch (error) {
    console.error('Download attachment failed:', error)
    throw error
  }
}

// 附件API对象（与其他API保持一致的导出方式）
export const attachmentApi = {
  getList: getAttachmentList,
  getDetail: getAttachment,
  generatePresignedUrl: generateUploadPresignedUrl,
  confirmUpload,
  generateDownloadUrl: generateDownloadPresignedUrl,
  upload: uploadFile,
  delete: deleteAttachment,
  batchDelete: batchDeleteAttachments,
  getByEntity: getAttachmentsByEntity,
  getStats: getAttachmentStats,
  download: downloadAttachment,
  downloadWithFileName: downloadFile,
  getPreviewUrl: getAttachmentPreviewUrl
} 