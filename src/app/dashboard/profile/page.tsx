"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/api/profile";
import ProfileInfoSection from "./components/profile-info-section";
import AvatarSection from "./components/avatar-section";
import PasswordChangeDialog from "./components/password-change-dialog";

export default function ProfilePage() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // 获取个人信息
  const { data: profileResponse, isLoading, refetch } = useQuery({
    queryKey: ["profile", "info"],
    queryFn: () => profileApi.getInfo(),
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  const profileInfo = profileResponse;

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">个人中心</h2>
            <p className="text-muted-foreground">
              管理您的个人信息、头像和账户设置
            </p>
          </div>
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                修改密码
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>修改密码</DialogTitle>
              </DialogHeader>
              <PasswordChangeDialog onSuccess={() => setPasswordDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 头像设置 */}
          <AvatarSection
            profileInfo={profileInfo}
            onUpdate={refetch}
            isLoading={isLoading}
          />

          {/* 基本信息 */}
          <ProfileInfoSection
            profileInfo={profileInfo}
            onUpdate={refetch}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
