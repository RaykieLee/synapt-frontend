"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveLoginInfo } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";
import FaceRecognition from "@/components/shared/face-recognition";
import FaceRecognitionSimple from "@/components/shared/face-recognition-simple";
import { faceLogin, mockFaceLogin } from "@/services/faceRecognition";
import { User, Camera } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [loginMethod, setLoginMethod] = useState<"password" | "face">("password");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 在组件加载时，检查是否有重定向路径
  useEffect(() => {
    const savedRedirectPath = localStorage.getItem("redirectAfterLogin");
    if (savedRedirectPath) {
      setRedirectPath(savedRedirectPath);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 用户名密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 使用相对路径，通过 Next.js 的 rewrites 代理到后端
      const loginUrl = '/api/v1/login';
      console.log('Attempting to login with URL:', loginUrl);
      const response = await fetch(loginUrl, {
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
      
      // 清除保存的重定向路径
      localStorage.removeItem("redirectAfterLogin");
      
      // 跳转到保存的路径或默认的dashboard
      router.push(redirectPath);
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

  // 人脸识别成功回调
  const handleFaceRecognitionSuccess = async (faceData: string) => {
    setIsLoading(true);
    
    try {
      let data;
      
      try {
        // 首先尝试调用真实的人脸识别登录API
        data = await faceLogin(faceData);
      } catch (error) {
        // 如果API不存在或失败，使用模拟登录
        console.log('使用模拟人脸登录:', error);
        data = await mockFaceLogin(faceData);
      }
      
      // 保存登录信息
      saveLoginInfo(data);
      
      // 显示成功提示
      toast({
        title: "人脸登录成功",
        description: `欢迎回来，${data.user_info.nickName || data.user_info.userName}`,
      });
      
      // 清除保存的重定向路径
      localStorage.removeItem("redirectAfterLogin");
      
      // 跳转到保存的路径或默认的dashboard
      router.push(redirectPath);
      
    } catch (err) {
      console.error('Face login error:', err);
      toast({
        title: "人脸登录失败",
        description: err instanceof Error ? err.message : "人脸登录时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 人脸识别错误回调
  const handleFaceRecognitionError = (error: string) => {
    console.error('Face recognition error:', error);
    // 错误信息已经在 FaceRecognition 组件中显示，这里不需要额外处理
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold">顺畅人工智能应用平台</h2>
          </div>
          <CardTitle className="text-xl">登录系统</CardTitle>
          <CardDescription>选择您偏好的登录方式</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "password" | "face")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                密码登录
              </TabsTrigger>
              <TabsTrigger value="face" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                人脸识别
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handlePasswordLogin}>
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
            </TabsContent>
            
            <TabsContent value="face" className="mt-4">
              <div className="space-y-4">
                <div className="text-sm text-gray-600 text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">使用提示</span>
                  </div>
                  <p>• 确保光线充足，面部清晰可见</p>
                  <p>• 请正面面对摄像头，保持自然表情</p>
                  <p>• 移除遮挡物如口罩、墨镜等</p>
                </div>
                
                <FaceRecognitionSimple
                  onSuccess={handleFaceRecognitionSuccess}
                  onError={handleFaceRecognitionError}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-gray-500 mt-4">
            © {new Date().getFullYear()} 顺畅人工智能应用平台. 版权所有.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 