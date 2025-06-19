"use client"

import React, { useState, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadFile } from '@/api/attachment'
import type { UploadingFile, UploadStatus, Attachment } from '@/types/attachment'

interface AttachmentUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 场景配置
const SCENE_OPTIONS = [
  { value: 'attachment', label: '附件', description: '普通附件文件' },
  { value: 'avatar', label: '头像', description: '用户头像图片' },
  { value: 'alert', label: '告警', description: '告警相关文件' }
]

export function AttachmentUpload({
  open,
  onOpenChange,
}: AttachmentUploadProps) {
  const [entityCode, setEntityCode] = useState('system')
  const [entityId, setEntityId] = useState<number | undefined>(undefined)
  const [scene, setScene] = useState('attachment')
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const maxFiles = 10
  const maxSize = 100 * 1024 * 1024 // 100MB
  
  // 根据场景调整文件类型限制
  const getAcceptedTypesForScene = (scene: string) => {
    switch (scene) {
      case 'avatar':
        return ['image/*']
      case 'alert':
        return ['image/*', 'application/pdf', '.txt', '.log']
      case 'attachment':
      default:
        return ['image/*', 'application/pdf', '.docx', '.xlsx', '.txt', '.csv', '.zip']
    }
  }
  
  const acceptedTypes = getAcceptedTypesForScene(scene)

  const updateFileStatus = useCallback((id: string, updates: Partial<UploadingFile>) => {
    setUploadingFiles(prev => 
      prev.map(file => file.id === id ? { ...file, ...updates } : file)
    )
  }, [])

  const removeFile = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(file => file.id !== id))
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize) {
      return `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`
    }

    // 检查文件类型
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', ''))
      }
      return file.type === type
    })

    if (!isValidType) {
      return '不支持的文件类型'
    }

    return null
  }, [maxSize, acceptedTypes])

  const uploadSingleFile = useCallback(async (file: File) => {
    const fileId = `${Date.now()}-${Math.random()}`
    
    const uploadingFile: UploadingFile = {
      id: fileId,
      file,
      status: 'pending',
      progress: { loaded: 0, total: file.size, percentage: 0 }
    }

    setUploadingFiles(prev => [...prev, uploadingFile])

    try {
      updateFileStatus(fileId, { status: 'uploading' })

      const result = await uploadFile(
        file,
        entityCode,
        entityId,
        scene, // 传递场景参数
        (progress) => {
          updateFileStatus(fileId, {
            progress: {
              loaded: (file.size * progress) / 100,
              total: file.size,
              percentage: progress
            }
          })
        }
      )

      updateFileStatus(fileId, { 
        status: 'success',
        attachment_id: result.id,
        progress: { loaded: file.size, total: file.size, percentage: 100 }
      })

      toast.success(`文件 "${file.name}" 上传成功`)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      updateFileStatus(fileId, { 
        status: 'error', 
        error: errorMessage 
      })
      toast.error(`文件 "${file.name}" 上传失败: ${errorMessage}`)
      throw error
    }
  }, [entityCode, entityId, scene, updateFileStatus])

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)

    // 检查文件数量限制
    if (fileArray.length + uploadingFiles.length > maxFiles) {
      toast.error(`最多只能上传 ${maxFiles} 个文件`)
      return
    }

    // 验证文件
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      toast.error(`文件验证失败:\n${invalidFiles.join('\n')}`)
    }

    if (validFiles.length === 0) return

    const uploadPromises = validFiles.map(uploadSingleFile)
    
    try {
      const results = await Promise.allSettled(uploadPromises)
      const successfulUploads = results.filter(result => result.status === 'fulfilled').length

      if (successfulUploads > 0) {
        // 刷新附件列表
        queryClient.invalidateQueries({ queryKey: ['attachments', 'list'] })
        toast.success(`成功上传 ${successfulUploads} 个文件`)
      }
    } catch (error) {
      console.error('批量上传失败:', error)
    }
  }, [uploadingFiles.length, validateFile, uploadSingleFile, queryClient])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const handleUploadAreaClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleClose = () => {
    setUploadingFiles([])
    setEntityCode('system')
    setEntityId(undefined)
    setScene('attachment')
    setIsDragOver(false)
    onOpenChange(false)
  }

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const currentSceneOption = SCENE_OPTIONS.find(option => option.value === scene)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>上传附件</DialogTitle>
          <DialogDescription>
            支持拖拽上传多个文件。不同场景支持不同的文件类型。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4">
          {/* 配置区域 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scene">上传场景 *</Label>
              <Select value={scene} onValueChange={setScene}>
                <SelectTrigger>
                  <SelectValue placeholder="选择上传场景" />
                </SelectTrigger>
                <SelectContent>
                  {SCENE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entityCode">实体代码 *</Label>
              <Input
                id="entityCode"
                value={entityCode}
                onChange={(e) => setEntityCode(e.target.value)}
                placeholder="例如：system、user、project"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entityId">实体ID</Label>
            <Input
              id="entityId"
              type="number"
              value={entityId || ""}
              onChange={(e) => setEntityId(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="可选，关联的实体ID"
            />
          </div>

          {/* 场景说明 */}
          {currentSceneOption && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>{currentSceneOption.label}场景</strong>: {currentSceneOption.description}
              <br />
              支持文件类型: {acceptedTypes.join(', ')}
            </div>
          )}

          {/* 上传区域 */}
          <Card 
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer",
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {isDragOver ? (
                  "释放文件以开始上传..."
                ) : (
                  "拖拽文件到此处，或点击选择文件"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentSceneOption?.label}场景，单个文件最大 {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </CardContent>
          </Card>

          {/* 上传列表 */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">上传进度</h4>
              <div className="max-h-60 overflow-auto space-y-2">
                {uploadingFiles.map((file) => (
                  <Card key={file.id} className="p-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{file.file.name}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.file.size)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="w-6 h-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={file.progress.percentage} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {file.progress.percentage}% - {formatFileSize(file.progress.loaded)} / {formatFileSize(file.progress.total)}
                            </p>
                          </div>
                        )}
                        
                        {file.status === 'error' && file.error && (
                          <p className="text-xs text-red-500 mt-1">{file.error}</p>
                        )}
                        
                        {file.status === 'success' && (
                          <p className="text-xs text-green-500 mt-1">上传完成</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 