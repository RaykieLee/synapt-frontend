"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/services/auth";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 认证检查
  useEffect(() => {
    // 使用服务中的isLoggedIn函数检查登录状态
    const loggedIn = isLoggedIn();
    setIsAuthenticated(loggedIn);
    
    if (!loggedIn) {
      // 保存当前路径以便登录后重定向
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      // 使用Next.js的router进行客户端导航
      router.push('/login');
    }
  }, [router]);

  // 如果未认证，显示加载中
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">正在验证身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
} 