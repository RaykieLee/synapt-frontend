"use client";

import { useState, useRef } from "react";
import Image from 'next/image';
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, Upload, User, X, Edit } from "lucide-react";
import { profileApi } from "@/api/profile";
import { attachmentApi } from "@/api/attachment";
import { ProfileInfo } from "@/types/profile";
import AvatarImage from "@/components/ui/avatar-image";

interface AvatarSectionProps {
  profileInfo?: ProfileInfo;
  onUpdate: () => void;
  isLoading: boolean;
}

export default function AvatarSection({ profileInfo, onUpdate, isLoading }: AvatarSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
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

      // 2. 使用storage_path作为头像路径（不使用完整URL）
      const avatarPath = attachment.storage_path;

      if (!avatarPath) {
        throw new Error("上传失败：无法获取头像路径");
      }

      // 3. 更新用户头像（只存储路径）
      return profileApi.updateAvatar(avatarPath);
    },
    onSuccess: () => {
      toast({
        title: "头像更新成功",
        description: "您的头像已成功更新",
      });
      handleCancel();
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
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              头像设置
            </CardTitle>
            <CardDescription>
              点击头像即可更换，支持 JPG、PNG 格式，文件大小不超过 5MB
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 头像展示和编辑 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-border cursor-pointer transition-all hover:border-primary"
              onClick={handleEdit}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="新头像预览"
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              ) : profileInfo?.avatar ? (
                <AvatarImage
                  avatarPath={profileInfo.avatar}
                  alt="当前头像"
                  className="w-full h-full object-cover"
                  fallbackClassName="h-16 w-16 text-muted-foreground"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors" onClick={handleEdit}>
              <Edit className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium">
              {profileInfo?.nick_name || profileInfo?.user_name || "用户"}
            </h3>
            <p className="text-sm text-muted-foreground">
              点击头像更换图片
            </p>
          </div>
        </div>

        {/* 预览信息 */}
        {selectedFile && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="text-sm font-medium">选择的文件：</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>文件名: {selectedFile.name}</p>
              <p>文件大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
        {selectedFile && (
          <div className="flex items-center gap-3 justify-center">
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
          </div>
        )}

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
