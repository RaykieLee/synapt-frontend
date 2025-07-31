"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import { profileApi } from "@/api/profile";
import { PROFILE_VALIDATION } from "@/types/profile";

// 表单验证schema
const passwordSchema = z.object({
  old_password: z.string().min(1, "请输入当前密码"),
  new_password: z.string()
    .min(PROFILE_VALIDATION.password.minLength, PROFILE_VALIDATION.password.message)
    .max(PROFILE_VALIDATION.password.maxLength, PROFILE_VALIDATION.password.message),
  confirm_password: z.string().min(1, "请确认新密码"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "新密码和确认密码不一致",
  path: ["confirm_password"],
}).refine((data) => data.old_password !== data.new_password, {
  message: "新密码不能与当前密码相同",
  path: ["new_password"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function PasswordChangeTab() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // 修改密码
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => profileApi.changePassword(data),
    onSuccess: () => {
      toast({
        title: "密码修改成功",
        description: "您的密码已成功修改，请妥善保管",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "密码修改失败",
        description: error.response?.data?.msg || error.message || "密码修改失败",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    switch (field) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          密码修改
        </CardTitle>
        <CardDescription>
          为了您的账户安全，请定期更换密码。密码长度应在6-20个字符之间
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 当前密码 */}
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当前密码</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showOldPassword ? "text" : "password"}
                        placeholder="请输入当前密码"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('old')}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 新密码 */}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showNewPassword ? "text" : "password"}
                        placeholder="请输入新密码（6-20个字符）"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 确认新密码 */}
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认新密码</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="请再次输入新密码"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 密码安全提示 */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">密码安全建议：</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 密码长度至少6个字符，建议8个字符以上</li>
                <li>• 包含大小写字母、数字和特殊字符</li>
                <li>• 不要使用生日、姓名等容易猜测的信息</li>
                <li>• 定期更换密码，不要重复使用旧密码</li>
              </ul>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {changePasswordMutation.isPending ? "修改中..." : "修改密码"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
