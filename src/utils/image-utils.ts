/**
 * 图片预览相关工具函数
 */

import { attachmentApi } from "@/api/attachment"

/**
 * 获取图片预览URL
 * @param imageId 图片附件ID
 * @returns 预览URL
 */
export const getImagePreviewUrl = async (imageId: string): Promise<string> => {
  try {
    return await attachmentApi.getPreviewUrl(imageId)
  } catch (error) {
    console.error('获取图片预览URL失败:', imageId, error)
    throw error
  }
}

/**
 * 生成直接预览URL（用于img标签的src）
 * 注意：这个URL需要身份验证，可能在某些情况下无法直接使用
 * @param imageId 图片附件ID
 * @returns 直接预览URL
 */
export const getDirectPreviewUrl = (imageId: string): string => {
  return `/api/v1/system/attachments/${imageId}/preview`
}

/**
 * 在新窗口打开图片预览
 * @param imageId 图片附件ID
 */
export const openImagePreview = async (imageId: string): Promise<void> => {
  try {
    const previewUrl = await getImagePreviewUrl(imageId)
    window.open(previewUrl, '_blank')
  } catch (error) {
    console.error('打开图片预览失败:', error)
    throw error
  }
}

/**
 * 检查是否为图片类型
 * @param mimeType MIME类型
 * @returns 是否为图片
 */
export const isImageType = (mimeType: string): boolean => {
  return mimeType.startsWith('image/')
}

/**
 * 批量预加载图片URL
 * @param imageIds 图片ID数组
 * @returns 图片ID到URL的映射
 */
export const preloadImageUrls = async (imageIds: string[]): Promise<Record<string, string>> => {
  const urlMap: Record<string, string> = {}
  
  await Promise.allSettled(
    imageIds.map(async (imageId) => {
      try {
        const url = await getImagePreviewUrl(imageId)
        urlMap[imageId] = url
      } catch (error) {
        console.error(`预加载图片失败: ${imageId}`, error)
      }
    })
  )
  
  return urlMap
} 