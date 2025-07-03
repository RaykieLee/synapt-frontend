"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Loader2, 
  User, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  X,
  FileImage
} from "lucide-react";
import { cn } from "@/lib/utils";

import { FaceRecognitionResult } from "@/types/face";
import { faceImageAPI } from "@/api";
import { uploadFile as uploadFileAPI } from "@/api/attachment";
import { Attachment } from "@/types/attachment";

interface FaceRecognitionTestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'recognizing' | 'success' | 'error';
  progress: number;
  uploadedImageId?: string;
  recognitionResult?: FaceRecognitionResult;
  error?: string;
}

export function FaceRecognitionTest({
  open,
  onOpenChange,
}: FaceRecognitionTestProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement }>({});

  const maxFiles = 5;
  const maxSize = 10 * 1024 * 1024; // 10MB
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    if (!acceptedTypes.includes(file.type)) {
      return '只支持 JPG、PNG 格式的图片';
    }

    return null;
  }, []);

  // 更新文件状态
  const updateFileStatus = useCallback((id: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => 
      prev.map(file => file.id === id ? { ...file, ...updates } : file)
    );
  }, []);

  // 移除文件
  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  // 上传文件
  const uploadFile = useMutation({
    mutationFn: async (file: File): Promise<Attachment> => {
      // 使用预签名URL的上传方式
      const result = await uploadFileAPI(file, 'face-test', undefined, 'attachment');
      return result;
    },
  });

  // 人脸识别
  const recognizeFace = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await faceImageAPI.recognize(imageId);
      return response;
    },
  });

  // 处理文件
  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);

    if (fileArray.length + uploadedFiles.length > maxFiles) {
      toast.error(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`文件验证失败:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // 添加文件到列表
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // 开始上传和识别流程
    for (const uploadedFile of newFiles) {
      try {
        // 上传阶段
        updateFileStatus(uploadedFile.id, { status: 'uploading', progress: 20 });
        
        const uploadResult = await uploadFile.mutateAsync(uploadedFile.file);
        updateFileStatus(uploadedFile.id, { 
          status: 'uploaded', 
          progress: 50, 
          uploadedImageId: uploadResult.id 
        });

        // 识别阶段
        updateFileStatus(uploadedFile.id, { status: 'recognizing', progress: 70 });
        
        const recognitionResponse = await recognizeFace.mutateAsync(uploadResult.id);
        const recognitionResult = recognitionResponse;
        updateFileStatus(uploadedFile.id, { 
          status: 'success', 
          progress: 100, 
          recognitionResult 
        });

        // 绘制人脸框
        setTimeout(() => drawFaceBoxes(uploadedFile.id, recognitionResult), 500);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '处理失败';
        updateFileStatus(uploadedFile.id, { 
          status: 'error', 
          error: errorMessage,
          progress: 0
        });
      }
    }
  }, [uploadedFiles.length, validateFile, uploadFile, recognizeFace, updateFileStatus]);

  // 绘制人脸框
  const drawFaceBoxes = useCallback((fileId: string, result: FaceRecognitionResult) => {
    console.log('开始绘制人脸框:', fileId, result);
    
    const canvas = canvasRefs.current[fileId];
    if (!canvas) {
      console.error('Canvas元素未找到:', fileId);
      return;
    }
    
    if (!result.faces || result.faces.length === 0) {
      console.log('没有检测到人脸或人脸数据为空');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('无法获取Canvas上下文');
      return;
    }

    const uploadedFile = uploadedFiles.find(f => f.id === fileId);
    if (!uploadedFile) {
      console.error('未找到上传文件:', fileId);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      console.log('图片加载成功, 尺寸:', img.width, 'x', img.height);
      
      // 设置canvas尺寸
      const displayWidth = 400;
      const aspectRatio = img.height / img.width;
      const displayHeight = displayWidth * aspectRatio;
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // 设置canvas样式尺寸
      canvas.style.width = displayWidth + 'px';
      canvas.style.height = displayHeight + 'px';
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      
      // 计算缩放比例
      const scaleX = displayWidth / img.width;
      const scaleY = displayHeight / img.height;
      
      console.log('缩放比例:', scaleX, scaleY);
      console.log('人脸数据:', result.faces);
      
      // 绘制人脸框
      result.faces.forEach((face, index) => {
        if (!face.face_box) {
          console.warn('人脸框数据缺失:', face);
          return;
        }
        
        const box = face.face_box;
        const x = box.left * scaleX;
        const y = box.top * scaleY;
        const width = (box.right - box.left) * scaleX;
        const height = (box.bottom - box.top) * scaleY;
        
        console.log(`绘制人脸框 ${index + 1}:`, { x, y, width, height });
        
        // 绘制矩形框
        ctx.strokeStyle = face.matches && face.matches.length > 0 ? '#10B981' : '#EF4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // 绘制标签背景
        const label = face.matches && face.matches.length > 0 
          ? `${face.matches[0].person_name} (${(face.matches[0].confidence * 100).toFixed(1)}%)`
          : `未匹配人员`;
        
        ctx.font = '14px Arial';
        const textMetrics = ctx.measureText(label);
        const labelWidth = textMetrics.width + 8;
        const labelHeight = 20;
        
        ctx.fillStyle = face.matches && face.matches.length > 0 ? '#10B981' : '#EF4444';
        ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
        
        // 绘制标签文字
        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 4, y - 6);
      });
      
      console.log('人脸框绘制完成');
    };
    
    img.onerror = (error) => {
      console.error('图片加载失败:', error);
    };
    
    console.log('设置图片源:', uploadedFile.previewUrl);
    img.src = uploadedFile.previewUrl;
  }, [uploadedFiles]);

  // 监听识别结果变化，确保绘制成功
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    uploadedFiles.forEach(file => {
      if (file.status === 'success' && file.recognitionResult) {
        // 延迟绘制，确保DOM完全渲染
        const timer = setTimeout(() => {
          drawFaceBoxes(file.id, file.recognitionResult!);
        }, 200);
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [uploadedFiles, drawFaceBoxes]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleUploadAreaClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleClose = () => {
    // 清理预览URL
    uploadedFiles.forEach(file => {
      URL.revokeObjectURL(file.previewUrl);
    });
    setUploadedFiles([]);
    setIsDragOver(false);
    onOpenChange(false);
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
      case 'recognizing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <FileImage className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case 'pending':
        return '等待处理';
      case 'uploading':
        return '上传中...';
      case 'uploaded':
        return '上传完成';
      case 'recognizing':
        return '识别中...';
      case 'success':
        return `识别完成 - 检测到 ${file.recognitionResult?.face_count || 0} 个人脸`;
      case 'error':
        return `失败: ${file.error}`;
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            人脸识别测试
          </DialogTitle>
          <DialogDescription>
            上传图片测试人脸识别功能，系统会自动检测图片中的人脸并匹配已注册的人员信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4">
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
                  "拖拽图片到此处，或点击选择图片"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG 格式，单个文件最大 {Math.round(maxSize / 1024 / 1024)}MB，最多 {maxFiles} 个文件
              </p>
            </CardContent>
          </Card>

          {/* 处理结果列表 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">识别结果</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="p-4">
                    <div className="space-y-3">
                      {/* 文件信息头部 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(file.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file.size)} • {getStatusText(file)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="w-6 h-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* 进度条 */}
                      {['uploading', 'recognizing'].includes(file.status) && (
                        <Progress value={file.progress} className="h-1" />
                      )}

                      {/* 图片预览和识别结果 */}
                      {file.status === 'success' && file.recognitionResult && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 图片预览区域 */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">图片预览（含人脸框）</p>
                            <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                              <canvas
                                ref={(el) => {
                                  if (el) canvasRefs.current[file.id] = el;
                                }}
                                className="max-w-full h-auto"
                              />
                            </div>
                          </div>

                          {/* 识别详情 */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">识别详情</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>检测状态:</span>
                                <span className={file.recognitionResult.success ? "text-green-600" : "text-red-600"}>
                                  {file.recognitionResult.success ? "成功" : "失败"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>检测到人脸:</span>
                                <span>{file.recognitionResult.face_count || 0} 个</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>匹配到人员:</span>
                                <span>
                                  {file.recognitionResult.faces.filter(f => f.matches && f.matches.length > 0).length} 个
                                </span>
                              </div>
                              
                              {/* 匹配人员列表 */}
                              {file.recognitionResult.faces.some(f => f.matches && f.matches.length > 0) && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-medium">匹配人员:</p>
                                  {file.recognitionResult.faces.map((face, faceIndex) => 
                                    face.matches && face.matches.length > 0 ? (
                                      <div key={faceIndex} className="space-y-1">
                                        {face.matches.slice(0, 2).map((match, matchIndex) => (
                                          <div key={matchIndex} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                                            <div className="flex items-center gap-1">
                                              <User className="h-3 w-3 text-muted-foreground" />
                                              <span className="font-medium">{match.person_name}</span>
                                              <span className="text-muted-foreground">({match.person_id})</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs text-white ${
                                              match.confidence >= 0.9 ? "bg-green-500" :
                                              match.confidence >= 0.8 ? "bg-yellow-500" :
                                              match.confidence >= 0.7 ? "bg-orange-500" : "bg-red-500"
                                            }`}>
                                              {(match.confidence * 100).toFixed(1)}%
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 错误信息 */}
                      {file.status === 'error' && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                          {file.error}
                        </div>
                      )}
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
  );
} 