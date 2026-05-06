"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// 移除未使用的 Card 相关组件（原布局已自定义容器）
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveLoginInfo } from "@/services/auth";
import { secureLogin } from "@/utils/secure-auth";
import { useToast } from "@/components/ui/use-toast";
import FaceRecognitionSimple, { FaceRecognitionSimpleHandle } from "@/components/shared/face-recognition-simple";
import { faceLogin as faceLoginService } from "@/services/faceRecognition";
import { User, Camera } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [loginMethod, setLoginMethod] = useState<"password" | "face">("password");
  const faceRef = useRef<FaceRecognitionSimpleHandle | null>(null);
  const faceRetryTimer = useRef<NodeJS.Timeout | null>(null);
  const faceAttempting = useRef(false);
  const FACE_RETRY_INTERVAL = 2000; // 2s
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
      // 使用安全登录（RSA加密）
      const data = await secureLogin(formData.username, formData.password);

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

  const attemptFaceLogin = useCallback(async () => {
    if (faceAttempting.current) return; // avoid overlap
    const frame = faceRef.current?.capture();
    if (!frame) return; // camera not ready yet
    faceAttempting.current = true;
    setIsLoading(true);
    try {
      const data = await faceLoginService(frame);
      saveLoginInfo(data);
      toast({ title: "人脸登录成功", description: `欢迎回来，${data.user_info.nickName || data.user_info.userName}` });
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
      // success: stop retries
      if (faceRetryTimer.current) clearTimeout(faceRetryTimer.current);
      faceRetryTimer.current = null;
    } catch (err) {
      console.error('Face login error:', err);
  toast({ title: "人脸登录失败", description: err instanceof Error ? err.message : "人脸登录时发生错误", variant: "destructive" });
      // schedule retry
      faceRetryTimer.current = setTimeout(() => {
        faceAttempting.current = false; // allow next attempt
        attemptFaceLogin();
      }, FACE_RETRY_INTERVAL);
    } finally {
      faceAttempting.current = false;
      setIsLoading(false);
    }
  }, [redirectPath, router, toast]);

  // 初次进入“人脸识别”tab 2 秒后开始第一次尝试
  useEffect(() => {
    if (loginMethod === 'face') {
      if (faceRetryTimer.current) clearTimeout(faceRetryTimer.current);
      faceRetryTimer.current = setTimeout(() => {
        attemptFaceLogin();
      }, FACE_RETRY_INTERVAL);
    } else {
      // 切换走时清理
      if (faceRetryTimer.current) clearTimeout(faceRetryTimer.current);
      faceRetryTimer.current = null;
      faceAttempting.current = false;
    }
    return () => {
      if (faceRetryTimer.current) clearTimeout(faceRetryTimer.current);
    };
  }, [loginMethod, attemptFaceLogin]);

  // 供旧组件自动回调一次的兼容：如果组件内部 autoCapture 触发 onSuccess，可忽略，改为我们统一调度
  const handleFaceRecognitionSuccess = (_faceData: string) => {
    // 不直接登录，等待调度器 attemptFaceLogin 捕获
  };

  // 人脸识别错误回调
  const handleFaceRecognitionError = (error: string) => {
    console.error('Face recognition error:', error);
    // 错误信息已经在 FaceRecognition 组件中显示，这里不需要额外处理
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
        {/* 左侧：图片展示 */}
        <div className="relative hidden md:block md:w-1/2 bg-gray-100 dark:bg-gray-700">
          <Image
            src="/images/20221025.jpg"
            alt="平台功能展示图"
            fill
            priority
            sizes="(max-width: 768px) 0px, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/10 to-transparent" />
        </div>
        {/* 右侧：表单 */}
        <div className="flex flex-col md:w-1/2 w-full p-8 md:p-12">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-wide">顺畅人工智能应用平台</h1>
            <p className="mt-2 text-sm text-gray-500">请选择登录方式</p>
          </div>
          <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "password" | "face")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <User className="w-4 h-4" /> 密码登录
              </TabsTrigger>
              <TabsTrigger value="face" className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> 人脸识别
              </TabsTrigger>
            </TabsList>
            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handlePasswordLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" name="username" placeholder="请输入用户名" required value={formData.username} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input id="password" name="password" type="password" placeholder="请输入密码" required value={formData.password} onChange={handleChange} />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="face" className="mt-2">
              <FaceRecognitionSimple ref={faceRef} onSuccess={handleFaceRecognitionSuccess} onError={handleFaceRecognitionError} autoCapture={false} />
            </TabsContent>
          </Tabs>
          <div className="mt-auto pt-8 text-center text-xs text-gray-400">© {new Date().getFullYear()} 顺畅人工智能应用平台. 版权所有.</div>
        </div>
      </div>
    </div>
  );
} 