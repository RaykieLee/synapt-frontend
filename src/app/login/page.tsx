"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveLoginInfo } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      console.log('Attempting to login with URL:', `${apiUrl}/api/v1/login`);
      const response = await fetch(`${apiUrl}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }).toString(),
        credentials: 'same-origin',
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.detail || "登录失败");
      }

      // 使用auth服务保存登录信息（包括token和用户数据）
      saveLoginInfo(data);
      
      // 显示成功提示
      toast({
        title: "登录成功",
        description: `欢迎回来，${data.user_info.nickName || data.user_info.userName}`,
      });
      
      // 跳转到仪表板
      router.push("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : "登录时发生错误");
      
      // 显示错误提示
      toast({
        title: "登录失败",
        description: err instanceof Error ? err.message : "登录时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold">人工智能应用平台</h2>
          </div>
          <CardTitle className="text-xl">登录系统</CardTitle>
          <CardDescription>请输入您的账号和密码登录系统</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="请输入用户名"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="请输入密码"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-gray-500 mt-4">
            © {new Date().getFullYear()} 人工智能应用平台. 版权所有.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 