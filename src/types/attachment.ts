/**
 * 附件管理相关类型定义
 */

// 附件基础接口
export interface Attachment {
  id: string
  file_name: string
  storage_path: string
  bucket_name: string
  mime_type: string
  file_size: number
  uploader_id?: number
  uploader_name?: string
  entity_id?: number
  entity_code: string
  status: string
  created_at: string
  updated_at: string
}

// 附件创建参数
export interface AttachmentCreate {
  file_name: string
  storage_path: string
  bucket_name: string
  mime_type: string
  file_size: number
  entity_id?: number
  entity_code: string
  uploader_id?: number
}

// 附件更新参数
export interface AttachmentUpdate {
  file_name?: string
  entity_id?: number
  entity_code?: string
}

// 附件上传参数
export interface AttachmentUpload {
  entity_code: string
  entity_id?: number
}

// 排序参数
export interface AttachmentSortParam {
  field: string
  order: 'asc' | 'desc'
}

// 关键词搜索参数
export interface AttachmentKeywords {
  file_name?: string
  mime_type?: string
}

// 查询参数
export interface AttachmentQueryParams {
  keywords?: AttachmentKeywords
  entity_code?: string
  uploader_id?: number
  bucket_name?: string
  search_mode?: 'and' | 'or'
}

// 附件查询
export interface AttachmentQuery {
  page_num: number
  page_size: number
  sorts?: AttachmentSortParam[]
  params?: AttachmentQueryParams
}

// 附件列表响应
export interface AttachmentListResponse {
  list: Attachment[]
  total: number
  page_num: number
  page_size: number
  pages: number
}

// 批量删除请求
export interface AttachmentBatchDelete {
  attachment_ids: string[]
}

// 附件统计信息
export interface AttachmentStats {
  total_count: number
  total_size: number
  by_type: Record<string, number>
  by_entity: Record<string, number>
  by_scene: Record<string, number>
  recent_uploads: Attachment[]
}

// 文件类型映射
export const FILE_TYPE_ICONS: Record<string, string> = {
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'text/plain': '📋',
  'text/csv': '📊',
  'application/zip': '📦',
  'application/x-zip-compressed': '📦',
  'application/rar': '📦',
  'video/mp4': '🎥',
  'video/avi': '🎥',
  'audio/mp3': '🎵',
  'audio/wav': '🎵'
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件类型图标
export function getFileTypeIcon(mimeType: string): string {
  return FILE_TYPE_ICONS[mimeType] || '📄'
}

// 检查是否为图片类型
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// 检查是否为视频类型
export function isVideoType(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

// 检查是否为音频类型
export function isAudioType(mimeType: string): boolean {
  return mimeType.startsWith('audio/')
}

// 预签名URL请求
export interface PresignedUrlRequest {
  filename: string
  content_type: string
  entity_code: string
  entity_id?: number
  scene: string
}

// 预签名URL响应
export interface PresignedUrlResponse {
  attachment_id: string
  upload_url: string
  fields: Record<string, any>
  object_name: string
  bucket_name: string
  method?: string
}

// 上传确认请求
export interface UploadConfirmRequest {
  attachment_id: string
  file_size: number
}

// 下载URL响应
export interface DownloadUrlResponse {
  download_url: string
  filename: string
  file_size: number
  content_type: string
}

// 上传进度
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// 上传中的文件信息
export interface UploadingFile {
  id: string
  file: File
  status: UploadStatus
  progress: UploadProgress
  error?: string
  attachment_id?: string
}

// 上传状态
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

// 实体附件请求
export interface EntityAttachmentRequest {
  entity_code: string
  entity_id: number
  scene?: string
} 