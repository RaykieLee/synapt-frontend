'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileCheck2, 
  X, 
  File,
  Image as ImageIcon,
  FileText,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { attachmentApi } from '@/api/attachment';
import { Attachment } from '@/types/attachment';

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number; // 以字节为单位
  className?: string;
  onExampleSelect?: (attachment: Attachment) => void; // 新增：选择示例的回调
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function UploadZone({
  onFileSelect,
  selectedFile,
  accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.txt',
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  onExampleSelect
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [examplePreviews, setExamplePreviews] = useState<Record<string, string>>({});
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [previewExampleImage, setPreviewExampleImage] = useState<{url: string; name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 查询示例附件
  const { data: exampleAttachments = [], isLoading: isLoadingExamples } = useQuery({
    queryKey: ['attachments', 'examples', 'qualification-recognition-attachments'],
    queryFn: async () => {
      try {
        // 使用附件列表查询API，通过entity_code过滤
        const query = {
          page_num: 1,
          page_size: 20,
          sorts: [{ field: "created_at", order: "desc" as const }],
          params: { 
            entity_code: 'qualification-recognition-attachments',
            search_mode: "and" as const 
          }
        };
        const response = await attachmentApi.getList(query);
        return response.list || [];
      } catch (error) {
        console.error('获取示例附件失败:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 为图片类型的附件获取预览URL
  useEffect(() => {
    const loadImagePreviews = async () => {
      for (const attachment of exampleAttachments) {
        if (attachment.mime_type.startsWith('image/') && !examplePreviews[attachment.id]) {
          try {
            const previewUrl = await attachmentApi.getPreviewUrl(attachment.id);
            setExamplePreviews(prev => ({
              ...prev,
              [attachment.id]: previewUrl
            }));
          } catch (error) {
            console.error('获取预览图片失败:', attachment.file_name, error);
          }
        }
      }
    };

    if (exampleAttachments.length > 0) {
      loadImagePreviews();
    }
  }, [exampleAttachments, examplePreviews]);

  // 监听selectedFile变化，自动更新预览
  useEffect(() => {
    if (selectedFile) {
      // 如果是图片，创建预览
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        
        // 清理之前的URL
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
      setIsImageExpanded(false); // 重置展开状态
    }
  }, [selectedFile]);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > maxSize) {
      return false; // 文件过大
    }

    onFileSelect(file);
    return true;
  }, [onFileSelect, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // 调用onFileSelect通知父组件清除选中文件
    onFileSelect(null);
  }, [onFileSelect]);

  const handleExampleClick = useCallback((attachment: Attachment) => {
    if (onExampleSelect) {
      onExampleSelect(attachment);
    }
  }, [onExampleSelect]);

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 文件上传区域 */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <motion.div
          className={cn(
            'border-2 border-dashed rounded-lg transition-all duration-300',
            'hover:border-primary/50 hover:bg-accent/50',
            isDragOver && 'border-primary bg-primary/10 scale-[1.02]',
            selectedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 cursor-pointer',
            // 根据图片展开状态调整padding和高度
            selectedFile && isImageExpanded ? 'p-8 min-h-[500px]' : 'p-12 min-h-[400px]'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          whileHover={{ scale: selectedFile ? 1 : 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            minHeight: selectedFile && isImageExpanded && selectedFile.type.startsWith('image/') ? '500px' : '400px'
          }}
        >
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "text-center flex flex-col items-center justify-center h-full",
                  isImageExpanded && selectedFile.type.startsWith('image/') ? "space-y-4" : "space-y-6"
                )}
              >
                {selectedFile.type.startsWith('image/') && previewUrl ? (
                  // 图片文件布局
                  <div className={cn(
                    "flex flex-col h-full",
                    isImageExpanded ? "justify-between py-6" : "justify-center space-y-4"
                  )}>
                    <div className={cn(
                      "flex items-center justify-center",
                      isImageExpanded ? "flex-1 mb-8" : ""
                    )}>
                      <motion.div
                        className="relative cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImageExpanded(!isImageExpanded);
                        }}
                        animate={{
                          scale: isImageExpanded ? 1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={previewUrl}
                          alt="预览"
                          width={isImageExpanded ? 460 : 160}
                          height={isImageExpanded ? 460 : 160}
                          className={cn(
                            "object-contain rounded-lg shadow-md border group-hover:opacity-80 transition-all duration-300",
                            isImageExpanded ? "max-w-full max-h-[460px] w-auto h-auto" : "h-40 w-40 object-cover"
                          )}
                          unoptimized
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute -top-2 -right-2"
                        >
                          <Badge variant="secondary" className="text-xs">
                            IMG
                          </Badge>
                        </motion.div>
                        {/* 悬停时显示放大/缩小图标 */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
                        >
                          <div className="flex flex-col items-center gap-1 text-white">
                            <Eye className="h-6 w-6" />
                            <span className="text-xs font-medium">
                              {isImageExpanded ? "收起" : "展开"}
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    {/* 文件信息和按钮的组合容器 */}
                    <motion.div
                      className="space-y-4"
                      animate={{
                        height: isImageExpanded ? "auto" : "auto"
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      {/* 文件信息 - 展开时隐藏 */}
                      <AnimatePresence mode="wait">
                        {!isImageExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="space-y-3 text-center overflow-hidden"
                          >
                            <h3 className="font-semibold text-xl">{selectedFile.name}</h3>
                            <p className="text-base text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </p>
                            
                            {/* 文件类型标签 */}
                            <div className="flex justify-center">
                              <Badge variant="outline" className="text-sm">
                                {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                              </Badge>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 操作按钮 */}
                      <motion.div
                        key="image-buttons"
                        initial={false}
                        animate={{ 
                          opacity: 1,
                          y: 0
                        }}
                        transition={{ 
                          duration: 0.5,
                          ease: "easeInOut"
                        }}
                        className="flex gap-2 justify-center w-full"
                        style={{ minHeight: '40px' }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="flex items-center gap-1 min-w-[100px]"
                        >
                          <X className="h-3 w-3" />
                          移除文件
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1 min-w-[100px]"
                        >
                          <Upload className="h-3 w-3" />
                          重新选择
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                ) : (
                  // 非图片文件布局
                  <div className="space-y-6">
                    <div className="flex items-center justify-center">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <FileIcon className="h-20 w-20 text-primary" />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute -top-2 -right-2"
                        >
                          <Badge variant="secondary" className="text-xs">
                            FILE
                          </Badge>
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <h3 className="font-semibold text-xl">{selectedFile.name}</h3>
                      <p className="text-base text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      
                      {/* 文件类型标签 */}
                      <div className="flex justify-center">
                        <Badge variant="outline" className="text-sm">
                          {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </div>
                    </motion.div>

                    {/* 操作按钮 */}
                    <motion.div
                      key="file-buttons"
                      initial={false}
                      animate={{ 
                        opacity: 1,
                        y: 0
                      }}
                      transition={{ 
                        duration: 0.6,
                        ease: "easeInOut",
                        delay: 0.2
                      }}
                      className="flex gap-2 justify-center w-full"
                      style={{ minHeight: '40px' }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="flex items-center gap-1 min-w-[100px]"
                      >
                        <X className="h-3 w-3" />
                        移除文件
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="flex items-center gap-1 min-w-[100px]"
                      >
                        <Upload className="h-3 w-3" />
                        重新选择
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="file-empty"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center h-full space-y-6"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
                </motion.div>
                
                <div className="space-y-3 text-center">
                  <h3 className="text-2xl font-semibold">上传文件</h3>
                  <p className="text-base text-muted-foreground">
                    拖拽文件到此处，或点击选择文件
                  </p>
                  <p className="text-sm text-muted-foreground">
                    支持 JPG、PNG、PDF、DOC、DOCX、TXT 格式，最大 {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 示例附件区域 - 根据文件选择状态显示/隐藏，带动画 */}
      <AnimatePresence>
        {!selectedFile && exampleAttachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-muted-foreground">示例文档</h4>
              <span className="text-xs text-muted-foreground ml-auto">点击任意示例文档可以直接使用该文件进行识别，无需重新上传</span>
            </div>
            
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {exampleAttachments.map((attachment, index) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-muted">
                    <CardContent className="p-0">
                      {attachment.mime_type.startsWith('image/') ? (
                        // 图片类型：直接用缩略图填满整个卡片
                        <div 
                          className="aspect-square relative"
                          onClick={() => handleExampleClick(attachment)}
                          onDoubleClick={() => {
                            if (examplePreviews[attachment.id]) {
                              setPreviewExampleImage({
                                url: examplePreviews[attachment.id],
                                name: attachment.file_name
                              });
                            }
                          }}
                        >
                          {examplePreviews[attachment.id] ? (
                            <Image
                              src={examplePreviews[attachment.id]}
                              alt={attachment.file_name}
                              fill
                              style={{ objectFit: 'cover' }}
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground animate-pulse" />
                            </div>
                          )}
                          
                          {/* hover时显示操作提示 */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <div className="flex flex-col items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <p className="text-xs font-medium text-center px-2">
                                点击选择
                              </p>
                              <p className="text-xs opacity-80 text-center px-2">
                                双击预览
                              </p>
                            </div>
                            <p className="text-xs font-medium text-center px-2 truncate max-w-full mt-2">
                              {attachment.file_name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // 其他文件类型：保持图标+文件名布局
                        <div className="p-2" onClick={() => handleExampleClick(attachment)}>
                          <div className="aspect-square relative mb-1">
                            <div className="w-full h-full bg-blue-50 dark:bg-blue-950/20 rounded-md flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              {(() => {
                                const IconComponent = getFileIcon(attachment.mime_type);
                                return <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
                              })()}
                            </div>
                            
                            {/* hover时显示查看图标 */}
                            <div className="absolute inset-0 bg-black/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          
                          {/* 文件名 */}
                          <p className="text-xs font-medium truncate text-center group-hover:text-primary transition-colors">
                            {attachment.file_name}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      

      {/* 示例图片预览模态框 */}
      <AnimatePresence>
        {previewExampleImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreviewExampleImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 text-black dark:text-white"
                onClick={() => setPreviewExampleImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {/* 图片 */}
              <Image
                src={previewExampleImage.url}
                alt={previewExampleImage.name}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg shadow-2xl"
                unoptimized
              />
              
              {/* 文件信息 */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-3 rounded-lg">
                <h3 className="font-semibold text-lg truncate">{previewExampleImage.name}</h3>
                <p className="text-sm opacity-80">示例文档</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 