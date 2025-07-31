"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Save, Edit, X, User, Settings } from "lucide-react";
import { profileApi } from "@/api/profile";
import { ProfileInfo, ProfileUpdateDto, GENDER_OPTIONS, PROFILE_VALIDATION } from "@/types/profile";

// 表单验证schema
const profileSchema = z.object({
  nick_name: z.string().max(PROFILE_VALIDATION.nick_name.maxLength, PROFILE_VALIDATION.nick_name.message).optional(),
  email: z.string().email(PROFILE_VALIDATION.email.message).optional().or(z.literal("")),
  phonenumber: z.string().regex(PROFILE_VALIDATION.phonenumber.pattern, PROFILE_VALIDATION.phonenumber.message).optional().or(z.literal("")),
  sex: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileInfoSectionProps {
  profileInfo?: ProfileInfo;
  onUpdate: () => void;
  isLoading: boolean;
}

export default function ProfileInfoSection({ profileInfo, onUpdate, isLoading }: ProfileInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nick_name: profileInfo?.nick_name || "",
      email: profileInfo?.email || "",
      phonenumber: profileInfo?.phonenumber || "",
      sex: profileInfo?.sex || "",
    },
  });

  // 重置表单数据
  const resetForm = () => {
    form.reset({
      nick_name: profileInfo?.nick_name || "",
      email: profileInfo?.email || "",
      phonenumber: profileInfo?.phonenumber || "",
      sex: profileInfo?.sex || "",
    });
  };

  // 更新个人信息
  const updateMutation = useMutation({
    mutationFn: (data: ProfileUpdateDto) => profileApi.updateInfo(data),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "个人信息已成功更新",
      });
      setIsEditing(false);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "更新失败",
        description: error.response?.data?.msg || error.message || "更新个人信息失败",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // 过滤空值
    const updateData: ProfileUpdateDto = {};
    if (data.nick_name) updateData.nick_name = data.nick_name;
    if (data.email) updateData.email = data.email;
    if (data.phonenumber) updateData.phonenumber = data.phonenumber;
    if (data.sex) updateData.sex = data.sex;

    updateMutation.mutate(updateData);
  };

  const handleEdit = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
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
              <Settings className="h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>
              管理您的个人基本信息，点击编辑按钮进行修改
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 用户名（只读） */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                用户名
              </Label>
              <Input 
                value={profileInfo?.user_name || ""} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">用户名不可修改</p>
            </div>

            {/* 昵称 */}
            <FormField
              control={form.control}
              name="nick_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={!isEditing}
                      placeholder="请输入昵称"
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 邮箱 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={!isEditing}
                      type="email"
                      placeholder="请输入邮箱地址"
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 手机号码 */}
            <FormField
              control={form.control}
              name="phonenumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手机号码</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={!isEditing}
                      placeholder="请输入手机号码"
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 性别 */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>性别</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                        <SelectValue placeholder="请选择性别" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 操作按钮 */}
            {isEditing && (
              <div className="flex items-center gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? "保存中..." : "保存"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  取消
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
