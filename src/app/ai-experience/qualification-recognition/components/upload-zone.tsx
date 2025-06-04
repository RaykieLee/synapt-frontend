'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileCheck2, 
  X, 
  File,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number; // 以字节为单位
  className?: string;
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
  className
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > maxSize) {
      return false; // 文件过大
    }

    onFileSelect(file);

    // 如果是图片，创建预览
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

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
  }, []);

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload;

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      <motion.div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300',
          'hover:border-primary/50 hover:bg-accent/50 cursor-pointer',
          isDragOver && 'border-primary bg-primary/10 scale-[1.02]',
          selectedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        whileHover={{ scale: selectedFile ? 1 : 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <FileIcon className="h-16 w-16 text-primary" />
                  {selectedFile.type.startsWith('image/') && (
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
                  )}
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="font-semibold text-lg">{selectedFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
                
                {/* 文件类型标签 */}
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>
              </motion.div>

              {/* 图片预览 */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <img 
                    src={previewUrl} 
                    alt="预览" 
                    className="max-h-32 mx-auto rounded-lg shadow-md border"
                  />
                </motion.div>
              )}

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-2 justify-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  重新选择
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="file-empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                animate={{ 
                  y: isDragOver ? -5 : 0,
                  scale: isDragOver ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
                
                {/* 动态上传箭头 */}
                <AnimatePresence>
                  {isDragOver && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20, scale: 0.5 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            y: [20, -10, -30],
                            scale: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                          className="absolute top-8 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <div className="space-y-2">
                <motion.h3 
                  className="text-xl font-semibold"
                  animate={{ color: isDragOver ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
                >
                  {isDragOver ? '松开以上传文件' : '拖拽文件到此处或点击上传'}
                </motion.h3>
                <p className="text-sm text-muted-foreground">
                  支持 JPG、PNG、PDF、DOC、DOCX、TXT 格式
                </p>
                <p className="text-xs text-muted-foreground">
                  最大文件大小: {formatFileSize(maxSize)}
                </p>
              </div>

              {!isDragOver && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    选择文件
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 