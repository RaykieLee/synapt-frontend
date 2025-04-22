"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/info`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error("认证失败");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("获取用户信息失败:", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 