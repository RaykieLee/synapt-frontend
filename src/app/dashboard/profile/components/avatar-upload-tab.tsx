"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, Upload, User, X } from "lucide-react";
import { profileApi } from "@/api/profile";
import { attachmentApi } from "@/api/attachment";
import { ProfileInfo } from "@/types/profile";

interface AvatarUploadTabProps {
  profileInfo?: ProfileInfo;
  onUpdate: () => void;
  isLoading: boolean;
}

export default function AvatarUploadTab({ profileInfo, onUpdate, isLoading }: AvatarUploadTabProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传头像
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. 上传文件到附件系统
      const attachment = await attachmentApi.upload(
        file,
        'user_avatar',
        profileInfo?.user_id,
        'avatar',
        (progress) => setUploadProgress(progress)
      );

      // 2. 更新用户头像
      const avatarUrl = attachment.file_url || attachment.preview_url;
      if (!avatarUrl) {
        throw new Error("上传失败：无法获取头像URL");
      }

      return profileApi.updateAvatar(avatarUrl);
    },
    onSuccess: () => {
      toast({
        title: "头像更新成功",
        description: "您的头像已成功更新",
      });
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploadProgress(0);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "头像更新失败",
        description: error.response?.data?.msg || error.message || "头像更新失败",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: "文件类型错误",
        description: "请选择图片文件",
        variant: "destructive",
      });
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // 生成预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>头像设置</CardTitle>
        <CardDescription>
          上传或更换您的头像图片，支持 JPG、PNG 格式，文件大小不超过 5MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 当前头像展示 */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              {profileInfo?.avatar ? (
                <img 
                  src={profileInfo.avatar} 
                  alt="当前头像" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
              <Camera className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">当前头像</h3>
            <p className="text-sm text-muted-foreground">
              {profileInfo?.avatar ? "已设置头像" : "未设置头像"}
            </p>
          </div>
        </div>

        {/* 预览新头像 */}
        {previewUrl && (
          <div className="space-y-4">
            <h4 className="text-md font-medium">预览新头像</h4>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary">
                <img 
                  src={previewUrl} 
                  alt="新头像预览" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  文件名: {selectedFile?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  文件大小: {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 上传进度 */}
        {uploadMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>上传进度</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          {!previewUrl ? (
            <Button 
              onClick={triggerFileSelect}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              选择图片
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploadMutation.isPending ? "上传中..." : "确认上传"}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={uploadMutation.isPending}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                取消
              </Button>
            </>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
